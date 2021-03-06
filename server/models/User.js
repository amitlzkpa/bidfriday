require('dotenv').config();
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
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
    required: true,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  phone: {
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
    default: "{}"
  },
}, {timestamps: true});



module.exports = mongoose.model('User', UserSchema);