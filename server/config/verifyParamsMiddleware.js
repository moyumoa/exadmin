
// 校验必传参数
class VerifyParamsMiddleware {
  constructor(must, type='query') {
    this.must = must;
    this.type = type;
  }

  verify (req, res, next) {
    const params = req[this.type];

    const missingParams = [];

    for (const field of this.must) {
      const fieldName = Object.keys(field)[0];
      const fieldLabel = field[fieldName];
      const paramValue = params[fieldName];

      // if (!(fieldName in params)) {
      //   missingParams.push(fieldLabel);
      // }
      if (paramValue === undefined || paramValue === null || paramValue === '') {
        missingParams.push(fieldLabel);
      }
    }

    if (missingParams.length > 0) {
      return res.send({ code: -2, msg: `缺少必需的参数: ${missingParams.join(', ')}` });
    }

    next();
  }
}

module.exports = (must, type) => {
  return (req, res, next) => {
    const verifyParams = new VerifyParamsMiddleware(must, type);
    verifyParams.verify(req, res, next);
  };
};
