// 开发环境redis配置
let dev_redis = {
  host: "127.0.0.1",  //地址
  password: "123456.",   //密码
  port: 6379,             //端口
  pool_max_num : 10,      //redis最多连接数
  pool_min_num : 2        //redis最少连接数
};
// 生产环境redis配置
let pro_redis = {
  host: "127.0.0.1",  //地址
  password: "123456.",   //密码
  port: 6379,             //端口
  pool_max_num : 200,      //redis最多连接数
  pool_min_num : 2        //redis最少连接数
};

let redis = process.env.NODE_ENV === 'prod' ? pro_redis : dev_redis;

module.exports = redis;