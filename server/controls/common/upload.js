const { uploadToQiniu } = require('../../config/qiniuyun')
const formidable = require('formidable');
exports.upload = async (req, res) => {
  const form = formidable({
    multiples: true,
    maxFileSize: 100 * 1024 * 1024
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      log.error('解析表单错误:', err);
      return res.send({ code: -1, msg: '解析表单错误' })
    }
    const { filepath, originalFilename: filename, mimetype, size: fileSize } = files.file
    // 根据类型存放到不同的文件夹
    const type = mimetype.split('/')[0]
    let path = ''

    if (type === 'image') {
      path = 'images'
    } else if (type === 'audio') {
      path = 'audios'
    } else if (type === 'video') {
      path = 'videos'
    }

    const name = `ex/${path}/${new Date().getTime()}-${filename}`

    if (fileSize > form.maxFileSize) {
      return res.send({ code: -1, msg: '文件大小超过限制' });
    }

    try {
      const { key } = await uploadToQiniu(name, filepath)
      res.send({ code: 200, msg: '上传成功', data: { name, url: `https://xxx.xxx.cn/${key}` } })
    } catch (error) {
      log.error('上传失败', error);
      return res.send({ code: -1, msg: '上传失败' })
    }
  })

}