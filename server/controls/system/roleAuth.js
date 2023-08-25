const { sys_user, sys_user_post, sys_user_role } = require('@/db/system/sys_user')
const { sys_role, sys_role_menu, sys_role_dept } = require('@/db/system/sys_role')
const { sys_menu } = require('@/db/system/sys_menu')
const { sys_dept } = require('@/db/system/sys_dept')
const { sys_post } = require('@/db/system/sys_post')
const { Op } = require('sequelize')
const { sequelize } = require('@/service/sequelize')


// 根据角色id查询角色用户(分页) pageNum=1&pageSize=10&roleId=2
exports.allocatedList = async (req, res) => {
  const { pageNum, pageSize, roleId, userName, phonenumber } = req.query
  try {
    const whereClause = {
      ...$utils.query_like({
        [userName]: ['userName', 'nickName'],
        [phonenumber]: 'phonenumber',
      })
    }

    const userIdsToExclude = await sys_user_role.findAll({ where: { roleId }, attributes: ['userId'], group: ['userId'] })
    // 提取用户 ID 列表
    const excludedUserIds = userIdsToExclude.map(user => user.userId)
    // 第二次查询，获取分页数据和总数
    const { count: total, rows } = await sys_user.findAndCountAll({
      distinct: true,
      where: { [Op.and]: [whereClause, { userId: excludedUserIds }], },
      ...$utils.query_page(pageNum, pageSize),
      include: [
        { model: sys_role, as: 'roles', through: { model: sys_user_role, attributes: [] }, required: false },
        { model: sys_dept, as: 'dept', required: false },
      ],
      required: false
    })

    res.send({ code: 200, msg: '查询成功', rows, total, })
  } catch (error) {
    log.error('查询角色用户失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取未分配用户列表(分页)
exports.unallocatedList = async (req, res) => {
  const { pageNum, pageSize, roleId, userName, phonenumber } = req.query
  try {
    const whereClause = {
      userId: { [Op.notIn]: [0, 1] },
      ...$utils.query_like({
        [userName]: ['userName', 'nickName'],
        [phonenumber]: 'phonenumber',
      })
    }

    // const { count: total, rows } = await sys_user.findAndCountAll({
    //   where: whereClause,
    //   ...$utils.query_page(pageNum, pageSize),
    //   include: [
    //     {
    //       model: sys_role,
    //       as: 'roles',
    //       through: {
    //         model: sys_user_role,
    //         attributes: [],
    //       },
    //       required: false,
    //       where: {
    //         // roleId: { [Op.not]: roleId }
    //       },
    //     },
    //     {
    //       model: sys_dept,
    //       as: 'dept',
    //     },
    //   ],
    //   distinct: true, // 确保查询结果去重
    // })

    /* 我尽力了 用户可能包含多个角色信息 为了确保total数量和数据的准确性 暂时只能分成两个sql来处理了 */
    // 第一次查询，获取已有角色的用户 ID
    const userIdsToExclude = await sys_user_role.findAll({ where: { roleId }, attributes: ['userId'] })
    // 提取用户 ID 列表
    const excludedUserIds = userIdsToExclude.map(user => user.userId)
    // 第二次查询，获取分页数据和总数
    const { count: total, rows } = await sys_user.findAndCountAll({
      distinct: true,
      where: {
        [Op.and]: [
          whereClause,
          { userId: { [Op.notIn]: excludedUserIds },  status: 0}, // 过滤掉已关联的用户
        ],
      },
      ...$utils.query_page(pageNum, pageSize),
      include: [
        {
          model: sys_role,
          as: 'roles',
          through: {
            model: sys_user_role,
            attributes: [],
          },
          required: false,
        },
        {
          model: sys_dept,
          as: 'dept',
          required: false
        },
      ],
      required: false
    })

    res.send({
      code: 200,
      msg: '查询成功',
      rows: rows,
      total: total,
    })

  } catch (error) {
    log.error('查询角色用户失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 取消授权
exports.cancelAuthUser = async (req, res) => {
  const { roleId, userId } = req.body
  try {
    await sys_user_role.destroy({
      where: { userId, roleId },
    })
    res.send({
      code: 200,
      msg: '取消授权成功',
    })
  } catch (error) {
    log.error('取消授权失败', error)
    res.send({
      code: -1,
      msg: '取消授权失败',
    })
  }
}

// 批量取消授权
exports.cancelAllAuthUser = async (req, res) => {
  const { roleId, userIds } = req.query
  const transaction = await sequelize.transaction()
  try {
    const datas = await sys_user_role.destroy({
      where: {
        userId: { [Op.in]: userIds.split(',') },
        roleId,
      },
      transaction
    })
    await transaction.commit()
    res.send({
      code: 200,
      msg: '取消授权成功',
    })
  } catch (error) {
    log.error('取消授权失败', error)
    await transaction.rollback()
    res.send({
      code: -1,
      msg: '取消授权失败',
    })
  }
}

// 批量授权 roleId=2&userIds=1,2,3 如果已存在则更新
exports.authorizeAllAuthUser = async (req, res) => {
  const { roleId, userIds } = req.query
  const ids = userIds.split(',')
  const transaction = await sequelize.transaction()

  try {
    const data = ids.map(userId => ({ userId, roleId }))

    await sys_user_role.bulkCreate(data, {
      transaction,
      updateOnDuplicate: ['userId', 'roleId'], // 冲突更新的字段
    })

    await transaction.commit()
    res.send({
      code: 200,
      msg: '添加授权成功',
    })
  } catch (error) {
    log.error('添加授权失败', error)
    await transaction.rollback()
    res.send({
      code: -1,
      msg: '添加授权失败',
    })
  }
}
