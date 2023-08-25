const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 根据实际路径修改
const { sys_menu } = require('./sys_menu');
const { sys_dept } = require('./sys_dept');


// 角色表
exports.sys_role = sequelize.define('sys_role', {
  roleId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '角色ID',
    field: 'role_id'
  },
  roleName: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: '角色名称',
    field: 'role_name'
  },
  roleKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '角色权限字符串',
    field: 'role_key'
  },
  roleSort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '显示顺序',
    field: 'role_sort'
  },
  dataScope: { // 数据范围（1：全部数据权限；2：自定数据权限；3：本部门数据权限；4：本部门及以下数据权限；5: 仅本人权限）
    type: DataTypes.CHAR(1),
    defaultValue: '1',
    comment: '数据范围',
    field: 'data_scope'
  },
  menuCheckStrictly: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '菜单树选择项是否关联显示',
    field: 'menu_check_strictly'
  },
  deptCheckStrictly: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '部门树选择项是否关联显示',
    field: 'dept_check_strictly'
  },
  status: {
    type: DataTypes.CHAR(1),
    allowNull: false,
    comment: '角色状态'
  },
  delFlag: {
    type: DataTypes.CHAR(1),
    defaultValue: '0',
    comment: '删除标志',
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
    defaultValue: null,
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
    defaultValue: null,
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
  comment: '角色信息表',
  defaultScope: {
    where: {
      delFlag: '0',
      status: '0',
      roleId: { [Op.not]: 0 }
    }
  }
});

// 角色和部门关联表
exports.sys_role_dept = sequelize.define('sys_role_dept', {
  roleId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true, // 这个字段不是主键 加这个属性只是为了防止每次查的时候自动带id
    comment: '角色ID',
    field: 'role_id',
  },
  deptId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '部门ID',
    field: 'dept_id',
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '角色和部门关联表',
});

// 角色和菜单关联表
exports.sys_role_menu = sequelize.define('sys_role_menu', {
  roleId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '角色ID',
    field: 'role_id'
  },
  menuId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '菜单ID',
    field: 'menu_id',
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '角色和菜单关联表'
});

this.sys_role_menu.belongsTo(sys_menu, { foreignKey: 'menuId', as: 'menu' });
sys_menu.hasMany(this.sys_role_menu, { foreignKey: 'menuId', as: 'sys_role_menus' });

this.sys_role.belongsToMany(sys_menu, { through: this.sys_role_menu, foreignKey: 'roleId', otherKey: 'menuId', as: 'menus' });

this.sys_role.belongsTo(this.sys_role_menu, { foreignKey: 'roleId', as: 'roleToMenu' })

sys_menu.belongsToMany(this.sys_role, { through: this.sys_role_menu, foreignKey: 'menuId', otherKey: 'roleId', as: 'roles' });

this.sys_role_dept.belongsTo(sys_dept, { foreignKey: 'deptId', as: 'roleDept' });

this.sys_role.belongsTo(sys_dept, { foreignKey: 'roleId', as: 'roleToDept' });

this.sys_role.hasMany(this.sys_role_menu, { foreignKey: 'role_id', as: 'sys_role_menus' });
