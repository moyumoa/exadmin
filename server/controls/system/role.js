const { sys_user, sys_user_post, sys_user_role } = require('@/db/system/sys_user')
const { sys_role, sys_role_menu, sys_role_dept } = require('@/db/system/sys_role')
const { sys_menu } = require('@/db/system/sys_menu')
const { sys_dept } = require('@/db/system/sys_dept')
const { sys_post } = require('@/db/system/sys_post')
const { Op } = require('sequelize')
const { sequelize } = require('@/service/sequelize')

/* 角色管理 */

// 生成树结构
const generateTree = (menuList, parentId = 0) => {
  const tree = [];
  for (const menu of menuList) {
    if (menu.parentId === parentId) {
      const node = {
        id: menu.deptId,
        label: menu.deptName,
      };
      const children = generateTree(menuList, menu.deptId);
      if (children.length > 0) {
        node.children = children;
      }
      tree.push(node);
    }
  }
  return tree;
}

exports.getRole = async (req, res) => {
  if (req.params.id === 'list') {
    roleList(req, res)
    return
  }

  if (req.params.id === 'deptTree') {
    getDeptTree(req, res)
    return
  }

  getRoleById(req, res)
}

// 获取角色列表
const roleList = async (req, res) => {
  const { pageNum, pageSize, roleName, roleKey, status, params, orderByColumn = 'roleSort', isAsc = 'ascending' } = req.query
  const where = {
    ...$utils.query_like({
      [roleName]: 'roleName',
      [roleKey]: 'roleKey',
    }),
    ...$utils.query_eq({
      [status]: 'status',
    }),
    ...$utils.query_times({ createTime: params }),
    status: { [Op.not]: '' },
  }


  try {
    const { count: total, rows } = await sys_role.findAndCountAll({
      where,
      ...$utils.query_page(pageNum, pageSize, isAsc, orderByColumn),
    })
    res.send({
      code: 200,
      msg: '查询成功',
      rows,
      total
    })
  } catch (error) {
    log.error('角色列表查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取指定用户角色信息
const getRoleById = async (req, res) => {
  try {
    const role = await sys_role.findOne({
      where: { roleId: req.params.id, status: { [Op.not]: '' } }
    })
    res.send({
      code: 200,
      msg: '查询成功',
      data: {
        admin: role.dataValues.createBy === 'admin',
        ...role.dataValues,
      },
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取部门树和当前用户拥有的部门ID列表
const getDeptTree = async (req, res) => {
  const { roleId } = req.params
  try {
    const deptIds = await sys_role_dept.findAll({
      attributes: ['deptId'],
      where: { roleId },
      include: [{
        model: sys_dept,
        as: 'roleDept',
        attributes: ['deptId', 'parentId', 'deptName'],
      }],
      raw: true
    })

    const deptsList = deptIds.map(item => ({
      deptId: item['roleDept.deptId'],
      parentId: item['roleDept.parentId'],
      deptName: item['roleDept.deptName']
    }))

    // const deptsTree = generateTree(deptsList)

    // // 递归函数，用于获取树节点的最后一个 children 的 id
    // const getLastChildrenIds = (list) => {
    //   const ids = [];
    //   for (const item of list) {
    //     if (item.children && item.children.length > 0) {
    //       // getLastChildrenIds(item.children)
    //       const childIds = getLastChildrenIds(item.children);
    //       ids.push(...childIds)
    //     } else {
    //       ids.push(item.id)
    //     }
    //   }
    //   return ids;
    // }
    // const lastChildrenIds = getLastChildrenIds(deptsTree)
    const getLastChildrenIds = (list, parentId = 0) => {
      const leafIds = []
      for (const item of list) {
        if (item.parentId === parentId) {
          const childrenLeafIds = getLastChildrenIds(list, item.deptId)
          if (childrenLeafIds.length > 0) {
            leafIds.push(...childrenLeafIds)
          } else {
            leafIds.push(item.deptId)
          }
        }
      }
      return leafIds
    }
    const lastChildrenIds = getLastChildrenIds(deptsList)

    const depts = await sys_dept.findAll()
    const deptTree = generateTree(depts.map(item => item.dataValues))
    res.send({
      code: 200,
      msg: '查询成功',
      checkedKeys: lastChildrenIds,
      depts: deptTree,
    })
  } catch (error) {
    log.error('error', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 新增角色
exports.addRole = async (req, res) => {
  const { roleName, roleKey, roleSort, status, menuIds, deptIds, menuCheckStrictly, deptCheckStrictly, dataScope, remark } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const newRole = await sys_role.create({
      roleName,
      roleKey,
      roleSort,
      status,
      menuCheckStrictly,
      deptCheckStrictly,
      dataScope, // 数据范围（1：全部数据权限；2：自定数据权限；3：本部门数据权限；4：本部门及以下数据权限；5: 仅本人权限）
      remark,
      createBy: `${req.user.userName}-${req.user.nickName}`, // 创建人
      updateBy: `${req.user.userName}-${req.user.nickName}`, // 更新人
      createTime: new Date(), // 创建时间
      updateTime: new Date(), // 更新时间
    }, { transaction });

    // 提取关联的菜单ID列表
    const menuIdList = menuIds || []; // 默认为空数组

    // // 处理数据范围逻辑
    // if (dataScope === '2' || dataScope === '4') {
    //   roleIdList.push(newRole.roleId);
    // }

    // 创建角色与菜单的关联记录
    if (menuIdList.length > 0) {
      const roleMenuAssociations = menuIdList.map(menuId => ({
        roleId: newRole.roleId,
        menuId: menuId,
      }));

      await sys_role_menu.bulkCreate(roleMenuAssociations, { transaction });
    }

    // 提取关联的部门ID列表
    const deptIdList = deptIds || []; // 默认为空数组

    // 创建角色与部门的关联记录
    if (deptIdList.length > 0) {
      const roleDeptAssociations = deptIdList.map(deptId => ({
        roleId: newRole.id,
        deptId: deptId,
      }));

      await sys_role_dept.bulkCreate(roleDeptAssociations, { transaction });
    }

    // 提交事务
    await transaction.commit();

    res.send({
      code: 200,
      msg: '新增成功',
    })

    // 返回响应或执行其他操作
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    log.error('角色新增失败', error)
    res.send({
      code: -1,
      msg: '新增失败',
    })
  }
}

// 修改角色
exports.updateRole = async (req, res) => {
  if (req.params.id === 'dataScope') {
    updateRoleDataScope(req, res)
    return
  }
  if (req.params.id === 'changeStatus') {
    changeRoleStatus(req, res)
    return
  }
  updateRoleInfo(req, res)
}

// 修改角色信息
const updateRoleInfo = async (req, res) => {
  // const { roleId, roleName, roleKey, roleSort, status, menuIds, deptIds, menuCheckStrictly, deptCheckStrictly, remark } = req.body;
  const { roleId, ...updateData } = req.body

  if (updateData.roleSort && !updateData.dataScope) {
    try {
      await sys_role.update({
        ...updateData,
        updateBy: `${req.user.userName}-${req.user.nickName}`, // 更新人
        updateTime: new Date(), // 更新时间
      }, {
        where: { roleId, status: { [Op.not]: '' } }
      });
      res.send({ code: 200, msg: '修改成功' })
    } catch (error) {
      log.error('角色修改失败', error)
      res.send({ code: -1, msg: '修改失败' })
    }
    return
  }

  const transaction = await sequelize.transaction();

  try {
    // 更新角色记录，包括menuCheckStrictly和deptCheckStrictly字段
    await sys_role.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`, // 更新人
      updateTime: new Date(), // 更新时间
    }, {
      where: { roleId, status: { [Op.not]: '' } },
      fields: Object.keys(updateData),
      transaction
    });

    // 提取关联的菜单ID列表
    const menuIdList = updateData.menuIds || []; // 默认为空数组

    // 创建角色与菜单的关联记录
    if (menuIdList.length > 0) {
      // 删除角色与菜单的关联记录
      await sys_role_menu.destroy({
        where: { roleId },
        transaction
      });

      const roleMenuAssociations = menuIdList.map(menuId => ({
        roleId,
        menuId,
      }));


      await sys_role_menu.bulkCreate(roleMenuAssociations, { transaction });
    } else {
      if (!updateData.menuIds) return
      // 删除角色与菜单的关联记录
      await sys_role_menu.destroy({
        where: { roleId },
        transaction
      });
    }

    // 提取关联的部门ID列表
    const deptIdList = updateData.deptIds || []; // 默认为空数组

    // 创建角色与部门的关联记录
    if (deptIdList.length > 0) {
      // 删除角色与部门的关联记录
      await sys_role_dept.destroy({
        where: { roleId },
        transaction
      });

      const roleDeptAssociations = deptIdList.map(deptId => ({
        roleId,
        deptId,
      }));

      await sys_role_dept.bulkCreate(roleDeptAssociations, { transaction });
    } else {
      // 删除角色与部门的关联记录
      await sys_role_dept.destroy({
        where: { roleId },
        transaction
      });
    }

    // 提交事务
    await transaction.commit();

    res.send({
      code: 200,
      msg: '修改成功',
    })

    // 返回响应或执行其他操作
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    log.error('角色修改失败', error)
    res.send({
      code: -1,
      msg: '修改失败',
    })
  }
}

// 修改角色数据权限
const updateRoleDataScope = async (req, res) => {
  const { roleId, dataScope, deptIds } = req.body;
  const transaction = await sequelize.transaction();
  try {
    // 更新角色记录，包括menuCheckStrictly和deptCheckStrictly字段
    const datas = await sys_role.update({
      dataScope,
      updateBy: `${req.user.userName}-${req.user.nickName}`, // 更新人
      updateTime: new Date(), // 更新时间
    }, {
      where: { roleId, status: { [Op.not]: '' } },
      transaction
    });

    // 提取关联的部门ID列表
    const deptIdList = deptIds || []; // 默认为空数组


    // 创建角色与部门的关联记录
    if (deptIdList.length > 0) {
      // // 删除角色与部门的关联记录
      // await sys_role_dept.destroy({
      //   where: { roleId },
      //   transaction
      // });

      // const roleDeptAssociations = deptIdList.map(deptId => ({
      //   roleId,
      //   deptId,
      // }));
      // await sys_role_dept.bulkCreate(roleDeptAssociations, { transaction });

      await sequelize.query(`DELETE FROM sys_role_dept WHERE role_id = ${roleId}`, { transaction });
      const insertSQL = `
        INSERT INTO sys_role_dept (role_id, dept_id)
        VALUES ${deptIdList.map(deptId => `(${roleId}, ${deptId})`).join(', ')}
      `;
      await sequelize.query(insertSQL, { transaction });
    } else {
      if (!deptIds) return
      // 删除角色与部门的关联记录
      await sys_role_dept.destroy({
        where: { roleId },
        transaction
      });
    }

    await transaction.commit();

    res.send({
      code: 200,
      msg: '修改成功',
    })

    // 返回响应或执行其他操作
  } catch (error) {
    log.error('角色修改失败', error)
    await transaction.rollback();
    res.send({
      code: -1,
      msg: '修改失败',
    })
  }
}

// 修改角色状态
const changeRoleStatus = async (req, res) => {

  const { roleId, status } = req.body;
  try {
    await sys_role.update({
      status,
      updateBy: `${req.user.userName}-${req.user.nickName}`, // 更新人
      updateTime: new Date(), // 更新时间
    }, {
      where: { roleId, status: { [Op.not]: '' } },
    });

    res.send({ code: 200, msg: '修改成功' })
  } catch (error) {
    log.error('角色状态修改失败', error)
    res.send({ code: -1, msg: '修改失败' })
  }
}

// 删除角色
exports.deleteRole = async (req, res) => {
  const { ids } = req.params;
  if (ids.split(',').includes('1')) {
    res.send({ code: -1, msg: '删除失败，请勿包含系统内置角色' })
    return
  }
  const transaction = await sequelize.transaction();
  try {
    await deleteRoleAndAssociations(req, ids.split(','), transaction);

    await transaction.commit();

    res.send({
      code: 200,
      msg: '删除成功',
    })

    // 返回响应或执行其他操作
  } catch (error) {
    await transaction.rollback();
    res.send({
      code: -1,
      msg: '删除失败',
    })
  }
}

// 删除角色及其关联数据
async function deleteRoleAndAssociations (req, roleIds, transaction) {
  try {
    // 删除角色本身
    await sys_role.update(
      {
        delFlag: 2,
        updateBy: `${req.user.userName}-${req.user.nickName}`,
        updateTime: new Date(),
      },
      {
        where: { roleId: roleIds },
        transaction,
      }
    );

    // 删除角色与菜单的关联记录
    await sys_role_menu.destroy({
      where: { roleId: roleIds },
      transaction,
    });

    // 删除角色与部门的关联记录
    await sys_role_dept.destroy({
      where: { roleId: roleIds },
      transaction,
    });

    // 删除角色与用户的关联记录
    await sys_user_role.destroy({
      where: { roleId: roleIds },
      transaction,
    });

    // ... 可以继续添加其他关联数据的删除操作

    // 返回成功状态
    return true;
  } catch (error) {
    log.error('角色删除失败', error);
    throw error;
  }
}