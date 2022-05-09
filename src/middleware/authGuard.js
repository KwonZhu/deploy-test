//用来验证token
const { validateToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  //Header: KEY(Authorization), VALUE(Bearer+space+token)
  const authHeader = req.header('Authorization'); //取Authorization header里的token
  if (!authHeader) {
    return res.sendStatus(401);
  }
  const contentArray = authHeader.split(' ');
  if (contentArray.length !== 2 || contentArray[0] !== 'Bearer') { //检测VALUE和关键字'Bearer'
    return res.sendStatus(401);
  }
  //前面2个fail fast通过，证明这个authHeader才值得去检测token
  //validateToken被调用，有2种结果。成功，返回decoded出来的object；失败，返回空
  const decoded = validateToken(contentArray[1]);
  if (!decoded) {
    return res.sendStatus(401);
  }
  req.user = decoded; //把decoded出来的payload，即addUser/login的generateToken时的{id: user._id}，赋给新属性req.user
  /*
  req.user的好处: 区分student, teacher, admin。在next controller直接访问req.user即可以知道role是什么
                  不需要又decode一次token，或者把body/params的id放到db里查询从而知道role是什么
  */
  next(); //handover to next controller
};