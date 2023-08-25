const si = require('systeminformation');
// const pm2 = require('pm2');
const os = require('os');

// 将字节数转换为 GB
function bytesToGB (bytes) {
  const GB = bytes / (1024 * 1024 * 1024);
  return GB.toFixed(2); // Keep two decimal places
}

// 获取 PM2 运行时间
function getPM2RunTime () {
  return new Promise((resolve, reject) => {
    pm2.describe('your-app-name', (err, list) => { // 替换为您的应用名称
      if (err) {
        reject(err);
      } else {
        const runTime = list[0].pm2_env.pm_uptime;
        resolve(formatDuration(runTime));
      }
    });
  });
}

// 获取 PM2 启动时间
function getPM2StartTime () {
  return new Promise((resolve, reject) => {
    pm2.describe('your-app-name', (err, list) => { // 替换为您的应用名称
      if (err) {
        reject(err);
      } else {
        const startTime = list[0].pm2_env.created_at;
        resolve(new Date(startTime).toLocaleString());
      }
    });
  });
}

// 格式化运行时间
function formatDuration (seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}天${hours}小时${minutes}分钟`;
}

// 获取服务器 IP 地址
const getServerIpAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];

  for (const iface of Object.values(networkInterfaces)) {
    for (const entry of iface) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
};

// 服务监控
exports.getServerInfo = async (req, res) => {
  const cpuData = await si.cpu();
  const memData = await si.mem();
  const sysData = await si.system();
  const diskData = await si.fsSize();
  const uptimeInSeconds = os.uptime();

  try {
    const formattedData = {
      cpu: {
        cpuNum: cpuData.cores,
        total: cpuData.speed,
        sys: cpuData.currentload_system,
        used: cpuData.currentload,
        wait: cpuData.currentload_user,
        free: 100 - cpuData.currentload,
      },
      mem: {
        total: bytesToGB(memData.total),
        used: bytesToGB(memData.used),
        free: bytesToGB(memData.free),
        usage: (memData.used / memData.total * 100).toFixed(2),
      },
      jvm: {
        total: bytesToGB(memData.total),
        max: process.memoryUsage().heapTotal / (1024 ** 2), // Max heap size in MB
        free: ((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / (1024 ** 2)).toFixed(2), // Free heap size in MB
        used: (process.memoryUsage().heapUsed / (1024 ** 2)).toFixed(2), // Used heap size in MB
        usage: ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(2),
        version: process.version,
        home: process.execPath,
        inputArgs: process.execArgv,
        runTime: formatDuration(uptimeInSeconds),
        startTime: new Date(Date.now() - uptimeInSeconds * 1000).toLocaleString(),
        name: 'Express',
      },
      sys: {
        computerName: os.hostname(), // 使用 os 模块获取计算机名
        computerIp: getServerIpAddress(),
        // userDir: os.userInfo().homedir, // 使用 os 模块获取用户主目录
        // userDir 使用项目根目录
        userDir: process.cwd(),
        osName: os.type(), // 使用 os 模块获取操作系统类型
        osArch: os.arch(), // 使用 os 模块获取操作系统架构
      },
      sysFiles: diskData.map(disk => ({
        dirName: disk.mount,
        sysTypeName: disk.type,
        typeName: disk.fs,
        total: bytesToGB(disk.size),
        free: bytesToGB(disk.available),
        used: bytesToGB(disk.used),
        usage: ((disk.used / disk.size) * 100).toFixed(2),
      })),
    }

    res.send({
      code: 200,
      msg: '查询成功',
      data: formattedData,
    })
  } catch (error) {
    log.error('查询失败', error)
    res.send({
      code: -1,
      msg: '查询失败',
    })
  }
}