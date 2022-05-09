const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_KEY || 'secret';//因为做CI pipeline时，不上传.env，所以要给JWT_KEY默认值

function generateToken(payload) { //签发时payload会变，所以把payload传进来
  //secret不会明文存在代码中，而是存在.env里
  //const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1d' });
  const token = jwt.sign(payload, SECRET, { expiresIn: '1d' });
  return token;
}

//当validateToken被调用，有2种结果。成功，返回decoded出来的object；失败，返回空。
//因此调用后，检测返回的结果。
function validateToken(token) {
  let decoded;
  //和在jwt learning验证不同，真正的验证需要用try-catch
  //来抓取TokenExpiredError, JSONWebTokenError: invalid signature(=> secret不一致), SyntaxError等问题
  try {
    decoded = jwt.verify(token, SECRET);  
  } catch (e) {
    return null;//返回null/undefined(没有信息的结果)，即验证不通过，返回401
    //还可以把Error信息原封不动返回给请求方
  }
  return decoded;//成功验证，返回verify的结果
}

module.exports = { generateToken, validateToken };