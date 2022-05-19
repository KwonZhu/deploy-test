const express = require('express');
const studentRoute = require('./students');
// const teacherRoute = require('./teachers');
const courseRoute = require('./courses');
const userRoute = require('./users');
const authRoute = require('./auth');
const authGuard = require('../middleware/authGuard');


const router = express.Router();

router.use('/students', authGuard, studentRoute); //在路径上加authGuard
// router.use('/teachers', teacherRoute);
router.use('/courses', courseRoute); //在路径上加authGuard
router.use('/users', userRoute);
router.use('/auth', authRoute);

module.exports = router;