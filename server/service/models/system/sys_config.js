const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_config = sequelize.define('sys_config', {
  configId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '参数主键',
    field: 'config_id'
  },
  configName: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '参数名称',
    field: 'config_name'
  },
  configKey: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '参数键名',
    field: 'config_key'
  },
  configValue: {
    type: DataTypes.STRING(500),
    defaultValue: '',
    comment: '参数键值',
    field: 'config_value'
  },
  configType: {
    type: DataTypes.CHAR(1),
    defaultValue: 'N',
    comment: '系统内置（Y是 N否）',
    field: 'config_type'
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
    allowNull: true,
    comment: '备注'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '参数配置表'
});
