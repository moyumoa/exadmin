const { sys_notice } = require('@/db/system/sys_notice')

exports.getNotice = async (req, res) => { 
  if(req.params.noticeId === 'list') {
    noticeList(req, res)
    return
  }

  getNoticeById(req, res)
}

// 获取通知公告列表(分页)
const noticeList = async (req, res) => {
  const { pageNum, pageSize, noticeTitle, noticeType, createBy, params } = req.query
  try {
    const { count: total, rows } = await sys_notice.findAndCountAll({
      where: {
        ...$utils.query_like({
          [noticeTitle]: ['noticeTitle'],
          [noticeType]: ['noticeType'],
          [createBy]: 'createBy'
        }),
        ...$utils.query_times({createTime: params})
      },
      ...$utils.query_page(pageNum, pageSize),
    })

    res.send({
      code: 200,
      msg: '查询成功',
      rows,
      total,
    })
  } catch (error) {
    log.error('通知公告查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取通知公告详情
const getNoticeById = async (req, res) => {
  const { noticeId } = req.params
  try {
    const notice = await sys_notice.findByPk(noticeId)
    notice.noticeContent = notice.noticeContent.toString()
    res.send({
      code: 200,
      msg: '查询成功',
      data: notice,
    })
  } catch (error) {
    log.error('通知公告查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 新增通知公告
exports.addNotice = async (req, res) => {
  const allowedFields = ['noticeId', 'noticeTitle', 'noticeType', 'noticeContent', 'status', 'createBy']
  const noticeReq = $utils.filterKey(req.body, allowedFields)

  try {
    const data = await sys_notice.create({
      ...noticeReq,
      createBy: `${req.user.userName}-${req.user.nickName}`,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      createTime: new Date(),
      updateTime: new Date(),
    })
    res.send({
      code: 200,
      msg: '新增成功',
      data,
    })
  } catch (error) {
    log.error('新增通知公告失败', error)
    res.send({
      code: -1,
      msg: '新增失败',
    })
  }
}

// 修改通知公告
exports.updateNotice = async (req, res) => {
  const { noticeId, ...updateData } = req.body

  try {
    const data = await sys_notice.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { noticeId },
      fields: Object.keys(updateData)
    })
    res.send({
      code: 200,
      msg: '修改成功',
      data,
    })
  } catch (error) {
    log.error('修改通知公告失败', error)
    res.send({
      code: -1,
      msg: '修改失败',
    })
  }
}

// 删除通知公告
exports.deleteNotice = async (req, res) => {
  const { noticeId } = req.params

  try {
    const data = await sys_notice.destroy({
      where: { noticeId: noticeId.split(',') }
    })
    res.send({
      code: 200,
      msg: '删除成功',
      data,
    })
  } catch (error) {
    log.error('删除通知公告失败', error)
    res.send({
      code: -1,
      msg: '删除失败',
    })
  }
}