const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改

exports.sys_dept = sequelize.define('sys_dept',
  {
    deptId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: '部门id',
      field: 'dept_id'
    },
    parentId: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: '父部门id',
      field: 'parent_id'
    },
    ancestors: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      comment: '祖级列表'
    },
    deptName: {
      type: DataTypes.STRING(30),
      defaultValue: '',
      comment: '部门名称',
      field: 'dept_name'
    },
    orderNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '显示顺序',
      field: 'order_num'
    },
    leader: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '负责人'
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: true,
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '邮箱'
    },
    status: {
      type: DataTypes.CHAR(1),
      defaultValue: '0',
      comment: '部门状态（0正常 1停用）'
    },
    delFlag: {
      type: DataTypes.CHAR(1),
      defaultValue: '0',
      comment: '删除标志（0代表存在 2代表删除）',
      field: 'del_flag'
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
    }
  }, {
  charset: 'utf8mb4', // 字符集
  comment: '部门表',
  defaultScope: {
    where: {
      delFlag: '0',
      status: '0',
    }
  }
});