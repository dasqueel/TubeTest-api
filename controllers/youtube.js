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

// returns bool if there is a set of question for a youtube video
const getQuestionsUrl = async (req, res) => {
  const videoId = req.params.videoId;

  Youtube.findOne({ videoId })
    .then(doc => {
      if (doc) res.json(true);
      else res.json(false);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

module.exports = {
  getQuestions,
  getQuestionsUrl
};
