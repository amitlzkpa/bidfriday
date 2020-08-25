require('dotenv').config();
const mongoose = require('mongoose');



const TenderLineItemSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    default: null
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderSlot'
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
    default: -1
  },
  sampleImages: {
    type: String,
    default: "{\"text\":\"\",\"value\":null}"
  },
  attachments: {
    type: String,
    default: "{\"text\":\"\",\"value\":null}"
  },
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



module.exports = mongoose.model('TenderLineItem', TenderLineItemSchema);