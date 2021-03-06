# koa-mockjs

> 基于 Koa2 的 mock api 服务中间件

[![Linux Build][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![node][node-image]][node-url]
[![license MIT][license-image]][license-url]


## 环境需求

> `node6` 或 `node8`, `koa2`

## 如何使用

### 安装

``` sh
$ yarn add -D koa-mockjs
# 或者
$ npm i -D koa-mockjs
```

----

### 快速开始

1. 创建目录 `api-server` 然后创建 `app.js` 内容如下：

``` js
const { join } = require('path');
const Koa = require('koa');
const mock = require('koa-mockjs');

const app = new Koa();

// 使用默认路径 '/'（不推荐）
// app.use(mock('/', join(__dirname, 'mocks')));

// 自定义路径 '/api'
app.use(mock('/api', join(__dirname, 'mocks')));

// 这里可以添加你的自定义代码。

app.listen(3000, () => {
  console.log('mock server run at http://localhost:3000/api/');
});
```

2. 在 `api-server` 下创建 `mocks` 目录，然后创建 `test.json` 内容如下:

```js
/**
 * 接口描述
 *
 * @url /test-api
 */
{
  "code": 0,
  "result|5": [
    {
      "uid|+1": 1,
      "name": "@cname",
      "email": "@email"
    }
  ]
}
```

3. 安装依赖模块

```sh
$ yarn add -D koa koa-mockjs
```

4. 启动

```sh
$ node app.js
```

> 然后你可以访问 <http://localhost:3000/api> 查看API文档。


----

### Mock JSON 文档

* [Mock.js 0.1 文档](https://github.com/nuysoft/Mock/wiki)  
* [Mock 例子](http://mockjs-lite.js.org/docs/examples.html)  


### 例子

```
api-server
├── mocks
    ├── home
    ⎪   ├── data.json
    ├── user
    ⎪   ├── data.js
    ⎪   ├── data.json
    ├── game
        ├── data.json
```



## data.json

`Mock JSON` 不是一个真正的 JSON 文件, 更像是 JS 文件, 所以你可以发挥你的想象了。

> 假设我们有个文件 'mocks/home/test.json' 内容为:

``` js
/**
 * 接口描述
 *
 * @url /api-access-path
 *
 * GET: 请求方法及参数
 *   uid 这是请求的用户ID
 *
 * 参数描述和其他说明。
 * uid: 用户ID
 * name: 用户名
 * email: 邮箱
 * 等等其他描述.
 */

{
  "code": 0,
  "result|5": [
    {
      "uid|+1": 1,
      "name": "@cname",
      "email": "@email"
    }
  ]
}
```

然后你可以访问 <http://localhost:3000/api/api-access-path> 查看实际效果.

当然，你也可以直接使用js文件书写。

``` js
/**
 * 首页 - 友情链接
 *
 * @url /home-links
 *
 * 在这里你可以写详细的说明参数的信息
 */

module.exports = {
  code() { // 1/10 的概率返回错误码 1.
    return Math.random() < 0.1 ? 1 : 0;
  },
  "list|5-10": [
    {"title": "@title", "link": "@url"}
  ]
};
```

或者直绑定函数：

``` js
/**
 * 用户页面 - 用户信息
 *
 * @url /user?uid=233
 *
 * GET: 请求方法及参数
 *   uid 这是请求的用户ID
 *
 * 在这里你可以写详细的说明参数的信息
 */

module.exports = (ctx) => {
  // koa 的 cxt 对象
  const { uid } = req.query;

  if (!uid) { // 当没有用户ID时返回错误信息
    return {
      code: -1,
      msg: 'no uid',
    }
  }

  return { // 返回mock的用户信息，但用户id固定
    code: 0,
    data: {
      "uid": +uid,
      "name": "@cname",
      "age|20-30": 1,
      "email": "@email",
      "date": "@date",
    },
  };
};
```



[travis-url]: https://travis-ci.org/52cik/koa-mockjs
[travis-image]: https://img.shields.io/travis/52cik/koa-mockjs/master.svg?label=linux

[coveralls-url]: https://coveralls.io/github/52cik/koa-mockjs?branch=master
[coveralls-image]: https://coveralls.io/repos/52cik/koa-mockjs/badge.svg?branch=master&service=github

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

[dependencies-url]: https://david-dm.org/52cik/koa-mockjs
[dependencies-image]: https://img.shields.io/david/52cik/koa-mockjs.svg?style=flat

[node-url]: https://nodejs.org
[node-image]: https://img.shields.io/badge/node-%3E%3D%200.10.0-brightgreen.svg


[nodemon]: https://nodemon.io
