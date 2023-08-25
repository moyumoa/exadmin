const { qiniuToken } = require('../../config/qiniuyun'); //导入七牛文件

exports.getQiniuToken = async (req, res, next)=> {

  const token = await qiniuToken()

  res.send({
    code: 200,
    msg: '获取成功',
    data: token
  })
  
}