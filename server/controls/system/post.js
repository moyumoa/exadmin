const { sys_dept } = require('@/db/system/sys_dept')
const { sys_post } = require('@/db/system/sys_post')
const { Op } = require('sequelize')
const { sequelize } = require('@/service/sequelize')
const { sys_user_post } = require('@/db/system/sys_user')

exports.getPost = async (req, res) => {
  if (req.params.postId === 'list') {
    postList(req, res)
    return
  }

  getPostById(req, res)
}

// 获取岗位列表(分页)
const postList = async (req, res) => {
  const { pageNum, pageSize, postCode, postName, status } = req.query
  try {
    const { count: total, rows } = await sys_post.findAndCountAll({
      where: {
        status: { [Op.not]: '' },
        ...$utils.query_like({
          [postCode]: ['postCode'],
          [postName]: ['postName'],
          [status]: 'status'
        })
      },
      ...$utils.query_page(pageNum, pageSize, 'ascending', 'postSort'),
    })

    res.send({
      code: 200,
      msg: '查询成功',
      rows,
      total,
    })
  } catch (error) {
    log.error('岗位查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 根据岗位id查询岗位信息
const getPostById = async (req, res) => {
  const { postId } = req.params
  try {
    const post = await sys_post.findOne({
      where: { postId, status: { [Op.not]: '' } },
    })

    res.send({
      code: 200,
      msg: '查询成功',
      data: post,
    })
  } catch (error) {
    log.error('岗位查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取岗位列表 除了传入的postId
exports.getPostListExclude = async (req, res) => {
  const { postId } = req.params
  try {
    const posts = await sys_post.findAll({
      where: {
        [Op.not]: {
          postId: postId,
          status: ''
        }
      }
    })

    res.send({
      code: 200,
      msg: '查询成功',
      data: posts,
    })
  } catch (error) {
    log.error('岗位查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 新增岗位
exports.addPost = async (req, res) => {
  const allowedFields = ['postId', 'postCode', 'postName', 'postSort', 'status', 'createBy', 'createTime', 'updateBy', 'updateTime', 'remark']
  const post = $utils.filterKey(req.body, allowedFields)

  try {
    const result = await sys_post.create({
      ...post,
      createBy: `${req.user.userName}-${req.user.nickName}`,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      createTime: new Date(),
      updateTime: new Date(),
    })
    res.send({
      code: 200,
      msg: '新增成功',
      data: result,
    })
  } catch (error) {
    log.error('岗位新增失败', error)
    res.send({
      code: -1,
      msg: '新增失败',
    })
  }
}

// 修改岗位
exports.updatePost = async (req, res) => {
  const { postId, ...updateData } = req.body
  try {
    const [rowsAffected] = await sys_post.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: {
        postId,
        status: { [Op.not]: '' },
      },
      fields: Object.keys(updateData),
    })
    if (rowsAffected > 0) {
      res.send({
        code: 200,
        msg: '修改成功',
      })
    } else {
      res.send({
        code: -1,
        msg: '岗位不存在或无字段更新',
      })
    }
  } catch (error) {
    log.error('岗位修改失败', error)
    res.send({
      code: -1,
      msg: '修改失败',
    })
  }
}

// 删除岗位
exports.deletePost = async (req, res) => {
  const { postId } = req.params
  const transaction = await sequelize.transaction()
  try {
    // 删除岗位用户关联
    await sys_user_post.destroy({
      where: {
        postId,
      },
      transaction
    })
    const result = await sys_post.destroy({
      where: {
        postId,
      },
      transaction
    })
    await transaction.commit()
    res.send({
      code: 200,
      msg: '删除成功',
    })
  } catch (error) {
    log.error('岗位删除失败', error)
    await transaction.rollback()
    res.send({
      code: -1,
      msg: '删除失败',
    })
  }
}

