const qiniu = require('qiniu');

const accessKey = 'xxx...';
const secretKey = 'xxx...';
const bucket = 'xxx';

const config = new qiniu.conf.Config();
config.uploadURL = 'http://up-z2.qiniup.com/';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

function uploadToQiniu(imageUrl, fileName) {
  return new Promise((resolve, reject) => {
    const uploadToken = new qiniu.rs.PutPolicy({ scope: bucket }).uploadToken(mac);

    // 上传文件到七牛云存储
    formUploader.putFile(uploadToken, fileName, imageUrl, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr);
      } else if (respInfo.statusCode === 200) {
        resolve(respBody);
      } else {
        reject(new Error('上传失败'));
      }
    });
  });
}

module.exports = {
  uploadToQiniu,
};
