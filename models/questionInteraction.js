const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

ideally we would want a time stamp on every answer given

for now we will only record the last attempt timestamp

do we need to have attempts number attribute?  we can just take the length of answers given

*/

const QuestionInteractionSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question'
  },
  date: {
    type: Date,
    default: Date.now
  },
  answersGiven: {
    type: Array
  },
  ratingGiven: {
    type: Number
  }
});

module.exports = mongoose.model('QuestionInteraction', QuestionInteractionSchema);
