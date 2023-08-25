const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_job = sequelize.define('sys_job', {
  jobId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '任务ID',
    field: 'job_id'
  },
  jobName: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: '',
    comment: '任务名称',
    field: 'job_name'
  },
  jobGroup: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: 'DEFAULT',
    comment: '任务组名',
    field: 'job_group'
  },
  invokeTarget: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '调用目标字符串',
    field: 'invoke_target'
  },
  cronExpression: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'cron执行表达式',
    field: 'cron_expression'
  },
  misfirePolicy: {
    type: DataTypes.STRING(20),
    defaultValue: '3',
    comment: '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
    field: 'misfire_policy'
  },
  concurrent: {
    type: DataTypes.CHAR(1),
    defaultValue: '1',
    comment: '是否并发执行（0允许 1禁止）'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '状态（0正常 1暂停）'
  },
  createBy: {
    type: DataTypes.STRING(64),
    defaultValue: '',
    comment: '创建者',
    field: 'create_by'
  },
  createTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '创建时间',
    field: 'create_time'
  },
  updateBy: {
    type: DataTypes.STRING(64),
    defaultValue: '',
    comment: '更新者',
    field: 'update_by'
  },
  updateTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '更新时间',
    field: 'update_time'
  },
  remark: {
    type: DataTypes.STRING(500),
    defaultValue: '',
    comment: '备注信息'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '定时任务调度表',
  indexes: [
    {
      unique: true,
      fields: ['jobId', 'jobName', 'jobGroup']
    }
  ]
});
