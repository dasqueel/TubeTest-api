const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YoutubeSchema = Schema({
  author: String,
  videoId: String,
  url: String,
  questionsUrl: String,
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }]
});

module.exports = mongoose.model('Youtube', YoutubeSchema);
