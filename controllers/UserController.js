import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { format } from 'date-fns'

import userModel from '../models/User.js'

export const register = async (req, res) => {
	try {
		const password = req.body.password
		const salt = await bcrypt.genSalt(10)
		const hash = await bcrypt.hash(password, salt)

		const doc = new userModel({
			email: req.body.email,
			login: req.body.login,
			avatarUrl: req.body.avatarUrl,
			passwordHash: hash,
		})

		const user = await doc.save()

		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret546',
			{ expiresIn: '30d' }
		)

		const { passwordHash, ...userData } = user._doc

		res.json({
			...userData,
			createdAt: format(new Date(userData.createdAt), 'dd.MM.yyyy'),
			token,
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не удалось зарегистрироваться',
		})
	}
}

export const login = async (req, res) => {
	try {
		const user = await userModel.findOne({ email: req.body.email })

		if (!user) {
			return res.status(404).json({
				message:
					'Ошибка авторизации! Пожалуйста, проверьте правильность почты или пароля',
			})
		}

		const isValidPass = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		)

		if (!isValidPass) {
			return res.status(400).json({
				message:
					'Ошибка авторизации! Пожалуйста, проверьте правильность почты или пароля',
			})
		}

		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret546',
			{ expiresIn: '30d' }
		)

		const { passwordHash, ...userData } = user._doc

		res.json({ ...userData, token })
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не удалось авторизоваться',
		})
	}
}

export const getMe = async (req, res) => {
	try {
		const user = await userModel.findById(req.userId)

		if (!user) {
			return res.status(404).json({
				message: 'Пользователь не найден',
			})
		}
		const { passwordHash, ...userData } = user._doc

		res.json({
			...userData,
			createdAt: format(new Date(userData.createdAt), 'dd.MM.yyyy'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Нет доступа',
		})
	}
}

export const update = async (req, res) => {
	try {
		const userId = req.params.id
		const { login, avatarUrl } = req.body

		await userModel.updateOne(
			{
				_id: userId,
			},
			{
				login: login,
				avatarUrl: avatarUrl,
			}
		)

		const updatedUser = await userModel.findById(userId)

		res.json(updatedUser)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не удалось изменить профиль',
		})
	}
}
