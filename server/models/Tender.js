require('dotenv').config();
const mongoose = require('mongoose');



const TenderSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  priceRevealType: {
    type: String,
    default: "concealed"
  },
  mustBidOnAll: {
    type: Boolean,
    default: false
  },
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TenderSlot'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
{timestamps: true});



module.exports = mongoose.model('Tender', TenderSchema);