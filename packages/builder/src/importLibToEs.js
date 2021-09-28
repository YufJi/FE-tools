import { join, dirname } from 'path';
import fs from 'fs';
import signale from 'signale';

const cwd = process.cwd();

function replacePath(path) {
  if (path.node.source && /\/lib\//.test(path.node.source.value)) {
    const esModule = path.node.source.value.replace('/lib/', '/es/');
    const esPath = dirname(join(cwd, `node_modules/${esModule}`));
    if (fs.existsSync(esPath)) {
      signale.info(`[es build] replace ${path.node.source.value} with ${esModule}`);
      path.node.source.value = esModule;
    }
  }
}

export default function replaceLib() {
  return {
    visitor: {
      ImportDeclaration: replacePath,
      ExportNamedDeclaration: replacePath,
    },
  };
}
