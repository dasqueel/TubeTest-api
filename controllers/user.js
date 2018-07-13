const mongoose = require('mongoose');
const User = require("../models/user");
require('../models/question');
const getTokenForUser = require('../services/token');

const STATUS_USER_ERROR = 422;

const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const createUser = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const user = await new User({
      email,
      password,
      username
    }).save();

    // create new jwt for new user
    const token = getTokenForUser(user._id);
    return res.json({
      success: true,
      message: "Successfully created new user",
      token
    });
  } catch (error) {
    console.log(error)
    return res
      .status(STATUS_USER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getUserInfo = (req, res) => {
  const user = req.user;

  User.findOne({ _id : user._id})
    .select('username email youtubes questionInteractions')
    .then(user => {
      res.json(user);
    })
    .catch(err => res.json(err));
};

module.exports = {
  createUser,
  getUserInfo
};