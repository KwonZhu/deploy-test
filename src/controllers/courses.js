const Course = require('../models/course');
const Joi = require('joi');
const Student = require('../models/student');

async function getAllCourses(req, res) { //await前要加async
  //新项目写法：async await
  const courses = await Course.find().exec(); 
    //Course.find()是异步操作，会返回一个promise。因此要创建一个变量
      //语法类似于在mongodb shell里的db.collections.find()
    //.exec()表示：代码执行到此时，查询操作(query)在这里就中止，因为query可以像promise那样chain起来
      //因此，如果query结束的话就加上.exec()，代表后面的代码没有query了，也防止后面的代码改动这个query
  
  //旧项目写法: promise
  //Course.findById().then().catch()
  //更旧的写法: call back
  //Course.findById((error, data) => {})
  return res.json(courses);
}

async function getCourseById(req, res) {
  const { id } = req.params;
  const course = await Course.findById(id).exec();
  //const course = await Course.findById(id).populate('students').exec();
  if(!course) {
    return res.sendStatus(404);
  }
  return res.json(course);
}

async function updateCourseById(req, res) {
  const { id } = req.params;
  const { name, description } = req.body; //需要检测传来的req.body是否为null
                                          //否则可能会出现field更新后变成null
                                          //null的field，不更新
  const course = await Course.findByIdAndUpdate(
    id, 
    { name, description }, 
    {new: true}
  ).exec();
    //用id找到后，把要更新的name和description传入
    //{new: true} 表示返回回来的是更新后的course。如果没有，表示返回更新前的course
    //return the updated object

  //方法2:
  //更新除了上面这样操作，还能先做Course.findById(id)，找到document后对特定的field更新，最后document.save()
  //用document.save()来利用mongoose提供的hooks去更新某些field，譬如updatedAt

  if(!course) {
    return res.sendStatus(404);
  }
  return res.json(course);
}

async function deleteCourseById(req, res) {
  const { id } = req.params;
  const course = await Course.findByIdAndDelete(id).exec();//类似于findByIdAndUpdate，只是不需要id之外的参数
    //返回被删除id的course

  if(!course) {
    return res.sendStatus(404);
  }

  //当delete course时，需要到Student把相应的reference也删除
  await Student.updateMany( //类似于mongodb的db.collection.updateMany({},{})
                            //第一个参数为匹配条件，第二个参数为如何更新
    //匹配条件写法2: (没那么好理解)
    {
      _id: { $in: course.students } //在Student里找到这个course的students field里所有student
                                    //$in是query operator
    },
    /*
    匹配条件写法1:
    { 
      courses: course._id //在Student的courses field里，找到包含这个course_id的所有student
    },
    */
    {
      $pull: { //$xxx是operator，$pull是update operator
        courses: course._id //在符合的student中，把这个course从courses field删除
      }
    }
  );

  //删除成功的返回方式1: 
  return res.sendStatus(204); //返回no content，代表删除成功
  //删除成功的返回方式2:
  // return res.json(course); //前端想知道哪个被删除了
}

async function createCourse(req, res) { 
  //validate data
  const schema = Joi.object({ //定义一个Joi schema来对数据做规则定义
    code: Joi.string()
      .regex(/^[a-zA-Z0-9]+$/)
      .required(), //简单的regex，^代表开始，+代表多个，$代表结束
    name: Joi.string().min(2).max(10).required(),
    description: Joi.string()
  });
  const { code, name, description } = await schema.validateAsync(req.body, { //尽量用异步验证validateAsync
    allowUnknown: true, //允许接收不存在的数据。接收req.body里传来的不存在Joi schema里的数据
                        //默认是false，如果传unknown的过来，直接报错
    stripUnknown: true, //虽然接收，但删除Joi schema里不存在的数据
                      //譬如price没在schema里定义，接收，但删除
    abortEarly: false //过早中止的默认是true，false即检测完所有数据再返回
    
  });
  //const schema = Joi.object({...})一般不会写在controller里
  //会单独写一个schema。而且验证规则Joi.string().min(2).max(10).required()也会单独提出来 => 保证代码可复用
  //const stringValidator = Joi.string().min(2).max(10).required();
  //name : stringValidator;

  //由于_id从ObjectId改成String的code(譬如两个course的_id都是COMP1)，可能会造成_id duplicate的处理
  const existCourse = await Course.findById(code).exec(); //从await schema.validateAsync(req.body)取到的是code，还不是_id
  if (existCourse) {
    return res.sendStatus(409); //conflict
  }

  //创建一个新document
  const course = new Course({ _id: code, name, description }); //Course是model(collection), course是document
    //从body把field取出来，又原封不动地添加到创建新course
    //在updateCourse也会做同样的操作
    //原因:controller不需要req.body里所有的数据，只需要这个controller关心的数据。
    //而且validate data时也是需要从req.body里取数据的，所以精确地取就是了
    //不建议写const course = new Course(req.body)，因为这样能篡改Course这个model里的其他field，譬如fee从1000改成0
    //只取code, name, description，不把req.body直接传给mongoose model，否则price会被篡改

  await course.save(); //通过调用save()，帮助存到MongoDB，具体是存到哪个数据库(database server里有很多databases)的哪个collection由schema定义 
                       //save()没有.exec()
  return res.status(201).json(course); //返回201，返回刚创建好的course
}

module.exports = {
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById,
  createCourse
};