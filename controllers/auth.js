const { requireSignIn, requireAuth } = require('../services/passport');
const getTokenForUser = require('../services/token');

const signIn = (req, res) => {
  // const token = getTokenForUser(req.user);
  // console.log(token);
  res.send({ token: getTokenForUser(req.user) });
  // res.send({ token })
};

// have signout method
// which would be destorying the token thats cached?

module.exports = { signIn, requireSignIn, requireAuth };
