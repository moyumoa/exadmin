/* 
  公用方法
*/
// 格式化时间
exports.formatterTime = (time, type, symbol = '-') => {
  let date = new Date(time)
  let year = date.getFullYear()
  let month = addZero(date.getMonth() + 1)
  let day = addZero(date.getDate())
  let hour = addZero(date.getHours())
  let minute = addZero(date.getMinutes())
  let seconds = addZero(date.getSeconds())
  let timeStr
  if (type == 'day') {
      timeStr = year + symbol + month + symbol + day
  } else if (type == 'hour') {
      timeStr = hour + '时'
  } else if (type == 'time') {
      timeStr = hour + ':' + minute
  } else {
      timeStr = year + symbol + month + symbol + day + ' ' + hour + ':' + minute + ':' + seconds
  }
  return timeStr
}

// 小于10，补0
exports.addZero = (num) => {
  let newNum = num < 10 ? '0' + num : num
  return newNum
}

// 秒转化成时分秒
exports.formatSecond = (second, type, symbol) => {
    const days = Math.floor(second / 86400);
    const hours = addZero(Math.floor((second % 86400) / 3600));
    const minutes = addZero(Math.floor(((second % 86400) % 3600) / 60));
    const seconds = addZero(Math.floor(((second % 86400) % 3600) % 60));
    let result = ''
    if (type == 'day') {
        result = `${days}天${hours}时${minutes}分${seconds}秒`
    } else if (type == 'hours') {
        result = symbol ? `${hours}${symbol}${minutes}${symbol}${seconds}` : `${hours}时${minutes}分${seconds}秒`
    } else if (type == 'minutes') {
        result = symbol ? `${minutes}${symbol}${seconds}` : `${minutes}分${seconds}秒`
    } else {
        result = `${seconds}秒`
    }
    return result;
}

// 解析文件流并下载
exports.analysisFile = (data, name) => {
    let blob = new Blob([data], {
        type: 'application/vnd.ms-excel'
    })
    let url = window.URL.createObjectURL(blob)
    let vDom = document.createElement('a')
    vDom.style.display = 'none'
    vDom.href = url
    vDom.setAttribute('download', name + '.xls')
    document.body.appendChild(vDom)
    vDom.click()
    document.body.removeChild(vDom)
    window.URL.revokeObjectURL(url)
}

// 数组求和
exports.arrSum = (arr) => {
    if (arr.length > 0) {
        return arr.reduce(function (prev, curr, idx, arr) {
            return prev + curr;
        });
    } else {
        return null
    }
}

// 多个对象数组数据合并为一个对象数组数据
var result = [];
var results = [];
function doExchange(arr, depth) {
    for (var i = 0; i < arr[depth].length; i++) {
        result[depth] = arr[depth][i]
        if (depth != arr.length - 1) {
            doExchange(arr, depth + 1)
        } else {
            results.push(result.join('|'))
        }
    }
}
exports.formatterData = (arr) => {
    results = []
    doExchange(arr, 0);
    return results
}

// 数组元素交换位置
function swapArray(arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}

exports.zIndexUp = (arr, index, length) => {
    if (index != 0) {
        swapArray(arr, index, index - 1);
    } else {
        Message({
            showClose: true,
            message: '已经处于置顶，无法上移',
            type: 'warning'
        })
    }

}

exports.zIndexDown = (arr, index, length) => {
    if (index + 1 != length) {
        swapArray(arr, index, index + 1);
    } else {
        Message({
            showClose: true,
            message: '已经处于置底，无法下移',
            type: 'warning'
        })
    }
}

// 数组排序
exports.sortArr = (attr, rev) => {
    //第二个参数没有传递 默认升序排列
    if (rev == undefined) {
        rev = 1;
    } else {
        rev = (rev) ? 1 : -1;
    }

    return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) {
            return rev * -1;
        }
        if (a > b) {
            return rev * 1;
        }
        return 0;
    }
}

//ele时间组件结果反推时间组件赋值
exports.timeComponent = (str) => {
    let a = str.split(" ");
    let a0 = a[0].split("-");
    let a1 = a[1].split(":");
    a0 = a0.map((val, index) => {
        val = parseInt(val);
        if (index === 1) {
            val--;
        }
        return val;
    });
    a1 = a1.map((val) => {
        return parseInt(val);
    });
    return new Date(a0[0], a0[1], a0[2], a1[0], a1[1]);
}

// 对象数组排序
exports.sortObjArr = (arr, fields, smallToBig) => {
    arr.sort((val0, val1) => {
        let val = null;
        if (smallToBig) {
            val = parseInt(val0[fields]) - parseInt(val1[fields]);
        } else {
            val = parseInt(val1[fields]) - parseInt(val0[fields]);

        }
        return val;
    });
}

/**
 * 保留两位小数
 * @param {Number} num 
 * @param {Boolean} round 
 */
exports.twoDecimal = (num, round = true) => {
    let result = num;
    if (round) {
        // 四舍五入
        num = parseFloat(num);
        result = num.toFixed(2);
    } else {
        // 截取
        num = num.toString();
        let arr = num.split('.');
        if (!arr[1]) {
            result = arr[0] + '.00';
        } else {
            let decimals = arr[1].substring(0, 2);
            if (decimals.length < 2) {
                decimals += '0';
            }
            result = arr[0] + '.' + decimals;
        }
    }
    result = result.toString();
    return result;
}

// 获取客户端ip地址
let getClientIp = function (req) {undefined
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
  };
  let ip = getClientIp(req).match(/\d+.\d+.\d+.\d+/);
  ip = ip ? ip.join('.') : null;
  
  let domain = req.headers['referer'].match(/^(\w+:\/\/)?([^\/]+)/i);
  domain = domain ? domain[2].split(':')[0].split('.').slice(-2).join('.') : null;