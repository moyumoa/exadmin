const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_job_log = sequelize.define('sys_job_log', {
  jobLogId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '任务日志ID',
    field: 'job_log_id'
  },
  jobName: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '任务名称',
    field: 'job_name'
  },
  jobGroup: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '任务组名',
    field: 'job_group'
  },
  invokeTarget: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '调用目标字符串',
    field: 'invoke_target'
  },
  jobMessage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '日志信息',
    field: 'job_message'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '执行状态（0正常 1失败）'
  },
  exceptionInfo: {
    type: DataTypes.STRING(2000),
    defaultValue: '',
    comment: '异常信息',
    field: 'exception_info'
  },
  createTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '创建时间',
    field: 'create_time'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '定时任务调度日志表'
});
