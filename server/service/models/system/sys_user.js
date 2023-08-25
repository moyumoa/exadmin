const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize');
const { sys_role, sys_role_menu } = require('./sys_role');
const { sys_dept } = require('./sys_dept');
const { sys_menu } = require('./sys_menu');
const { sys_post } = require('./sys_post');

exports.sys_user = sequelize.define('sys_user', {
  userId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '用户ID',
    field: 'user_id',
  },
  deptId: {
    type: DataTypes.BIGINT,
    comment: '部门ID',
    field: 'dept_id'
  },
  userName: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: '用户账号',
    field: 'user_name'
  },
  nickName: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: '用户昵称',
    field: 'nick_name'
  },
  userType: {
    type: DataTypes.STRING(2),
    defaultValue: '00',
    comment: '用户类型（00系统用户）',
    field: 'user_type'
  },
  email: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    comment: '用户邮箱'
  },
  phonenumber: {
    type: DataTypes.STRING(11),
    defaultValue: '',
    comment: '手机号码'
  },
  sex: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '用户性别（0男 1女 2未知）'
  },
  avatar: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '头像地址'
  },
  password: {
    type: DataTypes.STRING(100),
    defaultValue: '',
    comment: '密码'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '帐号状态（0正常 1停用）'
  },
  delFlag: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '删除标志（0代表存在 2代表删除）',
    field: 'del_flag'
  },
  loginIp: {
    type: DataTypes.STRING(128),
    defaultValue: '',
    comment: '最后登录IP',
    field: 'login_ip'
  },
  loginDate: {
    type: DataTypes.DATE,
    comment: '最后登录时间',
    field: 'login_date'
  },
  createBy: {
    type: DataTypes.STRING(64),
    defaultValue: '',
    comment: '创建者',
    field: 'create_by'
  },
  createTime: {
    type: DataTypes.DATE,
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
    comment: '更新时间',
    field: 'update_time'
  },
  remark: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    comment: '备注'
  }
}, {
  underscored: true, // 是否支持驼峰
  timestamps: false, // 禁用默认的时间戳字段
  charset: 'utf8mb4', // 字符集
  comment: '用户信息表',
  defaultScope: {
    where: {
      delFlag: '0'
    }
  }
});

// 用户与角色关联表
exports.sys_user_role = sequelize.define('sys_user_role', {
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID',
    field: 'user_id'
  },
  roleId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '角色ID',
    field: 'role_id'
  }
}, {
  timestamps: false, // 禁用默认的时间戳字段
  charset: 'utf8mb4', // 字符集
  comment: '用户和角色关联表'
});

// 用户与岗位关联表
exports.sys_user_post = sequelize.define('sys_user_post', {
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID',
    field: 'user_id'
  },
  postId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '岗位ID',
    field: 'post_id'
  }
}, {
  timestamps: false, // 禁用默认的时间戳字段
  charset: 'utf8mb4', // 字符集
  comment: '用户与岗位关联表'
});

this.sys_user.belongsToMany(sys_role, { through: this.sys_user_role, foreignKey: 'userId', otherKey: 'roleId', as: 'roles' });
this.sys_user.belongsTo(sys_dept, { foreignKey: 'deptId', as: 'dept' });

sys_role.belongsToMany(this.sys_user, { through: this.sys_user_role, foreignKey: 'roleId', otherKey: 'userId', as: 'roleToUser' });

this.sys_user.belongsToMany(sys_post, { through: this.sys_user_post, foreignKey: 'userId', otherKey: 'postId', as: 'userPosts' });
sys_post.belongsToMany(this.sys_user, { through: this.sys_user_post, foreignKey: 'postId', otherKey: 'userId', as: 'postUsers' });

this.sys_user_role.belongsToMany(sys_menu, {
  through: sys_role_menu, // 中间表的名称
  foreignKey: 'roleId', // 与UserRole相关的外键字段
  otherKey: 'menuId', // 与RoleMenu相关的外键字段
  as: 'menus' // 别名，用于访问相关的菜单数据
});


this.sys_user_role.belongsTo(sys_role_menu, { foreignKey: 'roleId', as: 'roleMenus' });