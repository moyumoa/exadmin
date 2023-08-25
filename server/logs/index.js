const log4js = require('log4js');
const moment = require('moment');

log4js.configure({
  appenders: {
    cheese: {
      type: 'dateFile', // 日志类型
      filename: 'logs/log/cheese', // 输出的文件名
      pattern: "yyyy-MM-dd.log", // 文件名增加后缀
      alwaysIncludePattern: true, // 是否总是有后缀名
      category: 'normal', // 日志类别 normal 是默认值 
      // daysToKeep: 30, // 日志保留天数
    },
    traceLog: {
      type: 'dateFile',
      filename: 'logs/trace/trace',
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true,
      category: 'trace', // 自定义一个名为 "trace" 的日志类别
    },
    pushlog: {
      type: 'dateFile',
      filename: 'logs/push/trace',
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true,
      category: 'normal', // 自定义一个名为 "trace" 的日志类别
    },

    console: { type: 'console' }, // 添加控制台输出的appender
  },
  categories: {
    default: { appenders: ['cheese', 'console'], level: 'info' },
    traceLog: { appenders: ['traceLog'], level: 'trace' }, // 自定义的日志类别
    pushlog: { appenders: ['pushlog'], level: 'info' }, // 自定义的日志类别
  }, // 添加console appender到默认category

  // 添加自定义的 layout
  replaceConsole: true, //替换 console.log
  pm2: true, // 使用 pm2 来管理项目时，设置为 true
  custom: {
    type: (logEvent) => {
      // moment(logEvent.startTime)
      return `[${moment().format("YYYY-MM-DD HH:mm:ss")}] [${logEvent.level.levelStr}]`;
    },
  }
});

module.exports = {
  logger: log4js.getLogger('cheese'),
  trace: log4js.getLogger('traceLog'),
  pushlog: log4js.getLogger('pushlog'),
};
