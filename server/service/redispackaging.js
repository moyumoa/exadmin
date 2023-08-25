const redis = require('redis')

const redispkg = require('../config/qredis')

// 创建客户端
const redisClient = redis.createClient({host:redispkg.host,port:redispkg.port,password:redispkg.password})

// 监听 redis 连接异常
redisClient.on('error', err => {
  console.error(err)
})

// 设置值
function set(key, val, time="") {
  if(typeof val === 'object') {
    val = JSON.stringify(val)
  }
  if (time) {
    redisClient.set(key, val, 'ex', time, redis.print)
  } else {
    redisClient.set(key, val, redis.print)
  }
  
}
// 获取值
function get(key) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if(err) {
        console.error(err)
        reject(err)
        return
      }
      if(val === null) {
        resolve(null)
        return
      }
      // 如果是json对象进行解析
      try{
        resolve(
          JSON.parse(val)
        )
      } catch(ex) {
        // 如果不是json对象，直接返回
        resolve(val)
      }
    })
  })
}
// 删除
function del(key) {
  redisClient.del(key, redis.print)
}
// 判断键是否存在
function exists(key) {
  redisClient.exists('key',redis.print)
}

// 查看过期时间
function ttl (key) {
  return new Promise((resolve, reject) => {
    redisClient.ttl(key, (err, val) => {
      if(err) {
        console.error('ttl', err)
        reject(err)
        return
      }
      resolve(val)
    })
  })
}

module.exports = {
  set,
  get,
  del,
  exists,
  ttl
}