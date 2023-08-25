const { sys_role_dept } = require('@/db/system/sys_role')
const { sys_dept } = require('@/db/system/sys_dept')
const { sys_post } = require('@/db/system/sys_post')
const { Op } = require('sequelize')
const { sequelize } = require('@/service/sequelize')


const generateDeptIds = (list, parentId = 0) => {
  const deptIds = []
  for (const item of list) {
    if (item.parentId === parentId) {
      deptIds.push(item.deptId)
      const childrenDeptIds = generateDeptIds(list, item.deptId)
      deptIds.push(...childrenDeptIds)
    }
  }
  return deptIds
}

// 返回最后一级的部门id
const getLastChildrenIds = (list, parentId = 0) => {
  const leafIds = []
  for (const menu of list) {
    if (menu.parentId === parentId) {
      const childrenLeafIds = getLastChildrenIds(list, menu.deptId)
      if (childrenLeafIds.length > 0) {
        leafIds.push(...childrenLeafIds)
      } else {
        leafIds.push(menu.deptId)
      }
    }
  }
  return leafIds
}

// 返回最后一级的部门id和父级id
const getLastChildrenAndParentIds = (list, parentId = 0, parentParentId = null) => {
  const leafAndParentIds = [];
  let lastLeafId = null;

  for (const menu of list) {
    if (menu.parentId === parentId) {
      lastLeafId = menu.deptId;
      leafAndParentIds.push(...getLastChildrenAndParentIds(list, menu.deptId, parentId));
    }
  }
  
  if (lastLeafId !== null && parentId !== 0) {
    leafAndParentIds.push({
      leafId: lastLeafId,
      parentId: parentParentId,
    });
  }
  
  return leafAndParentIds;
};


exports.getDataScopeWhere = async (req) => {
  const { system, role } = req.user
  const roleIds = role && Array.isArray(role) ? role.map(item => item.roleId) : [role?.roleId]
  const roleDataScope = role && Array.isArray(role) ? role.map(item => item.dataScope) : [role?.dataScope]
  const dataScopeNum = Array.from(new Set(roleDataScope.sort((a, b) => a - b)))

  try {
    const executePermissionLogic = async (where) => {
      if (where?.roleId) {
        const datas = await sys_role_dept.findAll({
          where,
          attributes: ['deptId'],
          group: ['deptId'],
          required: false,
          raw: true
        })

        const deptIds = await sys_dept.findAll({
          where: { deptId: datas.map(item => item.deptId) },
          attributes: ['deptId', 'parentId'],
          raw: true
        })
        return deptIds.map(item => item.deptId)
      }

      const datas = await sys_dept.findAll({
        where,
        attributes: ['deptId', 'parentId', 'ancestors'],
        raw: true
      })
      return datas.map(item => item.deptId)
    }

    // 数据范围（1：全部数据权限；2：自定数据权限；3：本部门数据权限；4：本部门及以下数据权限；5: 仅本人权限）
    const permissionActions = {
      '1': async () => ({ [Op.gte]: 0 }),
      '2': async () => executePermissionLogic({ roleId: roleIds }),
      '3': async () => executePermissionLogic({ deptId: req.user.deptId }),
      '4': async () => executePermissionLogic({
        [Op.or]: {
          deptId: req.user.deptId,
          ancestors: `${req.user.ancestors},${req.user.deptId}`,
        }
      }),
      '5': async () => ({ userId: req.user.id })
    }

    const matchedPermission = dataScopeNum.find(scope => permissionActions[scope])

    if (matchedPermission) {
      const result = await permissionActions[matchedPermission]()
      return result ? { [!result?.userId ? 'deptId' : 'userId']: result } : {}
    } else {
      if (system) {
        return { deptId: { [Op.gte]: 0 } }
      }
      throw new Error('没有匹配的权限')
    }
  } catch (error) {
    console.error('查询失败', error)
    throw error
  }
}
