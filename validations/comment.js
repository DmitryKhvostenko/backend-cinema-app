import { body } from "express-validator";

export const commentValidation = [
  body('login', 'Введите свое имя').isLength({min: 3}),
  body('text', 'Комментарий должен быть минимум 5 символов').isLength({min: 5}),
  body('rating', 'Введенный рейтинг').optional().isNumeric(),
  body('avatarUrl', 'Неверная ссылка на изображение').optional(),
]