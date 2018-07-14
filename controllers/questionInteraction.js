const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
require('../models/questionInteraction');
const QuestionInteraction = mongoose.model('QuestionInteraction');

const STATUS_USER_ERROR = 422;

const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const getUsersQuestions = async (req, res) => {
  const user = req.user;
  QuestionInteraction.find({ user: new ObjectId(user._id) })
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
    res.json(result);
  });

};

module.exports = {
  getUsersQuestions,
  scoreUserGuess
};
