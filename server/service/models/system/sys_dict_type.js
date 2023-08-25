const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

const { sys_dict_data } = require('./sys_dict_data');

exports.sys_dict_type = sequelize.define('sys_dict_type', {
  dictId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '字典主键',
    field: 'dict_id'
  },
  dictName: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '字典名称',
    field: 'dict_name'
  },
  dictType: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '字典类型',
    field: 'dict_type'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '状态（0正常 1停用）'
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
    defaultValue: null,
    comment: '备注'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '字典类型表',
  indexes: [
    {
      unique: true,
      fields: ['dict_type']
    }
  ]
});

this.sys_dict_type.belongsTo(sys_dict_data, { foreignKey: 'dictType', targetKey: 'dictType', as: 'dictData'});
