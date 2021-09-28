/* eslint-disable func-names */
import { join, extname, relative } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import vfs from 'vinyl-fs';
import signale from 'signale';
import rimraf from 'rimraf';
import through from 'through2';
import slash from 'slash';
import chokidar from 'chokidar';
import babel from '@babel/core';
import gulpTs from 'gulp-typescript';
import gulpLess from 'gulp-less';
import gulpIf from 'gulp-if';
import getBabelConfig from './getBabelConfig';

export default async function (opts) {
  const {
    cwd,
    rootPath,
    type,
    watch,
    importLibToEs,
    bundleOpts,
  } = opts;
  const {
    target = 'browser',
    runtimeHelpers,
    extraBabelPresets = [],
    extraBabelPlugins = [],
    browserFiles = [],
    nodeFiles = [],
    nodeVersion,
    disableTypeCheck,
    lessInBabelMode,
  } = bundleOpts;

  const srcPath = join(cwd, 'src');
  const targetDir = type === 'esm' ? 'es' : 'lib';
  const targetPath = join(cwd, targetDir);

  signale.info(`Clean ${targetDir} directory`);
  rimraf.sync(targetPath);

  function transform(opts) {
    const { file, type } = opts;
    signale.info(`[${type}] Transform: ${slash(file.path).replace(`${cwd}/`, '')}`);

    const babelOpts = getBabelConfig({
      target,
      type,
      typescript: true,
      runtimeHelpers,
      filePath: slash(relative(cwd, file.path)),
      browserFiles,
      nodeFiles,
      nodeVersion,
    });
    if (importLibToEs && type === 'esm') {
      babelOpts.plugins.push(require.resolve('./importLibToEs'));
    }
    babelOpts.presets.push(...extraBabelPresets);
    babelOpts.plugins.push(...extraBabelPlugins);

    return babel.transform(file.contents, {
      ...babelOpts,
      filename: file.path,
    }).code;
  }

  function getTSConfig() {
    const tsconfigPath = join(cwd, 'tsconfig.json');
    const templateTsconfigPath = join(__dirname, '../template/tsconfig.json');

    if (existsSync(tsconfigPath)) {
      return JSON.parse(readFileSync(tsconfigPath, 'utf-8')).compilerOptions || {};
    }
    if (rootPath && existsSync(join(rootPath, 'tsconfig.json'))) {
      return JSON.parse(readFileSync(join(rootPath, 'tsconfig.json'), 'utf-8')).compilerOptions || {};
    }
    return JSON.parse(readFileSync(templateTsconfigPath, 'utf-8')).compilerOptions || {};
  }

  function createStream(src) {
    const tsConfig = getTSConfig();
    const babelTransformRegexp = disableTypeCheck ? /\.(t|j)sx?$/ : /\.jsx?$/;

    function isTsFile(path) {
      return /\.tsx?$/.test(path) && !path.endsWith('.d.ts');
    }

    function isTransform(path) {
      return babelTransformRegexp.test(path) && !path.endsWith('.d.ts');
    }

    return vfs
      .src(src, {
        allowEmpty: true,
        base: srcPath,
      })
      // 开启类型校验且是ts文件
      .pipe(gulpIf((f) => !disableTypeCheck && isTsFile(f.path), gulpTs(tsConfig)))
      // 处理less文件
      .pipe(gulpIf((f) => lessInBabelMode && /\.less$/.test(f.path), gulpLess({ ...lessInBabelMode })))
      .pipe(gulpIf(
        (f) => isTransform(f.path),
        through.obj((file, env, cb) => {
          try {
            file.contents = Buffer.from(transform({
              file,
              type,
            }));
            // .jsx -> .js
            file.path = file.path.replace(extname(file.path), '.js');
            cb(null, file);
          } catch (e) {
            signale.error(`Compiled faild: ${file.path}`);
            console.log(e);
            cb(null);
          }
        }),
      ))
      .pipe(vfs.dest(targetPath));
  }

  return new Promise((resolve) => {
    createStream([
      join(srcPath, '**/*'),
    ]).on('end', () => {
      if (watch) {
        signale.info('Start watch', srcPath);
        chokidar
          .watch(srcPath, {
            ignoreInitial: true,
          })
          .on('all', (event, fullPath) => {
            const relPath = fullPath.replace(srcPath, '');

            signale.info(`[${event}] ${join(srcPath, relPath)}`);

            if (!existsSync(fullPath)) return;

            if (statSync(fullPath).isFile()) {
              createStream([fullPath]);
            }
          });
      }
      resolve();
    });
  });
}
