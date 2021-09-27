/* eslint-disable func-names */
const { cloneDeep, merge } = require('lodash');

function stripDotSlashPrefix(path) {
  return path.replace(/^\.\//, '');
}

module.exports = function (entry, opts) {
  let clone = cloneDeep(opts);
  const stripedEntry = stripDotSlashPrefix(entry);
  if (clone.overridesByEntry) {
    Object.keys(clone.overridesByEntry).forEach((key) => {
      const stripedKey = stripDotSlashPrefix(key);
      if (stripedKey !== key) {
        clone.overridesByEntry[stripedKey] = clone.overridesByEntry[key];
      }
    });
    if (clone.overridesByEntry[stripedEntry]) {
      clone = merge(clone, clone.overridesByEntry[stripedEntry]);
    }
    delete clone.overridesByEntry;
  }
  return clone;
};
