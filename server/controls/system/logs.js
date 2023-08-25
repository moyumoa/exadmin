const { sys_logininfor } = require('@/db/system/sys_logininfor')
const { Op } = require('sequelize')

// 获取登录日志列表(分页)
exports.getLoginLog = async (req, res) => {
  const { pageNum, pageSize, ipaddr, userName, status, params } = req.query
  try {
    const { count: total, rows } = await sys_logininfor.findAndCountAll({
      where: {
        ...$utils.query_like({
          [status]: 'status',
          [ipaddr]: 'ipaddr',
          [userName]: 'userName',
        }),
        ...$utils.query_times({ loginTime: params })
      },
      ...$utils.query_page(pageNum, pageSize, 'DESC', 'loginTime'),
    })

    res.send({
      code: 200,
      msg: '查询成功',
      rows,
      total,
    })
  } catch (error) {
    log.error('登录日志查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 删除登录日志
exports.deleteLoginLog = async (req, res) => {
  const { infoId } = req.params
  try {
    await sys_logininfor.destroy({
      where: {
        infoId: {
          [Op.in]: infoId.split(',')
        }
      }
    })
    res.send({
      code: 200,
      msg: '删除成功',
    })
  } catch (error) {
    log.error('删除登录日志失败', error)
    res.send({
      code: -1,
      msg: '删除失败',
    })
  }
}

// 清空登录日志
exports.cleanLoginLog = async (req, res) => {
  try {
    await sys_logininfor.destroy({
      where: {}, // 没有任何条件，将删除所有记录
      truncate: true, // 设置为 true 来清空表
    });

    res.send({
      code: 200,
      msg: '清空成功',
    });
  } catch (error) {
    log.error('清空登录日志失败', error);
    res.send({
      code: -1,
      msg: '清空失败',
    });
  }
};

// 新增登录日志
exports.addLoginLog = async (req, res) => {
  const { userName, status, ipaddr, msg, params } = req.body
  try {
    const data = await sys_logininfor.create({
      userName,
      status,
      ipaddr,
      msg,
      params,
      createTime: new Date(),
    })
    res.send({
      code: 200,
      msg: '新增成功',
      data,
    })
  } catch (error) {
    log.error('新增登录日志失败', error)
    res.send({
      code: -1,
      msg: '新增失败',
    })
  }
}


