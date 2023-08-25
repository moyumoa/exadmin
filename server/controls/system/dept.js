const { sys_dept } = require('@/db/system/sys_dept')
const { sys_post } = require('@/db/system/sys_post')
const { sys_user } = require('@/db/system/sys_user')
const { Op } = require('sequelize')
const { sequelize } = require('@/service/sequelize')

exports.getDept = async (req, res) => {
  if (req.params.deptId === 'list') {
    deptList(req, res)
    return
  }

  getDeptById(req, res)
}

// 获取部门列表
const deptList = async (req, res) => {
  const { deptName, status } = req.query
  try {
    const depts = await sys_dept.findAll({
      where: {
        status: { [Op.not]: '' },
        // ...await $$dataScope(req),
        ...$utils.query_like({
          [deptName]: ['deptName'],
          [status]: 'status'
        }),
      },
      order: ['orderNum']
    })

    res.send({ code: 200, msg: '查询成功', data: depts })
  } catch (error) {
    log.error('部门查询失败', error)
    res.send({ code: -1, msg: '查询失败' })
  }
}

// 根据部门id查询部门信息
const getDeptById = async (req, res) => {
  const { deptId } = req.params
  try {
    const dept = await sys_dept.findOne({
      where: { deptId, status: { [Op.not]: '' } },
    })

    res.send({ code: 200, msg: '查询成功', data: dept })
  } catch (error) {
    log.error('部门查询失败', error)
    res.send({ code: -1, msg: '查询失败' })
  }
}

// 获取部门列表 除了传入的deptId
exports.getDeptListExclude = async (req, res) => {
  const { deptId } = req.params
  try {
    const depts = await sys_dept.findAll({
      where: {
        [Op.not]: { status: '', deptId },
      }
    })

    res.send({ code: 200, msg: '查询成功', data: depts })
  } catch (error) {
    log.error('部门查询失败', error)
    res.send({ code: -1, msg: '查询失败' })
  }
}

// 新增部门
exports.addDept = async (req, res) => {
  const allowedFields = ['parentId', 'deptName', 'orderNum', 'leader', 'phone', 'email', 'status', 'delFlag']
  const filteredData = $utils.filterKey(req.body, allowedFields)

  try {
    const parentDept = await sys_dept.findOne({
      where: { deptId: filteredData.parentId },
      attributes: ['deptId', 'ancestors'],
    });
    const ancestors = parentDept ? `${parentDept.ancestors},${parentDept.deptId}` : filteredData.parentId;

    const dept = await sys_dept.create({
      ...filteredData,
      ancestors,
      createBy: `${req.user.userName}-${req.user.nickName}`,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      createTime: new Date(),
      updateTime: new Date(),
    });

    res.send({ code: 200, msg: '新增成功', data: dept });
  } catch (error) {
    log.error('部门新增失败', error);
    res.send({ code: -1, msg: '新增失败' });
  }
}

// 修改部门
exports.updateDept = async (req, res) => {
  const { deptId, ...updateData } = req.body; // 解构出 deptId 和其他更新数据

  try {
    if (updateData.orderNum >= 0 && !updateData.parentId && updateData.parentId !== 0) {
      // 修改排序
      await sys_dept.update({
        ...updateData,
        updateBy: `${req.user.userName}-${req.user.nickName}`,
        updateTime: new Date(),
      }, {
        where: { deptId, status: { [Op.not]: '' } },
        fields: Object.keys(updateData), // 仅更新指定的字段
      });

      return res.send({ code: 200, msg: '修改成功' })
    }

    const parentDept = await sys_dept.findOne({
      where: { deptId: updateData.parentId, status: { [Op.not]: '' } },
      attributes: ['deptId', 'ancestors'],
    })
    const ancestors = parentDept ? `${parentDept.ancestors},${parentDept.deptId}` : updateData.parentId

    const [rowsAffected] = await sys_dept.update({
      ...updateData,
      ancestors,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { deptId, status: { [Op.not]: '' } },
      fields: Object.keys(updateData), // 仅更新指定的字段
    });

    if (rowsAffected > 0) {
      res.send({ code: 200, msg: '修改成功' });
    } else {
      res.send({ code: -1, msg: '部门不存在或无字段更新' });
    }
  } catch (error) {
    log.error('error', error);
    res.send({ code: -1, msg: '修改失败' });
  }
}

// 删除部门
exports.deleteDept = async (req, res) => {
  const { deptId } = req.params
  const transaction = await sequelize.transaction()
  try {
    const dept = await sys_dept.findOne({ where: { deptId, status: { [Op.not]: '' } } })

    if (dept) {
      const children = await sys_dept.findAll({
        where: { parentId: deptId }
      })

      if (children.length > 0) {
        res.send({ code: -1, msg: '存在下级部门,不允许删除' })
        return
      }

      await sys_dept.update(
        {
          delFlag: 2,
          updateBy: `${req.user.userName}-${req.user.nickName}`,
          updateTime: new Date(),
        },
        { where: { deptId, status: { [Op.not]: '' } }, transaction }
      );

      // 把sys_user表中的deptId置为null
      await sys_user.update({
        deptId: null,
        updateBy: `${req.user.userName}-${req.user.nickName}`,
        updateTime: new Date(),
      }, {
        where: { deptId },
        transaction
      })

      await transaction.commit()

      res.send({ code: 200, msg: '删除成功' })
    } else {
      res.send({ code: -1, msg: '部门不存在' })
    }
  } catch (error) {
    log.error('部门删除失败', error)
    res.send({ code: -1, msg: '删除失败' })
  }
}
