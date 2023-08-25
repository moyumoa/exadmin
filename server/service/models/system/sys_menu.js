const { DataTypes } = require('sequelize');
const { sequelize } = require('@/service/sequelize'); // 请根据实际路径进行修改


exports.sys_menu = sequelize.define('sys_menu', {
  menuId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '菜单ID',
    field: 'menu_id'
  },
  menuName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '菜单名称',
    field: 'menu_name'
  },
  parentId: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '父菜单ID',
    field: 'parent_id'
  },
  orderNum: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '显示顺序',
    field: 'order_num'
  },
  path: {
    type: DataTypes.STRING(200),
    defaultValue: '',
    comment: '路由地址'
  },
  component: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '组件路径'
  },
  query: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '路由参数'
  },
  isFrame: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '是否为外链（0是 1否）',
    field: 'is_frame'
  },
  isCache: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '是否缓存（0缓存 1不缓存）',
    field: 'is_cache'
  },
  menuType: {
    type: DataTypes.STRING(1),
    defaultValue: '',
    comment: '菜单类型（M目录 C菜单 F按钮）',
    field: 'menu_type'
  },
  visible: {
    type: DataTypes.CHAR(1),
    defaultValue: 0,
    comment: '菜单状态（0显示 1隐藏）'
  },
  status: {
    type: DataTypes.CHAR(1),
    defaultValue: 0,
    comment: '菜单状态（0正常 1停用）'
  },
  perms: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '权限标识'
  },
  icon: {
    type: DataTypes.STRING(100),
    defaultValue: '#',
    comment: '菜单图标'
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
    comment: '备注'
  }
}, {
  charset: 'utf8mb4', // 字符集
  comment: '菜单权限表',
  defaultScope: {
    where: {
      status: 0,
    }
  }
})


// exports.Menu.belongsToMany(Role, { through: RoleMenu, foreignKey: 'menuId', otherKey: 'roleId', as: 'roles' });

// this.Menu.belongsToMany(Role, { through: RoleMenu, foreignKey: 'menuId', otherKey: 'roleId', as: 'roles' });