require('dotenv').config();
const mongoose = require('mongoose');



const BidSlotSchema = new mongoose.Schema({
  mondayItemId: {
    type: String,
    default: ""
  },
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender'
  },
  status: {
    type: String,
    default: "active"
  },
  bidLineItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BidLineItem'
  }],
  tenderLineItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderLineItem'
  }
},
{timestamps: true});



module.exports = mongoose.model('BidSlot', BidSlotSchema);