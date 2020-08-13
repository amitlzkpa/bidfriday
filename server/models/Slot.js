require('dotenv').config();
const mongoose = require('mongoose');



const SlotSchema = new mongoose.Schema({
  mondayItemId: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "active"
  },
  tenderLineItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderLineItem'
  }],
  bidLineItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidLineItem',
  }]
},
{timestamps: true});



module.exports = mongoose.model('Slot', SlotSchema);