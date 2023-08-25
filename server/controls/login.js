
const crypto = require('crypto')
const { secretKey } = require('../config/encryption')
const jwt = require('jsonwebtoken')
const { sys_user } = require('@/db/system/sys_user')
const { sys_role } = require('@/db/system/sys_role')
const { sys_logininfor } = require('@/db/system/sys_logininfor')
const { sys_dept } = require('@/db/system/sys_dept')

const md5 = (content) => {
  let md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex') // 把输出编程16进制的格式
}

// 加密函数
const genPassword = (password) => {
  const str = `password=${password}&key=${process.env.SECRET_KEY}` // 拼接方式是自定的，只要包含密匙即可
  return `$$${md5(str)}$`
}

exports.mlogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await sys_user.findOne({
      where: {
        userName: username,
        password: genPassword(password),
      },
      include: [{
        model: sys_role,
        as: 'roles',
        where: {status: '0'},
        attributes: ['roleId', 'roleKey', 'dataScope'],
        required: false,
      },{
        model: sys_dept,
        as: 'dept',
        attributes: ['deptId', 'deptName', 'ancestors'],
        required: false
      }],
      required: false,
    });
    if (!user || user.delFlag === '2' || user.status === '1') {
      res.send({
        code: -1,
        msg: '用户名或密码错误',
      });
      return;
    }

    const { userId, deptId, userName, nickName, roles } = user.dataValues
    let playload = {
      admin: process.env.TOKEN_IDENTIFIER,//token标识
      id: userId,//id
      deptId,//部门id
      ancestors: user.dataValues.dept.ancestors,//部门祖级列表
      userName,//用户名
      nickName,//昵称
      role: roles.map(role => ({ roleId: role.dataValues.roleId, roleKey: role.dataValues.roleKey, dataScope: role.dataValues.dataScope })),
      system: roles.some(item => item.roleKey === 'admin') || userId === 0
    }

    console.log('playload', playload)

    const token = jwt.sign(playload, secretKey, { expiresIn: 60 * 60 * 24 * 1 })//jwt时长X天

    // 设置  loginIp 和 loginDate
    await sys_user.update({
      loginIp: req.ip,
      loginDate: new Date(),
    }, {
      where: {
        userId: user.dataValues.userId,
      }
    })

    // 记录登录日志
    if (!!playload.system) {
      await sys_logininfor.create({
        userName: user.dataValues.userName,
        status: '0',
        msg: '登录成功',
        loginTime: new Date(),
        ipaddr: req.ip || '未知',
        loginLocation: req.connection.remoteAddress || req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.socket.remoteAddress || '未知',
        browser: getUserBrowser(req.headers['user-agent']),
        os: getUserOS(req.headers['user-agent']),
      })
    }

    res.header({ 'Authorization': 'Bearer ' + token }).send({
      code: 200,
      msg: '登录成功',
      data: user
    })
  } catch (error) {
    log.error('登录失败', error);
    // 记录登录日志
    sys_logininfor.create({
      userName: username,
      status: '1',
      msg: '登录失败',
      loginTime: new Date(),
      ipaddr: req.ip || '未知',
      loginLocation: req.connection.remoteAddress || req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.socket.remoteAddress || '未知',
      browser: getUserBrowser(req.headers['user-agent']),
      os: getUserOS(req.headers['user-agent']),
    })

    res.send({
      code: -1,
      msg: '登录失败',
    });
  }
}

exports.logout = async (req, res) => {
  res.send({
    code: 200,
    msg: '退出成功',
  });
}

// 修改密码
exports.updatePwd = async (req, res) => {
  const { oldPassword, newPassword } = req.query
  if (oldPassword && newPassword) {
    // 修改密码
    const user = await sys_user.findByPk(req.user.id)
    if (user.password !== genPassword(oldPassword)) {
      res.send({
        code: 500,
        msg: '原密码错误'
      })
      return
    }
    try {
      const data = await sys_user.update({ password: genPassword(newPassword), updateTime: new Date() }, {
        where: {
          userId: req.user.id
        },
      })
      res.send({
        code: 200,
        msg: '修改密码成功'
      })
    } catch (error) {
      console.log('修改密码失败：', error)
      res.send({
        code: 500,
        msg: '修改密码失败'
      })
    }
    return
  }
}

// 函数用于获取操作系统信息
function getUserOS(userAgent) {
  if (/Windows/.test(userAgent)) {
    return 'Windows';
  } else if (/Mac/.test(userAgent)) {
    return 'Mac OS';
  } else if (/Linux/.test(userAgent)) {
    return 'Linux';
  } else if (/Android/.test(userAgent)) {
    return 'Android';
  } else if (/iOS/.test(userAgent)) {
    return 'iOS';
  } else {
    return '未知';
  }
}

// 函数用于获取浏览器信息
function getUserBrowser (userAgent) {
  if (/Opera/.test(userAgent) || /OPR/.test(userAgent)) {
    return 'Opera';
  } else if (/Edge/.test(userAgent)) {
    return 'Edge';
  } else if (/Chrome/.test(userAgent)) {
    return 'Chrome';
  } else if (/Safari/.test(userAgent)) {
    return 'Safari';
  } else if (/Firefox/.test(userAgent)) {
    return 'Firefox';
  } else if (/MSIE/.test(userAgent) || /Trident/.test(userAgent)) {
    return 'IE';
  } else {
    return '未知';
  }
}