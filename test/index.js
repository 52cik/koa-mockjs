import { join } from 'path';
import test from 'ava';
import Koa from 'koa';
import request from 'supertest';

import mock from '..';

const app = new Koa();
app.use(mock('/api', join(__dirname, 'helpers', 'mocks')));

const req = request(app.listen());

test('404 Not Found', async (t) => {
  await req.get('/').expect(404);
  await req.get('/api/the-api-not-fond').expect(404);
  t.pass();
});

test('API Document List', async (t) => {
  await req
    .get('/api')
    .expect('Content-Type', /html/)
    .expect(200, /API Document List - Koa Mock Server/);
  t.pass();
});

test('Base mock data number', async (t) => {
  await req
    .get('/api/base-number')
    .expect('Content-Type', /json/)
    .expect(200, /\{"number":\d+\}/);
  t.pass();
});

test('Base mock data string', async (t) => {
  await req
    .get('/api/base-string')
    .expect('Content-Type', /json/)
    .expect(200, /\{"string":"x{1,10}"\}/);
  t.pass();
});

test('Base mock data object', async (t) => {
  await req
    .get('/api/base-object')
    .expect('Content-Type', /json/)
    .expect(200, /\{"object":\{"\d{6}":".{3}","\d{6}":".{3}"\}\}/);
  t.pass();
});

test('Base mock data array', async (t) => {
  await req
    .get('/api/base-array')
    .expect('Content-Type', /json/)
    .expect(200, /\{"array":\["Mock.js"(,"Mock.js"){0,9}\]\}/);
  t.pass();
});

test('Base mock data random', async (t) => {
  const re = /{"date":"\d{4}(-\d{2}){2}","color":"#[\da-f]{6}","name":".{2,4}","mobile":"1[34578]\d{9}","email":"[\w.]+@[\w.]+"}/;
  await req
    .get('/api/base-random')
    .expect('Content-Type', /json/)
    .expect(200, re);
  t.pass();
});

test('Home mock data', async (t) => {
  await req
    .get('/api/home-data')
    .expect('Content-Type', /json/)
    .expect(200, /^{"code":\d,"data":\{"list":\[\{"title"/);
  await req
    .get('/api/home-links')
    .expect('Content-Type', /json/)
    .expect(200, /^\{"code":[01],"list":\[\{"title":"[^"]+","link":"[^"]+"\}/);
  t.pass();
});

test('User mock data', async (t) => {
  await req
    .get('/api/user-list')
    .expect('Content-Type', /json/)
    .expect(200, /^\{"code":\d,"data":\{"list":\[\{"id":\d,"name":/);
  await req
    .get('/api/user')
    .expect('Content-Type', /json/)
    .expect(200, { code: -1, msg: 'no uid' });
  await req
    .get('/api/user?uid=123')
    .expect('Content-Type', /json/)
    .expect(200, /^\{"code":0,"data":\{"uid":123,"name":/);
  t.pass();
});

test('Other mock data', async (t) => {
  await req
    .get('/api/other-list')
    .expect('Content-Type', /json/)
    .expect(200, /^\{"code":\d,"data":\{"list":\[\{"id":\d,"title":/);
  await req
    .get('/api/other-info')
    .expect('Content-Type', /json/)
    .expect(200, /^\{"code":\d,"data":\{"id":\d,"title":/);
  t.pass();
});

test('OPTIONS', async (t) => {
  await req
    .options('/api/base-number')
    .expect(200, '');
  await req
    .options('/api/base-number')
    .set('Origin', 'http://localhost')
    .set('Access-Control-Request-Headers', 'xCustom,haha')
    .expect('Access-Control-Allow-Headers', 'xCustom,haha')
    .expect(200, '');
  t.pass();
});
