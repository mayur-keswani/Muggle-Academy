const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const noticeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  noticeFor: {
    type: String,
    required: true,
    default: "student",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  designation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Notice", noticeSchema);
