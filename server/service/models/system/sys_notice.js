const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_notice = sequelize.define('sys_notice', {
  noticeId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '公告ID',
    field: 'notice_id'
  },
  noticeTitle: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '公告标题',
    field: 'notice_title'
  },
  noticeType: {
    type: DataTypes.CHAR(1),
    allowNull: false,
    comment: '公告类型（1通知 2公告）',
    field: 'notice_type'
  },
  noticeContent: {
    type: DataTypes.TEXT('long'),
    comment: '公告内容',
    field: 'notice_content'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '公告状态（0正常 1关闭）'
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
    type: DataTypes.STRING(255),
    defaultValue: null,
    comment: '备注'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '通知公告表'
});
