const http = require('http');
const { join } = require('path');

const Koa = require('koa');
const pify = require('pify');
const getPort = require('get-port');

const mock = require('..');

const host = 'localhost';
const app = new Koa();

app.use(mock('/api', join(__dirname, 'mocks')));

function createServer() {
  getPort().then((port) => {
    const s = http.createServer(app.callback());

    s.host = host;
    s.port = port;
    s.url = `http://${host}:${port}`;
    s.protocol = 'http';

    s.listen = pify(s.listen, Promise);
    s.close = pify(s.close, Promise);

    return s;
  });
}

module.exports = {
  host,
  createServer,
};
