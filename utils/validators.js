const {body} = require('express-validator/check');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerValidators = [
  body('email', 'Некорректный Email')
    .isEmail()
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({email: value});
        if (user) {
          return Promise.reject('Пользователь с таким email уже зарегистрирован')
        }
      } catch (err) {
        console.log(err);
      }
    })
    .normalizeEmail(),
  body('password', 'Длина пароля должна быть не менее 6 символов')
    .isLength({min: 6, max: 56})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать')
      }
      return true
    })
    .trim(),
  body('name', 'Длина имени должна быть не менее 2 символов')
    .isLength({min: 2})
    .trim()
]

exports.loginValidators = [
  body('email', 'Некорректный Email')
    .isEmail()
    .custom(async (value, {req}) => {
      try {
        const candidate = await User.findOne({email: value})
        if (!candidate) {
          return Promise.reject('Пользователь с таким email не зарегистрирован')
        }

        const areSame = await bcrypt.compare(req.body.password, candidate.password)
        if (!areSame) {
          return Promise.reject('Неверный пароль')
        }
      } catch (err) {
        console.log(err);
      }
    }),
]

exports.courseValidators = [
  body('title', 'Минимальная длина названия 3 символа').isLength({min: 3}).trim(),
  body('price', 'Введите корректную цену').isNumeric(),
  body('img', 'Введите корректный URL картинки').isURL()
]