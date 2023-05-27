const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Course = require("./Course");
const User = require("./User");

const videoSchema = new Schema({
  courseID: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
  },
  minutes: {
    type: Number,
  },
  seconds: {
    type: Number,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  tags: [String],
});

module.exports = mongoose.model("Video", videoSchema);
