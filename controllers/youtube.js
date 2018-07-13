const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
require('../models/youtube');
const Youtube = mongoose.model('Youtube');

const STATUS_USER_ERROR = 422;

const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const getQuestions = async (req, res) => {
  const videoId = req.params.videoId;

  Youtube.findOne({ videoId })
    .select('questions')
    .populate('questions')
    .then(questions => {
      res.json(questions);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const getQuestionsUrl = async (req, res) => {
  const videoId = req.params.videoId;

  Youtube.findOne({ videoId })
    .select('questionsUrl')
    .then(questionsUrl => {
      res.json(questionsUrl);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

module.exports = {
  getQuestions,
  getQuestionsUrl
};
