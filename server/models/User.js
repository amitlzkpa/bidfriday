require('dotenv').config();
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  name: {
    type: String,
    index: true,
    default: ""
  },
  email: {
    type: String,
    index: true,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  permissions: {
    admin: {
      type: Boolean,
      default: false
    }
  },
  tokens: {
    type: String,
    default: ""
  },
}, {timestamps: true});



module.exports = mongoose.model('User', UserSchema);