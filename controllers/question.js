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

  let prevVote;
  let userVotedCheckDoc;

  try {
    userVotedCheckDoc = await User.findOne({ _id: ObjectId(user._id), votedQuestions: { $elemMatch: { questionId: questionId } } });
  }
  catch(err) {
    // would log error
    console.log(err);
    userVotedCheckDoc = err;
  }

  // if user already voted
  if (userVotedCheckDoc) {

    // update the userDoc votedQuestions obj vote to the new vote state
    for (let i = 0; i < userVotedCheckDoc.votedQuestions.length; i++) {
      let question = userVotedCheckDoc.votedQuestions[i];
      if (question.questionId === questionId) {
        prevVote = question.vote;
        // case when a user toggles off a vote to a neutral vote
        if (prevVote === voteType) userVotedCheckDoc.votedQuestions[i].vote = 0;
        else userVotedCheckDoc.votedQuestions[i].vote = voteType;
        break;
      }
    }

    // save the new userDoc which has the update vote recording
    userVotedCheckDoc.save()
      .then(updatedUserDoc => {

        // update the questionDoc
        // has 6 different situations to update to
        if (voteType === 1 && prevVote === 1) questionUpdate = { $inc: { upvotes: -1 } };
        if (voteType === -1 && prevVote === -1) questionUpdate = { $inc: { downvotes: -1 } };
        if (voteType === 1 && prevVote === 0) questionUpdate = { $inc: { upvotes: 1 } };
        if (voteType === -1 && prevVote === 0) questionUpdate = { $inc: { downvotes: 1 } };
        if (voteType === 1 && prevVote === -1) questionUpdate = { $inc: { downvotes: -1, upvotes: 1 } };
        if (voteType === -1 && prevVote === 1) questionUpdate = { $inc: { downvotes: 1, upvotes: -1 } };
        const questionOptions = { new: true, returnnewUserDocument: true };

        Question.findByIdAndUpdate(questionId, questionUpdate, questionOptions)
          .then(updatedQuestionDoc => {
            res.json({ success: true });
          })
          .catch(err => res.json(err));
      })
      .catch(err => console.log('saving already voted doc update; err: ', err));

  }

  // user has never voted on question before
  else {
    const newVoteObj = { questionId, vote : voteType };
    let update = { $push: { votedQuestions : newVoteObj } };

    User.findByIdAndUpdate(user._id, update).exec();

    if (voteType === 1) questionUpdate = { $inc: { upvotes: 1 } };
    else if (voteType === -1) questionUpdate = { $inc: { downvotes: 1 } };

    Question.findByIdAndUpdate(questionId, questionUpdate)
      .then(doc => {
        // or return a json success message
        res.json({ success: true });
      })
      .catch(err => res.json(err));
  }
};

module.exports = {
  create,
  getQuestions,
  updateVote
};