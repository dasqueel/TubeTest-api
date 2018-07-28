const mongoose = require('mongoose');
require('../models/youtube');
const Youtube = mongoose.model('Youtube');

require('../models/user');
const User = mongoose.model('User');

const getQuestions = async (req, res) => {
  const videoId = req.params.videoId;
  const user = req.user;

  // fetches questions for a youtube video
  // then adds info if the user voted on the question
  Youtube.findOne({ videoId })
    .select('questions')
    .populate('questions')
    .then(questionsDoc => {
      // possibly do adding in user voting data log here?
      // check if its a call from a logged in you
      // else populate the questions with users voting data
      let questions = questionsDoc.questions;

      // add voting experience with each question
      User.findOne({ _id: user._id })
        .select('votedQuestions')
        .then(votedQuestionsDoc => {
          // let votedQuestionsIds = new Set(votedQuestions.map(q => q._id));
          // the .find() method iterates, it would be better to search in O(1)

          const votedQuestions = votedQuestionsDoc.votedQuestions;
          let newQs = questions.map(q => {
            let votedQuestionObj = votedQuestions.find(vq => vq.questionId === q._id.toString());

            let nqDoc = Object.assign({}, q._doc);
            if (votedQuestionObj) {
              nqDoc.usersVote = votedQuestionObj.vote;
              return nqDoc;
            }
            else {
              nqDoc.usersVote = 0;
              return nqDoc;
            }
          });

          res.json(newQs);
        })
        .catch(err => res.json(err));
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
