// const mongoose = require('mongoose');
// const schema = new mongoose.Schema({...}) //用mongoose创建schema
// 做destructuring
const { Schema, model } = require('mongoose');
const schema = new Schema({
  // 传入一个object，定义这个document有哪些fields, field分别是什么类型
  _id: {
    type: String, //把_id的Object类型改成String
                  //使得_id存储的是course code，而不是ObjectId类型的那一串10几个的字符
                  //而用String作为type的话，_id有可能会重复。譬如两个course的_id都是COMP1 => _id duplicate。
                  //所以需要在:1.errorhandler(处理常见error，这个error不常见，所以不在这处理)
                  //         /2.在route handler - createCourse，处理
    uppercase: true, //自动转换为大写
    alias: 'code' //别名。不再用schema.virtual('code').get(function(){...}来直接return this._id
                  //因为virtual有其他用处，譬如student里用virtual的full name来return拼接的first name和last name
  },
  name: {
    type: String,
    required: true //必须要传name
  },
  description: {
    type: String,
    default: 'This is a description.' //当创建document没传description时
  },
  students: [{
    type: Schema.Types.ObjectId, //student _id的type没有手动改过，所以是ObjectId。
                                 //ObjectId是mongodb独有的类型，所以mongoose支持这个类型
    ref: 'Student'
  }],
  __v: { //不返回__v
         //但是__v是存在db的field，用来防止在不同的server同时对同一个数据修改
    type: Number,
    select: false //选取时，不做选取
  }
},{ 
  //在返回里显示virtual field: code，还返回一个自带的field: id(不是上面的_id)
  toJSON: {
    virtuals: true
  },
  id: false, //如果只想要virtual field，不想显示id的话
  timestamps: true //当business logic需要用到时间戳时添加这个field
                   //记录createdAt和updatedAt
                   //如果想更新updatedAt，那么在updateCourseById不能是Course.findByIdAndUpdate
                   //而是，先像getCourseById里的Course.findById(id)，找到这个id的course，然后修改后，最后用course.save()来保存修改
}
  //virtual field只存在于用mongoose取数据时，不存在数据库中
  //用mongodb compass查看db里没有code和id
);

//让_id的值 = 传进来的course code的方法
//在mongoose对这个schema创建虚拟field - code，code在获取值时，获取_id的值
/*
schema.virtual('code').get(function() { //注意，这里没有写箭头函数，而是anonymous function，因为使用了this，
                                        //使得指向实际的document
  return this._id;
});
*/

//把schema变成model并导出
module.exports = model('Course', schema); //第1个参数：model的名字为Course，C大写
                                            //Course的用处: 
                                              //1. Course -> courses，数据库里的collection叫courses
                                              //2. 把Course的model注册到mongoose
                                                //如果想在其他地方使用这个model
                                                  //直接导入course.js即可
                                                  //或者在mongoose里通过model的名字直接找到这个model
                                          //第2个参数：model的schema是什么