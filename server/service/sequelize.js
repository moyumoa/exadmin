const Sequelize = require('sequelize');

const mysqlConfig = {
  database: process.env.MYSQL_DB,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  dialect: 'mysql',
  pool: {
    max: 1000, // 最大连接数
    min: 2, // 最小连接数
    acquire: 30000, // 连接超时时间
    idle: 10000, // 释放连接间隔时间
    multipleStatements: true, // 是否允许执行多条sql语句
    charset: 'utf8mb4', // 字符集
  },
  timezone: '+08:00', // 东八时区
  // logging: false, // 关闭日志
  logging: (sql, options) => {
    if (options.type === 'ERROR') {
      console.log(sql.replace(/\?/g, value => `"${options.bind.shift()}"`));
    }
  },
  define: {
    freezeTableName: true, // 禁用修改表名
    paraniod: true, // 禁用软删除
    underscored: true, // 是否支持驼峰
    timestamps: false, // 禁用默认的时间戳字段
    charset: 'utf8mb4', // 字符集
    createdAt: 'create_time', // 自定义创建时间字段
    updatedAt: 'update_time', // 自定义更新时间字段
    deletedAt: 'delete_time', // 自定义删除时间字段
  },

  dialectOptions: {
    dateStrings: true, // 格式化日期和时间字段为字符串
    typeCast: true, // 启用类型转换
  },
};

const mysql_sequelize = new Sequelize(mysqlConfig)

const connectAndSyncDatabase = async ()=> {
  try {
    await mysql_sequelize.authenticate();
    console.log('后台 - 已连接到数据库');
    
    await mysql_sequelize.sync();
    console.log('后台 - 数据库同步成功');
  } catch (error) {
    console.error('后台 - 无法连接或同步数据库:', error);
  }
}

module.exports = { sequelize: mysql_sequelize, connectAndSyncDatabase };
