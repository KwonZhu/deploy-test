const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt'); //encrypt and validate password

const schema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  password: {
    type: String,
    required: true,
    trim: true
  }
  //roles field
  //权限信息一般会存储在schema中，譬如roles。有这个field后，
  //当做auth.js的generateToken({ id: user._id, roles: user.roles })时，即把roles写进payload。
  //当做authGuard.js得到的decoded非空时，req.user = decoded，解析出来的payload会赋给req.user，即有了roles。
  //之后，可以加后续的authGuard(譬如teacherGuard，studentGuard)。譬如在routes/students.js的delete路径上，加teacherGuard
  //这样，就只有teacher能delete student。不是teacher，返回403。
});
//mongoose可自定义函数
//static method -> 作用于Model，Model.functionName调用
//instance method -> 作用于document，document.functionName调用
//instance method format: schema.methods.functionName
schema.methods.hashPassword = async function() { //use hash to hash the document's plaintext password
                                                 //anonymous function，因为暂时还不知道具体是哪个document
  //this指向具体的document
  this.password = await bcrypt.hash(this.password, 12); 
  //参数1是要存的password，12表示hash12次，次数越多越难破解，目前的计算能力是12
}
//validate the input password
schema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password); //参数1：输入的密码，参数2：密文存储的密码
                                                  //hash(input password + salt)*12 VS document's password
  //如果password一样，会返回false
}

module.exports = model('User', schema);