const { requireSignIn, requireAuth } = require('../services/passport');
const getTokenForUser = require('../services/token');

const signIn = (req, res) => {
  res.send({ token: getTokenForUser(req.user) });
};

// have signout method
// which would be destorying the token thats cached?

module.exports = { signIn, requireSignIn, requireAuth };
