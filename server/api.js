require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');
const monday = require('monday-sdk-js')();

const BoardPair = require('./models/BoardPair');
const User = require('./models/User');
const Tender = require('./models/Tender');
const Slot = require('./models/Slot');
const TenderLineItem = require('./models/TenderLineItem');


// ---------------------------------


async function addUserToReq(req, res, next) {
  let userEmail = req.headers.email;
  let user = await User.findOne({email: userEmail.toLowerCase()});
  if (user) {
    req.user = user;
  }
  next();
}


// ---------------------------------


router.get('/test', async (req, res) => {
  return res.send('Bidfriday backend test route');
});



router.post('/sync-boardpairs', async (req, res) => {
  let pairs = req.body;
  let r;
  let ret = [];
  for (let pair of pairs) {
    r = await BoardPair.findOne({ requestBoard: pair.requestBoard })
    if (!r) {
      r = new BoardPair({ requestBoard: pair.requestBoard });
    }
    if (r.bidsBoard !== pair.bidsBoard) {
      r.bidsBoard = pair.bidsBoard;
      await r.save();
    }
    ret.push(r);
  }
  return res.send(ret);
});



router.get('/boardpair-from-requestboard/:requestBoard', async (req, res) => {
  let b = await BoardPair.findOne({ requestBoard: req.params.requestBoard })
  return res.send(b);
});



router.get('/boardpair-from-bidsboard/:bidsBoard', async (req, res) => {
  let b = await BoardPair.findOne({ bidsBoard: req.params.bidsBoard })
  return res.send(b);
});



router.post('/create-tender', async (req, res) => {
  let user;
  // fetch user
  
  let tInfo = req.body;
  console.log(tInfo);
  let boardInfo = tInfo.boards[0];

  let tender = new Tender({
    name: boardInfo.name,
    createdBy: user
  });
  tender = await tender.save();

  let slots = [];
  
  for(let lineItem of boardInfo.items) {
    let slot = new Slot({
      mondayItemId: lineItem.id
    });
    slot = await slot.save();
    let item = new TenderLineItem({
      tender: tender,
      slot: slot,
      name: lineItem.name,
      description: "",
      specifications: lineItem.column_values[0].text,
      units: lineItem.column_values[1].text,
      quantity: parseFloat(lineItem.column_values[2].text),
      rate: parseFloat(lineItem.column_values[3].text),
      status: lineItem.column_values[8].text,
      createdBy: user
    });
    item = await item.save();
    slot.tenderLineItems.push(item);
    slot = await slot.save();
    slots.push(slot);
  }

  tender.slots = slots;
  tender = await tender.save();

  return res.json(tender);
});



router.post('/update-tender', async (req, res) => {
  let user;
  // fetch user
  
  let tInfo = req.body;
  console.log(tInfo);
  let tId = req.body.tenderId;
  let boardInfo = tInfo.boards[0];

  let tender = await Tender.findOne({ _id: tId });
  if (!tender) {
    tender = new Tender({
      name: boardInfo.name,
    });
    tender = await tender.save();
  }

  // keep check of the existing slots and new ones so that the rest can be marked inactive
  let activeSlots = [];
  
  for(let lineItem of boardInfo.items) {
    let slot;
    slot = await Slot.findOne({
      mondayItemId: lineItem.id
    });
    // a new line item - create a new slot
    if (!slot) {
      slot = new Slot({
        mondayItemId: lineItem._id,
        tender: tender
      });
      slot = await slot.save();
      tender.slots.push(slot);
      tender = await tender.save();
    }
    // add to array of active slots
    activeSlots.push(slot._id);

    // get the key of the latest version of the tender item at this slot
    let latestTenderItemId = slot.tenderLineItems[slot.tenderLineItems.length - 1];
    // get the tender line item from the db
    let latestTenderItemInSlot = await TenderLineItem.findOne({ _id: latestTenderItemId });
    // an empty slot (probably new) - add an empty tender item; will be updated next
    if (!latestTenderItemInSlot) {
      latestTenderItemInSlot = new TenderLineItem();
      latestTenderItemInSlot = await latestTenderItemInSlot.save();
    }

    let bidfridaySpecifications = latestTenderItemInSlot.specifications;
    let bidfridayUnits = latestTenderItemInSlot.units;
    let bidfridayQuantity = latestTenderItemInSlot.quantity;
    let bidfridayRate = latestTenderItemInSlot.rate;
    let bidfridayStatus = latestTenderItemInSlot.status;

    let mondaySpecifications = lineItem.column_values[0].text;
    let mondayUnits = lineItem.column_values[1].text;
    let mondayQuantity = parseFloat(lineItem.column_values[2].text);
    let mondayRate = parseFloat(lineItem.column_values[3].text);
    let mondayStatus = lineItem.column_values[8].text;

    let isSame = 
         (bidfridaySpecifications === mondaySpecifications)
      && (bidfridayUnits === mondayUnits)
      && (bidfridayQuantity === mondayQuantity)
      && (bidfridayRate === mondayRate)
      && (bidfridayStatus === mondayStatus);

    if (!isSame) {
      let item = new TenderLineItem({
        tender: tender,
        slot: slot,
        name: lineItem.name,
        description: "",
        specifications: mondaySpecifications,
        units: mondayUnits,
        quantity: mondayQuantity,
        rate: mondayRate,
        status: mondayStatus,
        createdBy: user
      });
      item = await item.save();
      slot.tenderLineItems.push(item);
      slot = await slot.save();
    }
  }

  for(let slot in tender.slots) {
    if(!activeSlots.includes(slot._id)) {
      slot.status = "inactive";
      slot = await slot.save();
    }
  }

  return res.json(tender);
});




router.post('/connect-monday-user', async (req, res) => {
  try {
    let code = req.body.code;
    let tokenEndPt = 'https://auth.monday.com/oauth2/token';
    let tokenReqBody = {
      client_id: process.env.MONDAY_CLIENTID,
      client_secret: process.env.MONDAY_CLIENTSECRET,
      redirect_uri: process.env.MONDAY_REDIRECTURI,
      code: code
    };
    let at = await axios.post(tokenEndPt, tokenReqBody);
    let accessToken = at.data.access_token;
    monday.setToken(accessToken);
    let qRes = await monday.api('query { me { id name email country_code location url account { id name } } }');
    let uData = qRes.data.me;
    let u = await User.findOne({ email: uData.email });
    if (u) {
      let currTokens = JSON.parse(u.tokens);
      currTokens.monday = accessToken;
      u.tokens = JSON.stringify(currTokens);
    } else {
      u = new User({
        name: uData.name,
        email: uData.email.toLowerCase(),
        username: uData.account.name,
        tokens: `{ "monday": "${accessToken}" }`
      });
    }
    u = await u.save();
    return res.json(u);
  } catch (excp) {
    console.log(excp);
    return res.status(500).send();
  }
});



module.exports = router;