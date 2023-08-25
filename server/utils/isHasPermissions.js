const { sys_user, sys_user_role } = require('@/db/system/sys_user'); // 用户表
const { sys_role_menu } = require('@/db/system/sys_role'); // 角色表
const { sys_menu } = require('@/db/system/sys_menu'); // 菜单表
const { Op } = require('sequelize');

class IsHasPermits {
  constructor(permissions) {
    this.permissions = permissions
  }

  async verify (req, res, next) {
    const { role, system } = req.user
    if (system) { return next() }

    const roleIds = role && Array.isArray(role) ? role.map(item => item.roleId) : [role?.roleId]

    const userPermissions = await sys_role_menu.findAll({
      where: { roleId: roleIds },
      include: [
        {
          model: sys_menu,
          as: 'menu',
          attributes: ['menuId', 'perms'],
          where: { status: '0', perms: this.permissions },
          required: true,
        },
      ],
      group: ['menuId', 'perms'] // 使用联结查询的方式进行去重
    })

    if (userPermissions.length > 0) {
      return next()
    } else {
      return res.send({ code: 403, msg: '暂无权限' })
    }
  }
}

module.exports = (permissions) => {
  return (req, res, next) => {
    const verifyPerms = new IsHasPermits(permissions)
    return verifyPerms.verify(req, res, next)
  }
}
