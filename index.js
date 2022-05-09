const { connectToDB } = require('./src/utils/db');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const PORT = process.env.PORT || 3000;

connectToDB(); //在listen之前连接MongoDB server

app.listen(PORT, () => {
  // logger.debug('debug output'); //做middleware的debug时的输出，用来检测request经过了哪些middleware
  logger.info(`server listening on ${PORT}`);
});