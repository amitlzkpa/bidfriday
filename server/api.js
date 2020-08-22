require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');
const monday = require('monday-sdk-js')();

const BoardPair = require('./models/BoardPair');
const User = require('./models/User');
const Tender = require('./models/Tender');
const Slot = require('./models/Slot');
const TenderLineItem = require('./models/TenderLineItem');
const Bid = require('./models/Bid');
const BidLineItem = require('./models/BidLineItem');


// ---------------------------------


async function addUserToReq(req, res, next) {
  if (req.user) next();
  let userEmail = req.headers.email;
  let user = await User.findOne({email: userEmail.toLowerCase()});
  if (user) {
    req.user = user;
  }
  next();
}


// ---------------------------------


router.post('/test', [addUserToReq], async (req, res) => {
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



router.post('/create-or-update-tender', [addUserToReq], async (req, res) => {
  let user = req.user;
  let tId = req.body.tenderId;
  let requestBoardId = req.body.requestBoardId;

  let tokens = JSON.parse(req.user.tokens);
  let mondayToken = tokens.monday;
  
  monday.setToken(mondayToken);
  let queryStr = `query { boards (ids: ${requestBoardId}) { id name columns { id title } items { id name column_values { text value } } } }`;
  let qRes = await monday.api(queryStr);

  let boardInfo = qRes.data.boards[0];

  let tender = await Tender.findOne({ _id: tId });
  if (!tender) {
    tender = new Tender({
      name: boardInfo.name,
      createdBy: user
    });
    tender = await tender.save();
  }

  // keep check of the existing slots and new ones so that the rest can be marked inactive
  let activeSlots = [];
  
  for(let lineItem of boardInfo.items) {
    let slot;
    slot = await Slot.findOne({
      mondayItemId: lineItem.id,
      tender: tender
    });
    // a new line item - create a new slot
    if (!slot) {
      slot = new Slot({
        mondayItemId: lineItem.id,
        tender: tender
      });
      slot = await slot.save();
      tender.slots.push(slot._id);
    }
    // add to array of active slots
    slot.status = "active";
    slot = await slot.save();
    activeSlots.push(slot._id.toString());

    // only slots that've just been created will have an empty tenderLineItems array
    let latestTenderItemInSlot;
    if (slot.tenderLineItems.length < 1) {
      // if its a new lineItem set the latest var to an empty object to allow the checks for sameness below to work
      latestTenderItemInSlot = new TenderLineItem();
    } else {
      // if not fetch it from db
      latestTenderItemInSlot = await TenderLineItem.findOne({ _id: slot.tenderLineItems[slot.tenderLineItems.length - 1] });
    }

    
    let bidfridayName = latestTenderItemInSlot.name;
    let bidfridaySpecifications = latestTenderItemInSlot.specifications;
    let bidfridayUnits = latestTenderItemInSlot.units;
    let bidfridayQuantity = latestTenderItemInSlot.quantity;
    let bidfridayRate = latestTenderItemInSlot.rate;
    let bidfridayStatus = latestTenderItemInSlot.status;
    let bidfridayImageData = latestTenderItemInSlot.sampleImages;
    let bidfridayAttachmentData = latestTenderItemInSlot.attachments;

    let mondayName = lineItem.name;
    let mondaySpecifications = lineItem.column_values[0].text;
    let mondayUnits = lineItem.column_values[1].text;
    let mondayQuantity = parseFloat(lineItem.column_values[2].text);
    let mondayRate = parseFloat(lineItem.column_values[3].text);
    let mondayStatus = lineItem.column_values[8].text;
    let mondayImageData = JSON.stringify(lineItem.column_values[6]);
    let mondayAttachmentData = JSON.stringify(lineItem.column_values[7]);

    let needsUpdate = 
         (bidfridayName !== mondayName)
      || (bidfridaySpecifications !== mondaySpecifications)
      || (bidfridayUnits !== mondayUnits)
      || (bidfridayQuantity !== mondayQuantity)
      || (bidfridayRate !== mondayRate)
      || (bidfridayStatus !== mondayStatus)
      || (bidfridayImageData !== mondayImageData)
      || (bidfridayAttachmentData !== mondayAttachmentData);

    if (needsUpdate) {
      latestTenderItemInSlot = new TenderLineItem({
        tender: tender,
        slot: slot,
        name: lineItem.name,
        description: "",
        specifications: mondaySpecifications,
        units: mondayUnits,
        quantity: mondayQuantity,
        rate: mondayRate,
        sampleImages: mondayImageData,
        attachments: mondayAttachmentData,
        status: mondayStatus,
        createdBy: user
      });
      latestTenderItemInSlot = await latestTenderItemInSlot.save();
      slot.tenderLineItems.push(latestTenderItemInSlot._id);
      slot = await slot.save();
    }
  }

  for(let sl of tender.slots) {
    if(!activeSlots.includes(sl._id.toString())) {
      let slt = await Slot.findOne({ _id: sl._id });
      slt.status = "inactive";
      slt = await slt.save();
    }
  }

  tender = await tender.save();

  tender = await tender.populate({
    path: 'slots',
    populate: {
      path: 'tenderLineItems'
    }
  }).execPopulate();

  return res.json(tender);
});



router.post('/get-tender', async (req, res) => {
  let tId = req.body.tId;
  let tender = await Tender.findOne({ _id: tId });
  tender = await tender.populate({
    path: 'slots',
    match: { status: "active" },
    populate: {
      path: 'tenderLineItems'
    }
  })
  .populate('createdBy')
  .execPopulate();
  return res.json(tender);
});



router.post('/create-bid', async (req, res) => {
  let bidData = req.body.bidData;
  let bidfridayBid = await Bid.findOne({ _id: bidData.bidId });
  if (!bidfridayBid) {
    bidfridayBid = new Bid({
      tender: bidData.tenderId
    });
    bidfridayBid = await bidfridayBid.save();
  }
  bidfridayBid.description = bidData.bidDescription;
  for(let slotData of bidData.slotData) {
    let slot = await Slot.findOne({ _id: slotData.slotId });
    if (!bidfridayBid.slots.includes(slotData.slotId)) {
      bidfridayBid.slots.push(slotData.slotId);
    }
    let assocTenderLineItem = await TenderLineItem.findOne({ _id: slotData.tenderLineItemId });
    let latestBidLineItem = await BidLineItem.findOne({ _id: slot.bidLineItems[slot.bidLineItems.length - 1] });
    if (!latestBidLineItem) {
      latestBidLineItem = new BidLineItem();
    }
    let needsUpdate = (latestBidLineItem.name !== slotData.name)
                    ||(latestBidLineItem.rate !== slotData.rate)
                    ||(latestBidLineItem.description !== slotData.description)
                    ||(latestBidLineItem.specification !== slotData.specification);
    // console.log(slotData);
    // console.log(needsUpdate);
    // console.log(latestBidLineItem.name, slotData.name);
    // console.log(latestBidLineItem.rate, slotData.rate);
    // console.log(latestBidLineItem.description, slotData.description);
    // console.log(latestBidLineItem.specification, slotData.specification);
    // console.log('------------------');
    if (needsUpdate) {
      latestBidLineItem = new BidLineItem({
        bid: bidfridayBid,
        slot: slot,
        tenderLineItem: assocTenderLineItem,
        name: slotData.name,
        rate: slotData.rate,
        specifications: slotData.specifications,
        description: slotData.description,
      });
      latestBidLineItem = await latestBidLineItem.save();
      slot.bidLineItems.push(latestBidLineItem);
      slot = await slot.save();
    }
  }
  bidfridayBid = await bidfridayBid.save();
  console.log(bidfridayBid);
  return res.json(bidfridayBid);
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
      let currTokens = (u.tokens === "") ? {} : JSON.parse(u.tokens);
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



router.post('/asset', async (req, res) => {
  let assetId = req.body.assetId;
  let user = await User.findOne({ email: req.body.creatorEmail.toLowerCase() });

  let tokens = JSON.parse(user.tokens);
  let mondayToken = tokens.monday;
  monday.setToken(mondayToken);
  
  let queryStr = `query { assets (ids: [${assetId}]) { id name url public_url } }`;
  let qRes = await monday.api(queryStr);

  return res.json(qRes.data);
});


router.post('/users', async (req, res) => {
  const u = req.body;
  if (!u || u === {}) {
    return res.status(400).send();
  }
  let user = await User.findOne({ email: u.email });
  if (user) {
    return res.json(user);
  }
  user = new User({
    username: u.nickname,
    name: u.name,
    email: u.email
  });
  user = await user.save();
  return res.json(user);
});



module.exports = router;