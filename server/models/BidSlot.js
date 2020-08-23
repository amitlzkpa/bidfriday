require('dotenv').config();
const mongoose = require('mongoose');



const BidSlotSchema = new mongoose.Schema({
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  status: {
    type: String,
    default: "active"
  },
  bidLineItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidLineItem'
  }],
  tenderSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderSlot'
  }
},
{timestamps: true});



module.exports = mongoose.model('BidSlot', BidSlotSchema);