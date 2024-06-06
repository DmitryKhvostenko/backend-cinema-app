import CommentModel from '../models/Comment.js'
import { format } from 'date-fns';

import userModel from '../models/User.js'


export const getAll = async (req, res) => {
  try {
    const comments = await CommentModel.find().populate('user').exec();

    res.json(comments)
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи'
    })
  }
}

export const getByFilmId = async (req, res) => {
  try {
    const filmId = req.params.filmId;
    const comments = await CommentModel.find({ filmId: filmId }).populate({
      path: 'user',
      select: '-email -passwordHash' 
    }).exec();
    const formattedComments = comments.map(comment => ({
      ...comment.toJSON(),
      createdAt: format(comment.createdAt, 'dd.MM.yyyy HH:mm'),
    }));

    res.json(formattedComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарии'
    });
  }
};

export const getByUserId = async (req, res) => {
	try {
		const userId = req.params.userId
		const comments = await CommentModel.find({ user: userId })
			.populate({
				path: 'user',
				select: '-email -passwordHash',
			})
			.exec()
		const formattedComments = comments.map((comment) => ({
			...comment.toJSON(),
			createdAt: format(comment.createdAt, 'dd.MM.yyyy HH:mm'),
		}))

		res.json(formattedComments)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Не удалось получить комментарии',
		})
	}
}


export const getOne = async (req, res) => {
  try {
    const commentId = req.params.id;
    const doc = await CommentModel.findOne({ _id: commentId });
    if (!doc) {
      return res.status(404).json({
        message: 'Комментарий не найден'
      })
    }
      res.json(doc)
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарий'
    })
  }
}

export const remove = async (req, res) => {
  try {
    const commentId = req.params.id;
    
    const doc = await CommentModel.findOneAndDelete({
      _id: commentId,
    });

    if (!doc) {
      return res.status(404).json({
        message: 'Комментарий не найден'
      });
    }
    
    res.json({
      success: true
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить комментарий'
    })
  }
}

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      login: req.body.login,
      text: req.body.text,
      rating: req.body.rating,
      avatarUrl: req.body.avatarUrl,
      user: req.userId,
      filmId: req.body.filmId
    })

    const comment = await doc.save();

    res.json(comment)
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось добавить комментарий'
    })
  }
}

export const update = async (req, res) => {
  try {
    const commentId = req.params.id;
    await CommentModel.updateOne({
      _id: commentId,
    }, {
      login: req.body.login,
      text: req.body.text,
      rating: req.body.rating,
      avatarUrl: req.body.avatarUrl,
      user: req.userId,
    })
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось изменить комментарий'
    })
  }
}