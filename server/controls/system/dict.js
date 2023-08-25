const { sys_dict_type } = require('@/db/system/sys_dict_type')
const { sys_dict_data } = require('@/db/system/sys_dict_data')
const { sequelize } = require('@/service/sequelize')


exports.getDictType = async (req, res) => {
  if (req.params.dictId === 'list') {
    await dictTypeList(req, res)
    return
  }

  if (req.params.dictId === 'optionselect') {
    await dictTypeOptionSelect(req, res)
    return
  }

  await getDictTypeById(req, res)
}

// 获取字典类型列表(分页)
const dictTypeList = async (req, res) => {
  const { pageNum, pageSize, dictName, dictType, status, params } = req.query
  try {
    const { count: total, rows } = await sys_dict_type.findAndCountAll({
      where: {
        ...$utils.query_like({
          [dictName]: ['dictName'],
          [dictType]: ['dictType'],
          [status]: 'status'
        }),
        ...$utils.query_times({ createTime: params })
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
    log.error('字典类型查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取字典类型详情
const getDictTypeById = async (req, res) => {
  const { dictId } = req.params
  try {
    const dict = await sys_dict_type.findOne({
      where: { dictId },
    })

    res.send({
      code: 200,
      msg: '查询成功',
      data: dict,
    })
  } catch (error) {
    log.error('字典类型查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 新增字典类型
exports.addDictType = async (req, res) => {
  const allowedFields = ['dictId', 'dictName', 'dictType', 'status', 'createBy', 'createTime', 'updateBy', 'updateTime', 'remark']
  const dict = $utils.filterKey(req.body, allowedFields)
  try {
    const result = await sys_dict_type.create({
      ...dict,
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
    log.error('字典类型新增失败', error)
    res.send({
      code: -1,
      msg: '新增失败',
    })
  }
}

// 修改字典类型
exports.updateDictType = async (req, res) => {
  const { dictId, ...updateData } = req.body
  // 开启事务 修改类型时同时改变字典数据里的状态 保证字典类型和字典数据同时修改
  const transaction = await sequelize.transaction()

  try {
    await sys_dict_data.update({
      status: updateData.status,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { dictType: updateData.dictType },
      transaction,
    });
    transaction

    const rowsAffected = await sys_dict_type.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { dictId },
      fields: Object.keys(updateData),
      transaction,
    })

    await transaction.commit()

    res.send({
      code: 200,
      msg: '修改成功',
    })

  } catch (error) {
    log.error('字典类型修改失败', error)
    await transaction.rollback()
    res.send({
      code: -1,
      msg: '修改失败',
    })
  }
}

// 删除字典类型
exports.deleteDictType = async (req, res) => {
  const { dictId } = req.params
  try {
    // 删除字典类型前，通过dictId查dictType然后再连表sys_dict_data中删除dictType相同的数据
    const dictType = await sys_dict_type.findAll({
      where: { dictId },
      include: [
        {
          model: sys_dict_data,
          as: 'dictData',
        }
      ]
    })

    const isExist = dictType.map(item => !!item.dictData).includes(true)

    if (isExist) {
      res.send({
        code: -1,
        msg: '字典类型下存在数据，不允许删除',
      })
      return
    }

    const rowsAffected = await sys_dict_type.destroy({
      where: { dictId: dictId.split(',') },
    })

    if (rowsAffected === 0) {
      res.send({
        code: -1,
        msg: '字典类型不存在',
      })
      return
    }

    res.send({
      code: 200,
      msg: '删除成功',
    })
  } catch (error) {
    log.error('字典类型删除失败', error)
    res.send({
      code: -1,
      msg: '删除失败',
    })
  }
}

// 获取字典类型下拉框列表
const dictTypeOptionSelect = async (req, res) => {
  try {
    const dicts = await sys_dict_type.findAll()

    res.send({
      code: 200,
      msg: '查询成功',
      data: dicts,
    })
  } catch (error) {
    log.error('字典类型查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}


// 获取字典数据类型 根据字典类型查询字典数据信息
exports.getDictDataType = async (req, res) => {
  const { dictType } = req.params
  try {
    const dict = await sys_dict_data.findAll({
      where: { dictType, status: '0' },
    })
    res.send({
      code: 200,
      msg: '查询成功',
      data: dict,
    })
  } catch (error) {
    log.error('字典类型查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

exports.getDictData = async (req, res) => {
  if (req.params.dictCode === 'list') {
    await dictDataList(req, res)
    return
  }

  await getDictDataById(req, res)
}

// 获取字典数据列表(分页)
const dictDataList = async (req, res) => {
  const { pageNum, pageSize, dictLabel, dictValue, dictType, status, params } = req.query

  try {
    const { count: total, rows } = await sys_dict_data.findAndCountAll({
      where: {
        ...$utils.query_eq({
          [dictType]: 'dictType',
          [dictLabel]: 'dictLabel',
          [status]: 'status'
        }),
        ...$utils.query_times({ createTime: params })
      },
      ...$utils.query_page(pageNum, pageSize, 'asc', 'dictSort'),
    })

    res.send({
      code: 200,
      msg: '查询成功',
      rows,
      total,
    })
  } catch (error) {
    log.error('字典数据查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 获取字典数据详情
const getDictDataById = async (req, res) => {
  const { dictCode } = req.params
  try {
    const dict = await sys_dict_data.findOne({
      where: { dictCode },
    })

    res.send({
      code: 200,
      msg: '查询成功',
      data: dict,
    })
  } catch (error) {
    log.error('字典数据查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}

// 新增字典数据
exports.addDictData = async (req, res) => {
  const allowedFields = ['dictCode', 'dictSort', 'dictLabel', 'dictValue', 'dictType', 'cssClass', 'listClass', 'isDefault', 'status', 'createBy', 'createTime', 'updateBy', 'updateTime', 'remark']
  const dict = $utils.filterKey(req.body, allowedFields)
  try {
    const result = await sys_dict_data.create({
      ...dict,
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
    log.error('字典数据新增失败', error)
    res.send({
      code: -1,
      msg: '新增失败',
    })
  }
}

// 修改字典数据
exports.updateDictData = async (req, res) => {
  const { dictCode, ...updateData } = req.body
  try {
    const [rowsAffected] = await sys_dict_data.update({
      ...updateData,
      updateBy: `${req.user.userName}-${req.user.nickName}`,
      updateTime: new Date(),
    }, {
      where: { dictCode },
      fields: Object.keys(updateData),
    })

    if (rowsAffected === 0) {
      res.send({
        code: -1,
        msg: '字典数据不存在或无字段更新',
      })
      return
    }

    res.send({
      code: 200,
      msg: '修改成功',
    })

  } catch (error) {
    log.error('字典数据修改失败', error)
    res.send({
      code: -1,
      msg: '修改失败',
    })
  }
}

// 删除字典数据
exports.deleteDictData = async (req, res) => {
  const { dictCode } = req.params
  try {
    const rowsAffected = await sys_dict_data.destroy({
      where: { dictCode: dictCode.split(',') },
    })

    if (rowsAffected === 0) {
      res.send({
        code: -1,
        msg: '字典数据不存在',
      })
      return
    }

    res.send({
      code: 200,
      msg: '删除成功',
    })
  } catch (error) {
    log.error('字典数据删除失败', error)
    res.send({
      code: -1,
      msg: '删除失败',
    })
  }
}