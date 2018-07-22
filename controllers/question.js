const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
require("../models/question");
const Question = mongoose.model('Question');

require('../models/user');
const User = mongoose.model('User');

require('../models/youtube');
const Youtube = mongoose.model('Youtube');

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

const updateVote = async (req, res) => {
  const user = req.user;
  const questionId = req.params.questionId;
  const voteType = req.body.voteType;

  let alreadyVoted = false;

  let votedCheckDoc;
  try {
    votedCheckDoc = await User.findOne({ _id: ObjectId(user._id), votedQuestions: { $elemMatch: { questionId: questionId } } });
    if (votedCheckDoc) {
      alreadyVoted = true;

      // toggle the question.upvote boolean value
      for (let i = 0; i < votedCheckDoc.votedQuestions.length; i++) {
        let question = votedCheckDoc.votedQuestions[i];
        if (question.questionId === questionId) {
          votedCheckDoc.votedQuestions[i].upvote = !votedCheckDoc.votedQuestions[i].upvote;
          break;
        }
      }

      votedCheckDoc.save();
        // .then(newDoc => console.log('new toggled vote doc: ', newDoc))
        // .catch(err => console.log(err));
    };
  }
  catch (err) {
    votedCheckDoc = err;
  }

  // decrement vote if user already voted on question already
  if (alreadyVoted) {
    let update;
    if (voteType === 'upvote') update = { $inc: { downvotes: -1 } };
    else update = { $inc: { upvotes: -1 } };
    Question.findByIdAndUpdate(questionId, update)
      .then(doc => console.log('should undo; doc: ', doc))
      .catch(err => console.log(err));
  }

  // update the question doc by incremending the upvote / downvote number
  if (voteType === 'upvote') update = { $inc: { upvotes: 1 } };
  else if (voteType === 'downvote') update = { $inc: { downvotes: 1 } };
  const options = { new: true, returnNewDocument: true };

  Question.findByIdAndUpdate(questionId, update, options)
    .then(doc => {
      // or return a json success message
      res.json(doc);
    })
    .catch(err => res.json(err));

};

module.exports = {
  create,
  getQuestions,
  updateVote
};