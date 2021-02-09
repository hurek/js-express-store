const {Router} = require('express');
const auth = require('../middlewares/auth');
const Course = require('../models/course');
const {validationResult} = require('express-validator/check');
const {courseValidators} = require('../utils/validators');
const router = Router();

function isOwner(course, req) {
  return (course.ownerId.toString() === req.user._id.toString());
}

// Course page
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('ownerId', 'email name')
      .select('price title img');

    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses
    });
  } catch (err) {
    console.log(err);
  }
});

// View course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course
    })
  } catch (err) {
    console.log(err);
  }
})

// Edit course page
router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }

  try {
    const course = await Course.findById(req.params.id);
    
    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    })
  } catch (err) {
    console.log(err)
  }
})

// Edit (update) course
router.post('/edit', auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const {id} = req.body

  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }

  try {
    const {id} = req.body;
    delete req.body.id;
    const course = await Course.findById(id); 
    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    Object.assign(course, req.body);
    await course.save();
    res.redirect('/courses')

  } catch (err) {
    console.log(err);
  }
})

// Remove course
router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      ownerId: req.user._id
    })
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
})
module.exports = router;