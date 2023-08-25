/**
 * @params time 时间戳||时间字符串
 * @params cFormat 格式化字符串 默认 {y}-{m}-{d} {h}:{i}:{s}
 */

exports.parseTime = (time, cFormat) => {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 时间戳 一天的00:00
exports.minTime = function (params) {
  return new Date(new Date(params).toLocaleDateString()).getTime()
}
// 时间戳 一天的23:59
exports.maxTime = function (params) {
  return new Date(new Date(params).toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1
}


const { Op } = require('sequelize');
/**
 * 模糊查询
 * @param {*} params { 要查询的参数: [要查询的字段1, 要查询的字段2]}
 * 如果只有一个字段，直接传入字符串 params: { 要查询的参数: '要查询的字段'}
 * @returns {object} whereClause
 */
exports.query_like = (params) => {
  const whereClause = {};
  const arr = [];
  Object.keys(params).forEach(key => {
    const fields = params[key];
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        if (key && key !== 'undefined') arr.push({ [field]: { [Op.like]: `%${key}%` } })
      })
    } else {
      if (key && key !== 'undefined' && fields) whereClause[fields] = { [Op.like]: `%${key}%` }
    }
  })

  if (arr.length > 0) whereClause[Op.or] = arr

  return whereClause;
};

/**
 * 精确查询
 * @param {*} params { 要查询的参数: '要查询的字段'}
 * @returns {object} whereClause
 * 
 */
exports.query_eq = (params) => {
  const whereClause = {};
  Object.keys(params).forEach(key => {
    const fields = params[key];
    if (key && key !== 'undefined' && fields) key.includes(',') ? whereClause[fields] = key.split(',') : whereClause[fields] = key
  })
  return whereClause;
}

/**
 * 查询时间段
 * @param {*} params 例如: createTime: { beginTime: '2023-08-17 00:00:00', endTime: '2023-08-18 23:59:59' }
 * @returns {object} whereClause
 */

exports.query_times = (params) => {
  if (Object.values(params)[0] === undefined || Object.values(params)[0] === null) {
    return {}
  }
  const times = Object.values(...Object.values(params) || []);
  const whereClause = {};
  whereClause[Object.keys(params)] = { [Op.between]: times }
  return whereClause;
}

/**
 * 分页+排序
 * @param {*} params { pageNum: 1, pageSize: 10, orderByColumn: 'operName', isAsc: 'descending' || 'ascending' }
 * @returns {object} whereClause
 */

exports.query_page = (pageNum = 1, pageSize = 10, isAsc = 'descending', orderByColumn = 'createTime') => {
  const whereClause = {};
  whereClause.offset = (pageNum - 1) * pageSize;
  whereClause.limit = +pageSize;
  whereClause.order = [[orderByColumn, isAsc === 'ascending' || 'asc' ? 'ASC' : 'DESC']]

  return whereClause;
}

/**
 * 过滤请求数据
 * @param {*} requestData  请求数据
 * @param {*} allowedFields  允许的字段
 */
exports.filterKey = (requestData, allowedFields) => {
  return Object.keys(requestData)
    .filter(field => allowedFields.includes(field))
    .reduce((obj, field) => {
      obj[field] = requestData[field];
      return obj;
    }, {});
}