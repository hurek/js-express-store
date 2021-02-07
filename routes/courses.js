const {Router} = require('express');
const Course = require('../models/course');
const router = Router();

// Course page
router.get('/', async (req, res) => {
  const courses = await Course.find()
  .populate('ownerId', 'email name')
  .select('price title img');

  console.log(courses);
  res.render('courses', {
    title: 'Курсы',
    isCourses: true,
    courses
  });
});

// View course
router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  res.render('course', {
    layout: 'empty',
    title: `Курс ${course.title}`,
    course
  })
})

// Edit course page
router.get('/:id/edit', async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }

  const course = await Course.findById(req.params.id);

  res.render('course-edit', {
    title: `Редактировать ${course.title}`,
    course
  })
})

// Edit (update) course
router.post('/edit', async (req, res) => {
  const {id} = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body);
  res.redirect('/courses')
})

// Remove course
router.post('/remove', async (req, res) => {
  try {
    await Course.deleteOne({_id: req.body.id})
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
})
module.exports = router;