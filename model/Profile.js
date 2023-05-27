const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: {
    type: String,
    required: true,
  },
  profile_pic: {
    type: String,
  },
  college: {
    type: String,
  },
  course: {
    type: String,
  },
  semester: {
    type: Number,
  },
  contact_no: {
    type: Number,
  },
  address: {
    type: String,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
