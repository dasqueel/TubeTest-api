const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = Schema({
  text: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  choices: {
    type: Array,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  youtube: {
    type: Schema.Types.ObjectId,
    ref: 'Youtube'
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
