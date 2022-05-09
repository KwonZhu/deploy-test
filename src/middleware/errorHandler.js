module.exports = (error, req, res, next) => {//跟普通middleware不同的是，接收4个参数，且第一个是error
  //error有哪些属性可以通过res.json(error)在postman上查看返回
  //还可以通过npm run debug，设置breakpoint，发一个请求，鼠标点在error上，看它有哪些属性
  if (error.name === 'ValidationError') {
    if (process.env.NODE_ENV === 'production') {
      /*object manipulation操纵。把对象转换成相应的格式进行展示
      const { details } = error; //details是一个array，当多个数据有错时，会有多个object，每个object有自己的message
      const errMsg = details.map((i) => ({
        message: i.message //在postman生成{"message": "\"name\" length must be less than or equal to 10 characters long"}
                           //和{"message": "\"code\" with value \"COMP3 122222\" fails to match the required pattern: /^[a-zA-Z0-9]+$/"}
        }));
      return res.status(400).json(errMsg);
      */
      return res.status(400).json(error.message);
    } else {
      return res.status(400).json(error);
    }
  }
  //catch other errors
  
  //the worst case
  //当不是ValidationError时，即其他没有被匹配且捉取到的错误
  //return前用winston把log发到监控平台，告知出现了5XX的重大错误信息
  console.log(error); //print error on terminal
  return res.status(500).send('Something unexpected happened, please try again later.')
}

/*
restful aip的标准返回格式。保证返回内容的格式同一
{
  data: [],
  error: ""
}
若成功，数据在data里。失败，信息在error里。
*/

/*
比用error.name来检测ValidationError更优雅的方法 => 自定义一个custom error class，通过instanceof
class CustomError extends Error {}
if (error instanceof CustomError) {}
*/