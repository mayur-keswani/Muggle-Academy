const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const courseSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    basic: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    intermediate: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    advance: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  facultyAccess: [String],
  tags: [String],

  // Questions:[ { question:"", answer:[{userID:1234, text:'This is my answer' }]    }]
});

module.exports = mongoose.model("Course", courseSchema);
