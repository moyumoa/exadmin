const { sys_menu } = require('@/db/system/sys_menu')
const { sys_role_menu, sys_role } = require('@/db/system/sys_role')
const { sys_user_role } = require('@/db/system/sys_user')
const {Op} = require('sequelize')

// 生成树结构
const generateTree = (menuList, parentId = 0) => {
  const tree = [];
  for (const menu of menuList) {
    if (menu.parentId === parentId) {
      const node = {
        id: menu.menuId,
        label: menu.menuName,
      };
      const children = generateTree(menuList, menu.menuId);
      if (children.length > 0) {
        node.children = children;
      }
      tree.push(node);
    }
  }
  return tree;
}

exports.getMenu = async (req, res) => {
  if (req.params.id === 'list') {
    menuList(req, res)
    return
  }

  if (req.params.id === 'treeselect') {
    treeselect(req, res)
    return
  }

  if (req.params.id === 'roleMenuTreeselect') {
    roleMenuTreeselect(req, res)
    return
  }

  getMenuById(req, res)
}

// 获取所有菜单
const menuList = async (req, res) => {
  const { menuName } = req.query
  try {
    const menus = await sys_menu.findAll({
      where: {
        status: {[Op.not]: ''}, 
        ...$utils.query_like({
          [menuName]: ['menuName', 'path'],
        }),
      },
      order: ['orderNum']
    })

    res.send({
      code: 200,
      msg: '查询成功',
      data: menus,
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取菜单树
const treeselect = async (req, res) => {
  try {
    const menus = await sys_menu.findAll({
      order: [
        ['orderNum', 'ASC']
      ]
    })
    const menuTree = generateTree(menus.map(item => item.dataValues))
    res.send({
      code: 200,
      msg: '查询成功',
      data: menuTree,
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }

}

// 获取单个菜单
const getMenuById = async (req, res) => {
  try {
    const menu = await sys_menu.findOne({
      where: {
        menuId: req.params.id,
        status: {[Op.not]: ''},
      },
    })

    res.send({
      code: 200,
      msg: '查询成功',
      data: menu,
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取指定角色拥有的菜单和全部菜单树
const roleMenuTreeselect = async (req, res) => {
  try {
    const { roleId } = req.params
    const datas = await sys_role.findAll({
      where: { roleId, status: {[Op.not]: ''} },
      include: [
        {
          model: sys_role_menu,
          as: 'roleToMenu',
          attributes: ['menuId'],
        },
      ],
      raw: true,
    })
    const checkedKeys = datas.map(item => item['roleToMenu.menuId'])

    const menus = await sys_menu.findAll({
      order: [
        ['orderNum', 'ASC']
      ]
    })
    const menuTree = generateTree(menus.map(item => item.dataValues))
    res.send({
      code: 200,
      msg: '查询成功',
      checkedKeys,
      menus: menuTree,
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }

}

// 新增菜单
exports.addMenu = async (req, res) => { 
  const requestData = req.body;
  // 定义数据库已有的字段名
  const allowedFields = [ 'menuName', 'parentId', 'orderNum', 'path', 'component', 'query', 'isFrame', 'isCache', 'menuType', 'visible', 'status', 'perms', 'icon', 'remark' ]

  // 从请求数据中仅保留已定义的字段
  const filteredData = Object.keys(requestData)
    .filter(field => allowedFields.includes(field))
    .reduce((obj, field) => {
      obj[field] = requestData[field];
      return obj;
    }, {});

  try {
    const menu = await sys_menu.create({
      ...filteredData,
      createBy: `${req.user.userName}-${req.user.nickName}`,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      createTime: new Date(),
      updateTime: new Date(),
    });
    res.send({
      code: 200,
      msg: '新增成功',
      data: menu,
    });
  } catch (error) {
    log.error('error', error);
    res.send({
      code: -1,
      msg: '新增失败',
    });
  }
}

// 修改菜单
exports.updateMenu = async (req, res) => { 
  const { menuId, ...updateData } = req.body; // 解构出 menuId 和其他更新数据
  try {
    const [rowsAffected] = await sys_menu.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: {
        menuId,
        status: {[Op.not]: ''},
      },
      fields: Object.keys(updateData), // 仅更新指定的字段
    });
    if (rowsAffected > 0) {
      res.send({
        code: 200,
        msg: '修改成功',
      });
    } else {
      res.send({
        code: -1,
        msg: '菜单不存在或无字段更新',
      });
    }
  } catch (error) {
    log.error('error', error);
    res.send({
      code: -1,
      msg: '修改失败',
    });
  }
}

// 删除菜单
exports.deleteMenu = async (req, res) => { 
  try {
    const { menuId } = req.params
    const menu = await sys_menu.findOne({
      where: {
        menuId,
        status: {[Op.not]: ''},
      },
    })
    if (!menu) {
      res.send({
        code: -1,
        msg: '菜单不存在',
      })
      return
    }
    const children = await sys_menu.findAll({
      where: {
        parentId: menuId,
      },
    })
    if (children.length > 0) {
      res.send({
        code: -1,
        msg: '存在子菜单，不允许删除',
      })
      return
    }
    await sys_menu.destroy({
      where: {
        menuId,
        status: {[Op.not]: ''},
      },
    })
    res.send({
      code: 200,
      msg: '删除成功',
    })
  } catch (error) {
    log.error('error', error);
    res.send({
      code: -1,
      msg: '删除失败',
    });
  }
}
