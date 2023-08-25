
const { MongoClient } = require('mongodb');

// 定义 MongoDB 连接 URL
const url = process.env.MONGODB_HOST;

// 定义要连接的数据库名称
const dbName = process.env.MONGODB_DB;

// 创建 MongoClient 实例
const client = new MongoClient(url, { useUnifiedTopology: true });

// 连接到数据库并返回数据库实例
async function connect() {
  try {
    await client.connect();
    // console.log('成功连接到 MongoDB');
    return client.db(dbName);
  } catch (err) {
    console.error('连接到 MongoDB 失败:', err);
    throw err;
  }
}

// 导出 connect 函数供其他模块使用
module.exports = { connect };
