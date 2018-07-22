const userController = require('../controllers/user');
const youtubeController = require('../controllers/youtube');
const questionController = require('../controllers/question');
const questionInteractionController = require('../controllers/questionInteraction');
const authController = require('../controllers/auth');

const apiPrefix = "/api/v1";

module.exports = (app) => {

  app.route(`${apiPrefix}/register`)
    .post(userController.createUser);

  app.route(`${apiPrefix}/login`)
    .post(authController.requireSignIn, authController.signIn);

  app.route(`${apiPrefix}/user`)
    .get(authController.requireAuth, userController.getUserInfo);

  // get all users questions completed, sorted by time
  app
    .route(`${apiPrefix}/user/questions`)
    .get(authController.requireAuth, questionInteractionController.getUsersQuestions);

  // score a user guess on a question
  app
    .route(`${apiPrefix}/questionInteraction`)
    .post(authController.requireAuth, questionInteractionController.scoreUserGuess);

  // create a new question
  app.route(`${apiPrefix}/question`)
    // .post(authController.requireAuth, questionController.create);
    .post(questionController.create);

  // get a youtube videos questions url
  app.route(`${apiPrefix}/youtube/:videoId`)
    .get(youtubeController.getQuestionsUrl);

  // get questions for a youtube video
  app.route(`${apiPrefix}/question/:videoId`)
    .get(youtubeController.getQuestions);

  app.route(`${apiPrefix}/test`)
    .get((req, res) => res.send("yoooo"));

  // update a users votes for a question
  app.route(`${apiPrefix}/question/vote/:questionId`)  // is there  better rest pattern?
    .post(authController.requireAuth, questionController.updateVote);

  // get all the questions the user has voted on
  app.route(`${apiPrefix}/user/votedQuestions`)
    .get(authController.requireAuth, userController.getUserVotes);
};
