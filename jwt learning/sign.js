const jwt = require('jsonwebtoken');

const payload = {
  id: 1234
};

const secret = 'secret';

//签发token
const token = jwt.sign(payload, secret, {expiresIn: '1d'}); //jwt.sign()接收至少2个参数，payload, secret or private key
//expiresIn以ms为单位，也可以是字符串1d，1h
//在decode的Payload会显示exp，即过期时间
//token信息返回到前端后，前端可通过检查exp得知token是否过期。过期就在前端页面让用户重新登录，没过期就在前端页面让用户直接访问资源

console.log(token);