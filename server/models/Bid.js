require('dotenv').config();
const mongoose = require('mongoose');



const BidSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    default: null
  },
  description: {
    type: String,
    default: ""
  },
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidSlot'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
{timestamps: true});



module.exports = mongoose.model('Bid', BidSchema);