const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_oper_log = sequelize.define('sys_oper_log', {
  operId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '日志主键',
    field: 'oper_id'
  },
  title: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: '模块标题'
  },
  businessType: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '业务类型（0其它 1新增 2修改 3删除）',
    field: 'business_type'
  },
  method: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '方法名称'
  },
  requestMethod: {
    type: DataTypes.STRING(10),
    defaultValue: '',
    comment: '请求方式',
    field: 'request_method'
  },
  operatorType: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '操作类别（0其它 1后台用户 2手机端用户）',
    field: 'operator_type'
  },
  operName: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: '操作人员',
    field: 'oper_name'
  },
  deptName: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: '部门名称',
    field: 'dept_name'
  },
  operUrl: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: '请求URL',
    field: 'oper_url'
  },
  operIp: {
    type: DataTypes.STRING(128),
    defaultValue: '',
    comment: '主机地址',
    field: 'oper_ip'
  },
  operLocation: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: '操作地点',
    field: 'oper_location'
  },
  operParam: {
    type: DataTypes.STRING(2000),
    defaultValue: '',
    comment: '请求参数',
    field: 'oper_param'
  },
  jsonResult: {
    type: DataTypes.STRING(2000),
    defaultValue: '',
    comment: '返回参数',
    field: 'json_result'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '操作状态（0正常 1异常）'
  },
  errorMsg: {
    type: DataTypes.STRING(2000),
    defaultValue: '',
    comment: '错误消息',
    field: 'error_msg'
  },
  operTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '操作时间',
    field: 'oper_time'
  },
  costTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: '消耗时间',
    field: 'cost_time'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '操作日志记录'
});
