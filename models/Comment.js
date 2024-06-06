import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: false
  },
  filmId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatarUrl: String
}, {
  timestamps: true,
});

export default mongoose.model('Comment', CommentSchema)