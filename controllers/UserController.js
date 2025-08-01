import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import cloudinary from '../cloudinary.js'
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
			createdAt: formatInTimeZone(
				new Date(userData.createdAt),
				'Europe/Kiev',
				'dd.MM.yyyy'
			),
			// createdAt: format(new Date(userData.createdAt), 'dd.MM.yyyy'),
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
					'Помилка авторизації',
			})
		}

		const isValidPass = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		)

		if (!isValidPass) {
			return res.status(400).json({
				message: 'Помилка авторизації',
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

		res.json({
			...userData,
			createdAt: formatInTimeZone(
				new Date(userData.createdAt),
				'Europe/Kiev',
				'dd.MM.yyyy'
			),
			token
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не вдалось зареєструватись',
		})
	}
}

export const getMe = async (req, res) => {
	try {
		const user = await userModel.findById(req.userId)

		if (!user) {
			return res.status(404).json({
				message: 'Користувача не знайдено',
			})
		}
		const { passwordHash, ...userData } = user._doc

		res.json({
			...userData,
			createdAt: formatInTimeZone(
				new Date(userData.createdAt),
				'Europe/Kiev',
				'dd.MM.yyyy'
			),
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Відсутній доступ',
		})
	}
}

export const updateAvatar = async (req, res) => {
	try {
		const userId = req.params.id

		let updatedAvatarUrl = ''

		if (req.file) {
			const cloudinaryUpload = await cloudinary.uploader.upload(req.file.path)
			updatedAvatarUrl = cloudinaryUpload.url
		}

		await userModel.updateOne({ _id: userId }, { avatarUrl: updatedAvatarUrl })

		const updatedUser = await userModel.findById(userId)

		res.json(updatedUser)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не вдалось змінити аватар',
		})
	}
}

export const updateLogin = async (req, res) => {
	try {
		const userId = req.params.id
		const { login } = req.body

		await userModel.updateOne({ _id: userId }, { login: login })

		const updatedUser = await userModel.findById(userId)

		res.json(updatedUser)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не вдалось змінити логін',
		})
	}
}
