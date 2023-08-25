const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/encryption');
const rateLimit = require('express-rate-limit')

// 中间件：Token 校验和刷新
exports.tokenMiddleware = (req, res) => {
  if (req?.user?.exp) {
    // 检查是否需要刷新 Token
    const currentTime = Math.floor(Date.now() / 1000);
    const refreshThreshold = 60 * 60 * 2; // 剩余时间小于 2 小时时刷新 Token
    const shouldRefreshToken = req.user.exp - currentTime < refreshThreshold;
    // console.log('token剩余时长',shouldRefreshToken, req.user.exp - currentTime)

    if (shouldRefreshToken) {
      // 在这里获取原有 Token 中的信息
      const originalTokenPayload = req.user;
      delete req.user.iat
      delete req.user.exp
      // 生成一个新的 Token
      const newToken = jwt.sign(originalTokenPayload, secretKey, { expiresIn: '24h' });
      // 将新的 Token 发送给客户端
      res.header('Authorization', 'Bearer ' + newToken);
      return
    }
    res.header('Authorization', '');
  }
};

exports.limiter = rateLimit({
  windowMs: 1000 * 5, // 限制時間
  max: 1, // 限制请求数量
  delayMs: 0, // 延时
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // 在所有响应上启用请求限制X-RateLimit-Limit）和当前使用情况X-RateLimit-Remaining）的标头，并在超过max时在重试（Retry-After等待时间。默认值true
  status: 429,
  message: { code: 429, msg: '访问过于频繁' }
})