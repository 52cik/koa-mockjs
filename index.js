const fs = require('fs');
const { join, resolve } = require('path');
const MockLite = require('mockjs-lite');

const template = fs.readFileSync(join(__dirname, 'doc', 'document.html'), 'utf8');
const reDoc = new RegExp('^\\s*\\/\\*\\*[^*]+\\*\\s*([^\\r\\n]+)[\\s\\S]+?@url\\s+([^\\r\\n]+)[\\s\\S]+?\\*\\/');

/**
 * Cross-Origin Resource Sharing(CORS)
 * Reference koa/cors
 */
function cors(ctx) {
  const requestOrigin = ctx.get('Origin');
  ctx.vary('Origin');

  if (!requestOrigin) {
    return;
  }

  ctx.set('Access-Control-Allow-Origin', requestOrigin);

  if (ctx.method === 'OPTIONS') {
    ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
    const allowHeaders = ctx.get('Access-Control-Request-Headers');
    if (allowHeaders) {
      ctx.set('Access-Control-Allow-Headers', allowHeaders);
    }
  }
}

/**
 * walk dir sync
 *
 * @param {string} path
 * @param {RegExp} pattern
 * @returns
 */
function walkdir(path, pattern) {
  const files = fs.readdirSync(path);
  let fileList = [];

  files.forEach((name) => {
    const filePath = join(path, name);
    const stat = fs.statSync(filePath);

    if (pattern.test(filePath) && stat.isFile()) {
      fileList.push(filePath);
    } else if (stat.isDirectory()) {
      const list = walkdir(filePath, pattern);
      fileList = fileList.concat(list);
    }
  });

  return fileList;
}

/**
 * load mock data
 *
 * @param {object} opts
 */
function loadMockData(opts) {
  const ret = {};

  if (!fs.existsSync(opts.root)) {
    return ret;
  }

  const files = walkdir(opts.root, /\.js(?:on)?$/);

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8').trim() || '{}';
    const m = content.match(reDoc);

    let url = '';
    let describe = 'no description';

    if (m) {
      url = m[2].trim();
      describe = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
    }

    if (url[0] !== '/') { // fix url path
      url = `/${url}`;
    }

    const item = { file, url, describe };

    try {
      if (/\.js$/.test(file)) {
        item.data = require(file); // eslint-disable-line
      } else {
        item.data = new Function('return (' + content + ')')(); // eslint-disable-line
      }
    } catch (err) {
      item.url = ''; // bad
      item.data = {};
      item.describe = 'Error Mock tpl';
      err.type = 'Mock loading error';
      err.file = file;
      if (typeof opts.error === 'function') {
        opts.error(err);
      }
    }

    const key = url.split('?')[0];
    ret[key] = item;
  });

  return ret;
}

/**
 * render document page
 */
function document(ctx, data) {
  const href = ctx.href.replace(/\/$/, '');
  const list = Object.keys(data)
    .map((it) => {
      const { describe, url, file } = data[it];
      return {
        title: describe,
        url: `${href}${url}`,
        file,
      };
    })
    .sort((a, b) => String(a.file).localeCompare(b.file));

  return template.replace('@menuList', JSON.stringify(list));
}

/**
 * Serve mock from `root`.
 *
 * @param {string} root
 * @param {object} [opts]
 * @return {Function}
 * @api public
 */

function serve(path, opts) {
  const root = opts ? (opts.root || opts) : null;

  if (typeof opts === 'string') {
    opts = { root };
  }

  if (typeof root !== 'string') {
    throw new Error('root directory is required to serve files');
  }

  const fixPath = path.replace(/\/?$/, '');

  opts.root = resolve(root);
  opts.rePrefix = new RegExp(`^${fixPath.replace(/[.\\[\]{}()|^$?*+]/g, '\\$&')}(?:/|$)`);

  return (ctx, next) => {
    if (!opts.rePrefix.test(ctx.path)) {
      return next();
    }

    cors(ctx, opts);

    if (ctx.method === 'OPTIONS') {
      ctx.body = '';
      return;
    }

    const mockdata = loadMockData(opts);
    const newPath = ctx.path.replace(opts.rePrefix, '/');

    if (newPath === '/') {
      ctx.body = document(ctx, mockdata);
      return;
    }

    if (mockdata[newPath] === undefined) {
      return;
    }

    let { data } = mockdata[newPath];

    if (typeof data === 'function') {
      data = data(ctx, MockLite);
    }

    if (data === false) {
      return;
    }

    ctx.body = MockLite.mock(data || {});
  };
}

/**
 * Expose `serve()`.
 */

module.exports = serve;
