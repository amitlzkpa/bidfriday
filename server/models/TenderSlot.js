require('dotenv').config();
const mongoose = require('mongoose');



const TenderSlotSchema = new mongoose.Schema({
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
  tenderLineItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderLineItem'
  }]
},
{timestamps: true});



module.exports = mongoose.model('TenderSlot', TenderSlotSchema);