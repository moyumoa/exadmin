const qiniu = require('qiniu');

const accessKey = 'xxx...';
const secretKey = 'xxx...';
const bucket = 'xxx';

const config = new qiniu.conf.Config();
config.uploadURL = 'http://up-z2.qiniup.com/';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

// 上传文件到七牛云存储
exports.uploadToQiniu = (fileName, filepath)=> {
  return new Promise((resolve, reject) => {
    const uploadToken = new qiniu.rs.PutPolicy({ scope: bucket }).uploadToken(mac);
    // 上传文件到七牛云存储
    formUploader.putFile(uploadToken, fileName, filepath, putExtra, function (respErr, respBody, respInfo) {
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

// 获取七牛云token
exports.qiniuToken = () => { 
  return new Promise((resolve, reject) => {
    const uploadToken = new qiniu.rs.PutPolicy({ scope: bucket }).uploadToken(mac);
    resolve(uploadToken);
  });
}

// 查询文件列表
exports.getFileList = (marker) => { 
  return new Promise((resolve, reject) => {
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    bucketManager.listPrefix(bucket, { limit: 100, marker }, function (err, respBody, respInfo) {
      if (err) {
        reject(err);
      } else {
        resolve(respBody);
      }
    });
  });
}

// 分页查询指定目录
exports.getFileListByPrefix = (prefix, marker) => { 
  return new Promise((resolve, reject) => {
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    bucketManager.listPrefix(bucket, { limit: 10, marker, prefix }, function (err, respBody, respInfo) {
      if (err) {
        reject(err);
      } else {
        resolve(respBody);
      }
    });
  });
}


// 删除文件
exports.deleteFile = (key) => { 
  return new Promise((resolve, reject) => {
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
      if (err) {
        reject(err);
      } else {
        resolve(respBody);
      }
    });
  });
}