import { body } from "express-validator";

export const registerValidation = [
  body('email', 'Неверно введена почта').isEmail(),
  body('password', 'Пароль должен быть более 4 символов').isLength({min: 5}),
  body('login', 'Укажите ваше имя').isLength({min: 3}),
  body('avatarUrl', 'Неверная ссылка на аватар').optional(),
]

export const loginValidation = [
  body('email', 'Неверно введена почта').isEmail(),
  body('password', 'Пароль должен быть более 4 символов').isLength({min: 5}),
]