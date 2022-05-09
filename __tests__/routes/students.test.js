/*jest最简例子
test('1+1===2', () => { //test关键字代表这是个测试用例，参数1：'1+1===2'是测试用例的描述；参数2：callback是测试的执行逻辑
  expect(1 + 1).toBe(2);
});
*/
const supertest = require('supertest'); //用于测试每条endpoint
const app = require('../../src/app');
const { connectToDB, disconnectDB } = require('../../src/utils/db');
const Student = require('../../src/models/student');
const { generateToken } = require('../../src/utils/jwt');

const request = supertest(app); //把api server传给supertest，生成一个client

const TOKEN = generateToken({ id: 'fake_id' }); //传入payload
  //目前还没涉及检测id是否有效，所以这个id内容随便写，保证生成了一个token即可

describe('/students', () => { //describe可以嵌套 => 用来整理测试用例
                              //里层做的是/students路径的测试
  //hooks
  beforeAll(() => { //在所有测试跑之前。和beforeEach不同，All只调用一次即可，顺序在beforeEach前
    connectToDB(); //连接api server和mongodb server。connectionToDB()没有做返回，所有不用async等待
  });
  afterAll(async () => {
    await disconnectDB(); //异步操作，需要等待断开
  })
  beforeEach(async () => { //在每个测试跑之前
    await Student.deleteMany({}); //清空数据库
  });
  afterEach(async () => { //在每个测试跑之后
    await Student.deleteMany({});
  });
  describe('POST', () => { //里层做的是POST操作。这里面也可以有它自己的beforeAll和beforeEach
    const validStudent = { //POST里提取重复代码
      firstName: 'aaa', 
      lastName: 'bbb', 
      email: 'test@gmail.com' 
    };

    const createStudent = async (body) => { //POST里提取重复代码，用函数的方式调用。
                                            //body以参数形式传来，好处：合规和不合规的body内容都能调用这个函数
      return request.post('/api/students').send(body).set('Authorization', `Bearer ${TOKEN}`); 
                                            //.send()因为是异步，所以要async
                                            //.set()用来添加header和value
    }

    //it关键字<=>test关键字，it should...是一个句子，所以偏向于使用it，
    it('should return 201 if request is valid', async () => { //request发出请求是异步的，因此是async
      //connectToDB(); //把每个测试用例的connectToDB()提到beforeAll()，即只调用一次即可
      //添加一个student，send()里面是body的内容
      //在测试前和测试后，保证数据库空白，使得测试用例互不干扰 => 使用测试专用的db。注意：不是指新的db server，而是新的db

      /*两个it重复代码优化
      const res = await request
        .post('/api/students')
        .send({ firstName: 'aaa', lastName: 'bbb', email: 'test@gmail.com' });
      */
      const res = await createStudent(validStudent);
      expect(res.statusCode).toBe(201);
    });
    //通过npm run test:watch得到201，但不确定数据是否已存到db
    //验证：绕过api server，用mongoose直接与mongodb server连接并发送请求取数据
    it('should save student to database if request is valid', async () => { //request发出请求是异步的，因此是async
      //connectToDB(); //把每个测试用例的connectToDB()提到beforeAll()，即只调用一次即可

      /*两个it重复代码优化
      await request //不再需要知道(res.statusCode的)具体结果，即不需要res
        .post('/api/students')
        .send({ firstName: 'aaa', lastName: 'bbb', email: 'test@gmail.com' });
      //直接把这个student从db找出
      const student = await Student.findOne({ email: 'test@gmail.com'});
      expect(student.firstName).toBe('aaa');
      expect(student.lastName).toBe('bbb');
      */
      await createStudent(validStudent);
      const student = await Student.findOne({ email: validStudent.email });
      expect(student.firstName).toBe(validStudent.firstName);
      expect(student.lastName).toBe(validStudent.lastName);
    });

    //POST失败的测试用例
    it('should return 400 if email is missing', async () => {
      const student = { firstName: 'aaa', lastName: 'bbb' };
      const res = await createStudent(student); //不合规的body也能传给createStudent，体现了body作为函数参数的好处
      expect(res.statusCode).toBe(400);
    });
    //对于firstName，lastName，email format等类似的input问题，测试逻辑一样 => jest的高级语法:it.each``
    //``里是一个表，表的每一行是独立测试，表的参数可动态更改
    //写法类似markdown language，有field和value column
    it.each`
      field | value 
      ${'firstName'} | ${undefined}
      ${'lastName'} | ${undefined}
      ${'firstName'} | ${'a'}
      ${'email'} | ${'@'}
      ${'email'} | ${'a@'}
      ${'email'} | ${'a@b'}
      ${'email'} | ${'a@b.c'}
    `('should return 400 when $field is $value', async ({field, value}) => { //将field和value传给测试用例
      const student = { ...validStudent }; //{...}是拷贝，这样就不会修改validStudent
      student[field] = value;
      const res = await createStudent(student);
      expect(res.statusCode).toBe(400);
    });
  });
});

