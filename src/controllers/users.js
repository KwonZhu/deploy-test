const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

async function addUser(req, res) {
  const { username, password } = req.body;
  
  //username应该作为_id，但在定义schema时，没有把username作为_id，因此添加前的查找为
  //document.findOne({name:"zhu"})，添加搜索条件，找到指定的document
  //而不是之前的document.find().exec()或者document.findById().exec()
  const existingUser = await User.findOne({ username }).exec();
  if (existingUser) {
    return res.status(409).json('User already exist');
    /*
    status, sendStatus, send, json
	    status: 只设置status code，response body的内容还没设置，即后面跟.json('User already exist')
	    sendStatus: 设置status code并返回，后面不跟.json('User already exist')
	    send: 可以返回任何信息(字符串或者json)，譬如res.send
	    json: 以json形式返回。建议直接用json格式返回
    */
  }
  const user = new User({ username, password });
  await user.hashPassword(); //在.save()前，用hashPassword修改在创建user时的明文password
  await user.save();
  const token = generateToken({ id: user._id }); //user创建成功后，生成token，把id写进payload
  return res.status(201).json({ token, username });
}

module.exports = { addUser };