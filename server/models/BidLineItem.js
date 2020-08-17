require('dotenv').config();
const mongoose = require('mongoose');



const BidLineItemSchema = new mongoose.Schema({
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
  },
  tenderLineItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderLineItem',
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
  specifications: {
    type: String,
    default: ""
  },
  units: {
    type: String,
    default: ""
  },
  quantity: {
    type: Number,
    default: 1
  },
  rate: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  sampleImages: [],
  attachments: [],
  status: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
{timestamps: true});



module.exports = mongoose.model('BidLineItem', BidLineItemSchema);