import fs from 'fs';
import typescript from 'typescript';

const debug = require('debug')('webpack:resolveConfigFile');

export default async function resolveConfigFile(resolvedPath) {
  debug('TS config start load');

  const start = Date.now();

  const code = await bundleConfigFile(resolvedPath);

  const tempPath = `${resolvedPath}.js`;

  fs.writeFileSync(tempPath, code);

  // no cache
  delete require.cache[tempPath];

  const userConfig = require(tempPath).default;

  fs.unlinkSync(tempPath);

  debug(`TS config loaded in ${Date.now() - start}ms`);

  return userConfig;
}

async function bundleConfigFile(fileName) {
  const contents = fs.readFileSync(fileName, {
    encoding: 'utf8',
  });

  const output = typescript.transpile(contents, {
    target: 'ES5',
    esModuleInterop: true,
  });

  return output;
}
