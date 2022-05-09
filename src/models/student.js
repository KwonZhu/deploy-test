const { Schema, model } = require('mongoose');
const Joi = require('joi'); //导入的变量uppercase/lowercase，查看该package的readme看如何导入

const schema = new Schema({
  firstName: { 
    type: String,
    required: true,
    trim: true, //delete extra spaces
    minlength: 2,
  },
  lastName: { 
    type: String,
    required: true,
    trim: true
  },
  email: { 
    type: String,
    required: true,
    validate: {
      validator: (email) => { //调用一个callback function来检测数据
                              //接收用户传来的field作为参数
        return !Joi.string().email().validate(email).error;
        //Jio.string().email().validate()返回一个object，object.error有值，则不为undefined，即校验失败
        //没有值，undefined，校验成功
      },
      msg: 'Invalid email format' //validator不通过时返回的信息
    }
  },
  courses: [{ //courses is a array
    type: String, //type要和reference的collection的_id type一一对应，即course的_id type: String
    ref: 'Course' //ref: 告诉mongoose，relationship是跟哪个collection。大写C是注册到mongoose的Course model
  }]
});
module.exports = model('Student', schema);