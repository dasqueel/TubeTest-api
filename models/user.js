const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const ObjectId = mongoose.SchemaTypes.ObjectId;
const User = require('./user.js');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  questionInteractions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'QuestionInteractions'
    }
  ],
  youtubes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Youtube'
    }
  ]
});

UserSchema.pre('save', async function(next) {
  try {
    const hash = await bcrypt.hash(this.password, 11);
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.checkPassword = async function(password, cb) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return cb(null, isMatch);
  } catch (error) {
    return cb(error);
  }
};

module.exports = mongoose.model('User', UserSchema);