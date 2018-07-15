const mongoose = require('mongoose');
require("../models/question");
const Question = mongoose.model('Question');

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

// also have to check to see if youtube model was created for this video
const create = async (req, res) => {
  const user = req.user;
  const { text, choices, answer, videoId } = req.body;

  let youtubeObjectId;

  try {
    const yt = await Youtube.findOne({ videoId });

    if (yt) youtubeObjectId = yt;
    else youtubeObjectId = null;
  } catch(err) {
    console.log(err);
  }

  if (youtubeObjectId === null) {

    try {
      let yt = await new Youtube({
        // author: null,  // would do some sort of youtube api call to retrieve author data
        videoId,
        // url: `youtube.com/watch?v=${videoId}`, // not needed
        // questionsUrl: `tubetest.herokuapp.com/questions/${videoId}`,  // do not think this is needed
        questions: []
      });

      try {
        let doc = await yt.save();
        youtubeObjectId = doc;
      } catch(err) {
        console.log(err);
      }

    } catch(err) {
      console.log(err);
    }
  }
  // now that a youtube model was created
  // create the new question model
  try {
    const question = await new Question({
      text,
      choices,
      answer,
      author: user,
      youtube: youtubeObjectId
    }).save();
    // save new question object into the youtube model, questions array
    await Youtube.findOneAndUpdate({ "_id" : youtubeObjectId }, { "$push" : { "questions" : question._id }});

    return res.json({
      success: true,
      message: "Successfully created new question"
    });
  } catch (error) {
    console.log(error)
    return res
      .status(STATUS_USER_ERROR)
      .json({ success: false, error: error.message });
  }
}

// dont need this method?
const getQuestions = async (req, res) => {
  const videoId = req.params.videoId;

  // get all the youtube docs with the videoId
  // then

  Question.find({ "youtube.author": "someAuthor" })
  // Question.find({ 'text': 'What is the run time of heapsort?' })
    .populate('question')
    // do some sorting with .sort()
    .then(questions => {
      res.json(questions);
    })
    .catch(err => res.json(err));
};

module.exports = {
  create,
  getQuestions
};