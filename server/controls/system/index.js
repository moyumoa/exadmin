// const { findUserById, findUsersByPage, createUser, updateUser } = require('@/db/system/sys_user');

const {sys_user} = require('@/db/system/sys_user'); // 用户表
const {sys_role, sys_role_menu} = require('@/db/system/sys_role'); // 角色表
const {sys_dept} = require('@/db/system/sys_dept'); // 部门表
const {sys_menu} = require('@/db/system/sys_menu'); // 菜单表
const {Op} = require('sequelize');

// 获取用户信息
const uinfos = async (userId) => {
  try {
    const user = await sys_user.findByPk(userId, {
      include: [
        {
          model: sys_role,
          as: 'roles',
          attributes: ['roleId', 'roleKey'],
          include: [
            {
              model: sys_menu,
              as: 'menus',
              attributes: ['menuId', 'perms'],
              through: {
                model: sys_role_menu,
                attributes: []
              },
              where: {
                perms: {[Op.not]: ''} // 过滤非空 perms
              },
              required: false, // 设置 required 为 false 在查询关联数据时不强制要求匹配的结果
            },
          ],
          group: ['roleId', 'menu.perms'], // 使用联结查询的方式进行去重
          required: false
        },
        {
          model: sys_dept,
          as: 'dept',
          required: false
        },
      ],
    })

    if (!user) {
      return null; // 用户不存在
    }

    const isSuperAdmin = user.roles.some(role => role.roleKey === 'admin') || user.userId === 0;

    const permissions = isSuperAdmin ? ['*:*:*'] : Array.from(new Set(user.roles
      .flatMap(role => role.menus.map(menu => menu.perms))))

    return {
      msg: '操作成功',
      code: 200,
      permissions: permissions,
      roles: user.userId === 0 ? 'system' : user.roles.map(role => role.roleKey),
      user: {
        admin: isSuperAdmin,
        ...user.dataValues,
        roles: user.roles.map(role => {
          const {menus, ...roleData} = role.dataValues;
          return {
            ...roleData,
            permissions: isSuperAdmin ? ['*:*:*'] : role.menus.map(menu => menu.perms)
          };
        })
      },
    };
  } catch (error) {
    log.error('error', error)
    throw error;
  }
}

// 函数用于生成树状结构
const generateTree = (menuList, parentId = 0) => {
  const tree = [];
  for (const menu of menuList) {
    if (menu.parentId === parentId) {
      const node = {
        // name: 使用menu.path 首字母大写
        name: menu.path.charAt(0).toUpperCase() + menu.path.slice(1),
        path: parentId === 0 && menu.isFrame === 1 ? `/${menu.path}` : menu.path,
        hidden: menu.visible !== '0',
        // redirect: 'noRedirect',
        component: parentId === 0 ? 'Layout' : menu.component,
        // alwaysShow: menu.children ? true : false, // 是否始终显示子菜单
        meta: {
          title: menu.menuName, // 使用 menuName 作为 title
          icon: menu.icon,
          noCache: menu.isCache !== 0, // 将 isCache 转换为 noCache
          link: menu.isFrame === 0 && menu.path ? menu.path : null // 使用 path 作为 link
        },
        // children: generateTree(menuList, menu.menuId) // 递归生成子菜单
      };
      const children = generateTree(menuList, menu.menuId);
      if (children.length > 0) {
        node.children = children;
        node.redirect = 'noRedirect'
        node.alwaysShow = true; // 如果有子菜单，设置 alwaysShow 为 true
      }
      tree.push(node);
    }
  }
  return tree;
}

exports.getRouters = async (req, res) => {
  const {role, system} = req.user
  const roleIds = role && Array.isArray(role) ? role.map(item => item.roleId) : [role?.roleId]
  try {
    // 如果是超级管理员，则返回所有菜单
    if (system) {
      const menus = await sys_menu.findAll({
        where: {
          menuType: { [Op.or]: ['M', 'C'] },
        },
        order: ['orderNum']
      })
      // 将查询结果转换为期望的数据结构
      const transformedMenus = menus.map(menu => menu.dataValues)
      // 生成树状结构
      const menuTree = generateTree(transformedMenus);
      // 构建最终的返回数据结构
      return res.send({
        msg: '操作成功',
        code: 200,
        data: menuTree
      });
    }
    const userMenus = await sys_role_menu.findAll({
      where: {
        roleId: roleIds, // 根据需要查询的用户 ID 进行筛选
      },
      include: [
        {
          model: sys_menu,
          as: 'menu',
          attributes: ['menuId', 'menuName', 'parentId', 'orderNum', 'path', 'component', 'isFrame', 'visible', 'icon', 'isCache'],
          where: {
            menuType: {[Op.or]: ['M', 'C']},
          },
        }
      ],
      group: ['menuId'],
    })

    // 将查询结果转换为期望的数据结构
    // const [transformedMenus] = userMenus.map(userMenu => userMenu.sys_role_menu.dataValues.menu)
    const transformedMenus = userMenus.map(userMenu => userMenu.menu).sort((a, b) => a.orderNum - b.orderNum)

    // 生成树状结构
    const menuTree = generateTree(transformedMenus);

    // 构建最终的返回数据结构
    res.send({
      msg: '操作成功',
      code: 200,
      data: menuTree,
      userMenus
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: error
    })
  }
}

exports.getInfo = async (req, res) => {
  const {id} = req.user
  uinfos(id).then(result => {
    res.send(result);
  }).catch(error => {
    log.error('error', error)
    res.send({
      msg: '操作失败',
      code: 500,
      error: error,
    });
  })
}