const { createLogger, format, transports } = require('winston');

const path = require('path');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', //test时，可设置当.NODE_ENV为test时，不显示info log(POST /api/students 201 80.135 ms - 115) =>自己研究
  format: format.combine( //format.combine对多个不同格式组合
    format.colorize(), //console输出会有颜色，更易读
    format.label({ label: path.basename(module.parent.filename)}), 
    //自定义了一个变量label 
    //path.basename用来取当前的文件名(logger.js), 把父级文件夹的名字全省略
    //C:\Users\kwonz\source\repos\CMS\src\utils\logger.js

    format.timestamp({ format: 'HH:mm:ss'}), //打印的时间信息的格式, 还可以是'YYYY-MM-DD HH:mm:ss'年月日时分秒

    format.printf( //指定打印的方式
        (info) =>
            `${info.timestamp} [${info.label}] [${info.level}]: "${info.message}"`
            //打印：时间+当前文件名+logger的等级+具体信息
    )
  ),
  //以什么方式输出
  transports: [new transports.Console()]
});

module.exports = logger;