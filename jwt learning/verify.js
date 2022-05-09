//用于验证token是否由本server签发
const jwt = require('jsonwebtoken');

const secret = 'secret'; //一般保证secret和sign的secret一致

//直接把sign.js生成的token贴过来
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzNCwiaWF0IjoxNjQ5MDQyOTM5LCJleHAiOjE2NDkxMjkzMzl9.29oItSqFqLoxUTjNAX6jroAd5lv2BuE4yCIKhk7Mlck'

const valid = jwt.verify(token, secret); //pass token and secret to verify

console.log(valid);