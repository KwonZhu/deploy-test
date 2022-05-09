const express = require('express');
const {
  getAllStudents,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  createStudent,
  addStudentToCourse,
  removeStudentFromCourse
} = require('../controllers/students');

const router = express.Router();

router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudentById);
router.delete('/:id', deleteStudentById);
router.post('/', createStudent);

//需要从路径上取student id和course id
//这个(code)要和在controller里取数据时的名字一样
router.post('/:id/courses/:code', addStudentToCourse); //post和put都行
router.delete('/:id/courses/:code', removeStudentFromCourse);

module.exports = router;