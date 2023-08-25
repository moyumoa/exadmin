
const express = require('express');
const expressJwt = require('express-jwt');
const { secretKey } = require('../config/encryption')
const routeGather = require('./gather');
const router = express.Router();

const { tokenMiddleware } = require('../utils/tokenMiddleware')

/**
 * @expressJwt 配置全局token验证
 * @secret Token加密公共部分
 * @algorithms 加密方式
 * @unless 配置路由白名单(不需要验证token的路由,支持数组、字符串、正则)
 * 
 */
const jwtAuth = expressJwt({
  secret: secretKey,
  algorithms: ['HS256']
}).unless({
  path: [
    '/login',
    '/logout',
    '/favicon.ico',
    '/test',
    '/read',
    /^\/public\/.*/,
   
  ]
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'uginx' });
});


router.use(jwtAuth, (req, res, next) => {
  tokenMiddleware(req, res)
  next()
})
routeGather(router); // 添加路由

module.exports = router;
