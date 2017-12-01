/**
 * 遍历目录工具
 */

const fs = require('fs');
const { join } = require('path');

// const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
const matchOperatorsRe = new RegExp('[|\\\\{}()[\\]^$+*?.]', 'g');

/**
 * 转义正则
 *
 * @param {string} str
 * @returns
 */
function escapeRegexp(str) {
  return str.replace(matchOperatorsRe, '\\$&');
}

/**
 * 遍历目录
 *
 * @param {string} path
 * @param {RegExp} pattern
 * @param {boolean} [depth=false]
 * @returns
 */
function walk(path, pattern, depth = false) {
  const files = fs.readdirSync(path);
  let fileList = [];

  files.forEach((name) => {
    const filePath = join(path, name);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && pattern.test(filePath)) {
      fileList.push(filePath);
    } else if (depth && stat.isDirectory()) {
      const list = walk(filePath, pattern, depth);
      fileList = fileList.concat(list);
    }
  });

  return fileList;
}

/**
 * 遍历目录
 *
 * @param {string} path
 * @param {RegExp|string|string[]} pattern
 * @param {boolean} [depth=true]
 * @returns
 */
function walkdir(path, pattern, depth = true) {
  if (!(pattern instanceof RegExp)) {
    if (typeof pattern === 'string') {
      pattern = RegExp(`${escapeRegexp(pattern)}$`, 'i');
    } else if (pattern instanceof Array) {
      pattern = `(?:${pattern.map(escapeRegexp).join('|')})$`;
      pattern = RegExp(pattern, 'i');
    } else {
      pattern = /./;
    }
  }
  return walk(path, pattern, depth);
}

module.exports = walkdir;
