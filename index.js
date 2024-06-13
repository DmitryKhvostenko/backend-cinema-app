import express from 'express'
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import cors from 'cors'

import {registerValidation, loginValidation} from './validations/auth.js'

import {handleValidationErrors, checkAuth} from './utils/index.js'

import { UserController, CommentController } from './controllers/index.js'

import {commentValidation} from './validations/comment.js';

mongoose
	.connect(
		// process.env.MONGODB_URI
			'mongodb+srv://admin:UY8hLIJGZFBDhb9j@cluster0.pc4sdyr.mongodb.net/cinema-app?retryWrites=true&w=majority&appName=Cluster0'
	)
	.then(() => {
		console.log('DB ok')
	})
	.catch((err) => console.log('DB error', err))

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }
    cb(null, 'uploads')
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)

app.get('/auth/me', checkAuth, UserController.getMe)

app.patch('/auth/edit/:id', checkAuth, UserController.update)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  })
})

app.get('/comments', CommentController.getAll)
app.get('/comments/film/:filmId', CommentController.getByFilmId);
app.get('/comments/user/:userId', CommentController.getByUserId);
app.get('/comments/:id', CommentController.getOne)
app.post('/comments', checkAuth, commentValidation, handleValidationErrors, CommentController.create)
app.delete('/comments/:id', checkAuth, CommentController.remove)
app.patch('/comments/:id', checkAuth, commentValidation, handleValidationErrors, CommentController.update)

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err)
  }

  console.log('Server OK')
});