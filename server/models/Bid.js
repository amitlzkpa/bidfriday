require('dotenv').config();
const mongoose = require('mongoose');



const BidSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    default: null
  },
  name: {
    type: String,
    index: true,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidLineItem'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
{timestamps: true});



module.exports = mongoose.model('Bid', BidSchema);