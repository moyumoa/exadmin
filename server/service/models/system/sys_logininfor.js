const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_logininfor = sequelize.define('sys_logininfor', {
  infoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '访问ID',
    field: 'info_id'
  },
  userName: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: '用户账号',
    field: 'user_name'
  },
  ipAddr: {
    type: DataTypes.STRING(128),
    defaultValue: '',
    comment: '登录IP地址',
    field: 'ipaddr'
  },
  loginLocation: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: '登录地点',
    field: 'login_location'
  },
  browser: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: '浏览器类型'
  },
  os: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: '操作系统'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '登录状态（0成功 1失败）'
  },
  msg: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: '提示消息'
  },
  loginTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '访问时间',
    field: 'login_time'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '系统访问记录'
});
