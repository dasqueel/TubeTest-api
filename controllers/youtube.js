const mongoose = require('mongoose');
require('../models/youtube');
const Youtube = mongoose.model('Youtube');

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
