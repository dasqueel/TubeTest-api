const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
require('../models/questionInteraction');
const QuestionInteraction = mongoose.model('QuestionInteraction');

require('../models/user');
const User = mongoose.model('User');

const getUsersQuestions = async (req, res) => {
  const user = req.user;
  QuestionInteraction.find({ user: new ObjectId(user._id) })
    .select('question')
    .populate({ path: 'question', select: 'text' })
    .limit(5)
    .then((questions) => {
      res.json(questions);
    })
    .catch((err) => {
      res.status(500).json(err);
    })
};

const scoreUserGuess = async (req, res) => {
  const user = req.user;
  const { questionId, choice } = req.body;

  const query = { question: ObjectId(questionId), user: ObjectId(user.id) };
  const update = { $set: { date: Date.now() }, $push: { answersGiven: choice } };
  const options = { upsert: true, new: true, returnNewDocument: true };

  // Find the document
  QuestionInteraction.findOneAndUpdate(query, update, options, (err, result) => {
    if (err) res.json(err);

    // addToSet (push if not exists) questionInteraction to users array field
    const usersQuery = { _id: ObjectId(user.id) };
    const usersUpdate = { $addToSet: { questionInteractions: result._id } };
    User.findOneAndUpdate(usersQuery, usersUpdate, options, (err2, result2) => {
      if (err2) res.json(err2);
      res.json(result);
    })
  });

};

module.exports = {
  getUsersQuestions,
  scoreUserGuess
};
