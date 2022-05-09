const Student = require('../models/student');
const Course = require('../models/course');

async function getAllStudents(req, res) {
  const students = await Student.find().exec();
  return res.json(students);
}

async function getStudentById(req, res) {
  const { id } = req.params;

  //const student = await Student.findById(id).exec();
  const student = await Student.findById(id).populate('courses').exec(); //把关联的courses array里的course所有的field都取出来
  //const student = await Student.findById(id).populate('courses', 'name').exec(); //只要course里的name field
  //business logic需要populate才做，不需要就Student.findById(id).exec()即可
  //通常不在getAllStudents里，因为populate需要到相应的collection里找数据，payload大

  if (!student) {
    return res.sendStatus(404);
  }
  return res.json(student);
}

async function updateStudentById(req, res) {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;
  const student = await Student.findByIdAndUpdate(
    id, 
    { firstName, lastName, email }, 
    {new: true}
  ).exec();
  if (!student) {
    return res.sendStatus(404);
  }
  return res.json(student);

}

async function deleteStudentById(req, res) {
  const { id } = req.params;
  const student = await Student.findByIdAndDelete(id).exec();
  if (!student) {
    return res.sendStatus(404);
  }

  //当delete student时，需要到Course把相应的reference也删除
  await Course.updateMany( //类似于mongodb的db.collection.updateMany({},{})
                           //第一个参数为匹配条件，第二个参数为如何更新
    //匹配条件写法1: (写法2在courses.js)
    {
      students: student._id //在Course的students field里，找到包含这个student_id的所有course
    }, 
    {
      $pull: { //$xxx是operator，$pull是update operator
        students: student._id //在符合的course中，把这个student从students field删除
      }
    }
  );
  return res.sendStatus(204);
  //return res.json(student);
}

async function createStudent(req, res) {
  const { firstName, lastName, email } = req.body;
  const student = new Student({ firstName, lastName, email });
  await student.save(); //打开try-catch的话，这行要comment掉，且return res.status(201).json(student)要放到最后
  return res.status(201).json(student);
  //以下是3种抓取错误的方式
  /*
  将async await中不符合student.js里schema验证的错误信息捉取且返回到postman上
  try {
    await student.save();
  } catch (e) {
    return res.send(e);
  }
  */
  /*
  第二种：类似于try-catch的较旧写法
  student.save((error, result) => {
    if (error) {
      return next(e); //这里做错误处理不直接return，而是将错误丢到errorhandler处理
                      //即async function createStudent(req, res, next){}的第三个参数
    }
    return res.status(201).json(result); //这种写法comment掉return res.status(201).json(student);
  });  
  */
  /*
  第三种：用promise的方式
  student.save().then((result) => {
    return res.status(201).json(result); //如果成功获取到数据
  }).catch(error => { 
    next(error);
  });  
  */

  /*
  对于任何一个async await的地方(上面5个route handler)，都需要使用try-catch捉取错误
  //这个.save()可被替换成.findByIdAndDelete(), .findByIdAndUpdate(), .findById(), .find()

  //=>这样很繁琐
  //在导入models/student后写一个helper function把route handler包裹起来
  function tryCatch(routeHandler) { //把tryCatch的调用放到routes/students里
                                    //即router.get('/', tryCatch(getAllStudents));
                                    //对每一个route handler都包裹一个tryCatch
    return (req, res, next) => {  //从router里把req, res, next传给try-catch包裹起来的route handler
      try {
        routerHandler(req, res, next);
      } catch (e) { //一旦routeHandler在async await里出现错误就能捉取，传给error handler
        next(e);
      }
    }
  }
  //这样做不用在每个route handler写try-catch

  //=> 还是繁琐，借助npm package: express-async-errors
  //作用：改动express router的内在逻辑，自动把try-catch包裹在router，把错误传给error handler
  //不是很popular的package，且很久没做更新维护，但使用没有问题。只支持express 4，express 5自带express-async-errors功能，不再需要导入它和处理async await
  //使用方法：安装express-async-errors，在app.js导入。自此，不再需要在有async await的地方手动写try-catch
  */
}
async function addStudentToCourse(req, res) {
  //1. get student id, course code
  const { id, code } = req.params;
  //2. find student, course
  const student = await Student.findById(id).exec();
  const course = await Course.findById(code).exec();
  //3. check student, course exist
  if (!student || !course) {
    return res.sendStatus(404);
  }
  //4. check student already enrolled
  //5. add student to course
  student.courses.addToSet(course._id); //set集合里，不添加重复的值，譬如数字，字符串等，而不能检测有无重复object
                                       //addToSet表示把student里的courses数组变成一个set，来确保没有重复项
  course.students.addToSet(student._id);
  await student.save(); //添加完保存
  await course.save();
  //4. 针对不同的business logic还可以是: if (student.courses.includes(course._id))

  //6. return updated student or 200/201
  return res.json(student); //or return res.status(201); or return res.status(201).json(student);
}

async function removeStudentFromCourse(req, res) {
  const { id, code } = req.params;
  const student = await Student.findById(id).exec();
  const course = await Course.findById(code).exec();
  if (!student || !course) {
    return res.sendStatus(404);
  }
  //4. check student already enrolled
  //5. remove student from course
  student.courses.pull(course._id); //pull也保证唯一性
  course.students.pull(student._id);

  await student.save();
  await course.save();
  return res.json(student); //or return res.sendStatus(204)
}

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  createStudent,
  addStudentToCourse,
  removeStudentFromCourse
};