const crypto = require('crypto');


const MD5_SUFFIX = () => {
  const md5 = crypto.createHash('md5');
  return md5.update('hfaiosdhfoasjkfasp').digest('hex');
}

exports.secretKey = MD5_SUFFIX()