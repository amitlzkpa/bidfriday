require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');
const monday = require('monday-sdk-js')();
const jwt = require('jsonwebtoken');

const BoardPair = require('./models/BoardPair');
const User = require('./models/User');
const Tender = require('./models/Tender');
const TenderSlot = require('./models/TenderSlot');
const TenderLineItem = require('./models/TenderLineItem');
const Bid = require('./models/Bid');
const BidLineItem = require('./models/BidLineItem');
const BidSlot = require('./models/BidSlot');


// ---------------------------------



let BIDFRIDAY_SECRET = process.env.BIDFRIDAY_SECRET;



async function addUserToReq(req, res, next) {
  if (req.user) next();
  let userEmail = req.headers.email;
  let user = await User.findOne({email: userEmail.toLowerCase()});
  req.user = user;
  next();
}



async function authorizeUser(req, res, next) {
  if (!req.user) return res.status(403).send();
  let token = req.headers.bftoken;
  let decoded = jwt.verify(token, BIDFRIDAY_SECRET);
  if (decoded.email !== req.user.email) return res.status(403).send();
  return next();
}


// ---------------------------------



router.post('/test', [addUserToReq, authorizeUser], async (req, res) => {
  return res.send('Bidfriday backend test route');
});



router.post('/sync-boardpairs', [addUserToReq, authorizeUser], async (req, res) => {
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



router.get('/boardpair-from-requestboard/:requestBoard', [addUserToReq, authorizeUser], async (req, res) => {
  let b = await BoardPair.findOne({ requestBoard: req.params.requestBoard })
  return res.send(b);
});



router.get('/boardpair-from-bidsboard/:bidsBoard', [addUserToReq, authorizeUser], async (req, res) => {
  let b = await BoardPair.findOne({ bidsBoard: req.params.bidsBoard })
  return res.send(b);
});



// ---------------------------------



function average(arr){
  var sum = 0;
  for(var i in arr) {
      sum += arr[i];
  }
  var numbersCnt = arr.length;
  return (sum / numbersCnt);
}



router.post('/create-or-update-tender', [addUserToReq, authorizeUser], async (req, res) => {
  let user = req.user;
  let tId = req.body.tenderId;
  let requestBoardId = req.body.requestBoardId;
  let priceRevealSettings = req.body.priceRevealSettings;
  let mustBidOnAll = req.body.mustBidOnAll;
  let description = req.body.description;

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

  if (boardInfo.columns.length < 1) return res.json(tender);

  let specsColIdx = boardInfo.columns.findIndex(c => c.title.toLowerCase() === 'specifications') - 1;
  let unitsColIdx = boardInfo.columns.findIndex(c => c.title.toLowerCase() === 'units') - 1;
  let qtyColIdx = boardInfo.columns.findIndex(c => c.title.toLowerCase() === 'quantity') - 1;
  let rateColIdx = boardInfo.columns.findIndex(c => c.title.toLowerCase() === 'rate') - 1;
  let imgColIdx = boardInfo.columns.findIndex(c => c.title.toLowerCase() === 'sample images') - 1;
  let attColIdx = boardInfo.columns.findIndex(c => c.title.toLowerCase() === 'attachments') - 1;

  // keep check of the existing slots and new ones so that the rest can be marked inactive
  let activeSlots = [];
  
  for(let lineItem of boardInfo.items) {
    let slot;
    slot = await TenderSlot.findOne({
      mondayItemId: lineItem.id,
      tender: tender
    });
    // a new line item - create a new slot
    if (!slot) {
      slot = new TenderSlot({
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
    let bidfridayImageData = latestTenderItemInSlot.sampleImages;
    let bidfridayAttachmentData = latestTenderItemInSlot.attachments;

    let mondayName = lineItem.name;
    let mondaySpecifications = lineItem.column_values[specsColIdx].text;
    let mondayUnits = lineItem.column_values[unitsColIdx].text;
    let mondayQuantity = parseFloat(lineItem.column_values[qtyColIdx].text);
    let mondayRate = parseFloat(lineItem.column_values[rateColIdx].text);
    let mondayImageData = JSON.stringify(lineItem.column_values[imgColIdx]);
    let mondayAttachmentData = JSON.stringify(lineItem.column_values[attColIdx]);

    let needsUpdate = 
         (bidfridayName !== mondayName)
      || (bidfridaySpecifications !== mondaySpecifications)
      || (bidfridayUnits !== mondayUnits)
      || (bidfridayQuantity !== mondayQuantity)
      || (bidfridayRate !== mondayRate)
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
        quantity: isNaN(mondayQuantity) ? 0 : mondayQuantity,
        rate: isNaN(mondayRate) ? 0 : mondayRate,
        sampleImages: mondayImageData,
        attachments: mondayAttachmentData,
        status: "",
        createdBy: user
      });
      latestTenderItemInSlot = await latestTenderItemInSlot.save();
      slot.tenderLineItems.push(latestTenderItemInSlot._id);
      slot = await slot.save();
    }
  }

  for(let sl of tender.slots) {
    if(!activeSlots.includes(sl._id.toString())) {
      let slt = await TenderSlot.findOne({ _id: sl._id });
      slt.status = "inactive";
      slt = await slt.save();
    }
  }

  tender.description = description;
  tender.mustBidOnAll = mustBidOnAll;
  tender.priceRevealSettings = priceRevealSettings;

  tender = await tender.save();

  tender = await tender.populate({
    path: 'slots',
    populate: {
      path: 'tenderLineItems'
    }
  })
  .populate('createdBy', ['name', 'email'])
  .execPopulate();

  return res.json(tender);
});



router.post('/get-tender', async (req, res) => {
  let tId = req.body.tId;
  let tender = await Tender.findOne({ _id: tId });
  if (!tender) {
    return res.json({});
  }
  tender = await tender.populate({
    path: 'slots',
    match: { status: "active" },
    populate: {
      path: 'tenderLineItems'
    }
  })
  .populate('createdBy', ['name', 'email'])
  .execPopulate();
  let ret = {
    tender: tender
  };
  return res.json(ret);
});



router.post('/get-tender-and-bids', [addUserToReq], async (req, res) => {
  let tId = req.body.tId;
  let includeStaleBids = !!req.body.includeStaleBids;
  let tender = await Tender.findOne({ _id: tId });
  if (!tender) {
    return res.json(null);
  }
  let priceRevealSettings = JSON.parse(tender.priceRevealSettings);
  let ret = {};
  tender = await tender.populate({
    path: 'slots',
    match: { status: "active" },
    populate: {
      path: 'tenderLineItems'
    }
  })
  .populate('createdBy', ['name', 'email'])
  .execPopulate();
  ret.tender = tender;
  
  let bids = await Bid.find({ tender: tender._id })
                      .populate({
                        path: 'slots',
                        match: { status: "active" },
                        populate: {
                          path: 'bidLineItems'
                        }
                      })
                      .populate('createdBy', ['name', 'email']);
  ret.bids = bids;

  let bidStats = [];
  for(let tSlot of tender.slots) {
    let latestTLI = tSlot.tenderLineItems[tSlot.tenderLineItems.length - 1];
    let latestBLIsOnThisSlot = [];
    let bidwiseBidsHistory = [];
    for(let bid of bids) {
      let bSlotFortSlot = bid.slots.filter(b => b.tenderSlot._id.equals(tSlot._id))[0];
      if (!bSlotFortSlot) continue;
      bidwiseBidsHistory.push({
        bid: bid,
        history: bSlotFortSlot.bidLineItems
      });
      if (bSlotFortSlot && bSlotFortSlot.bidLineItems && bSlotFortSlot.bidLineItems.length > 0){
        let latestBLI = bSlotFortSlot.bidLineItems[bSlotFortSlot.bidLineItems.length - 1];
        if (includeStaleBids || latestBLI.tenderLineItem._id.equals(latestTLI._id)) {
          latestBLI = await latestBLI.populate('createdBy', ['name', 'email'])
                                    .populate('tenderLineItem')
                                    .execPopulate();
          latestBLIsOnThisSlot.push(latestBLI);
        }
      }
    }
    latestBLIsOnThisSlot = latestBLIsOnThisSlot.sort((a, b) => a.rate < b.rate ? -1 : 1);
    let isOwner = tender.createdBy.email === req.user.email;
    // let isOwner = true;
    let statsItem = {};
    statsItem.tenderSlot = tSlot._id;
    if (isOwner) {
      statsItem.mondayItemId = tSlot.mondayItemId;
      statsItem.latestBids = latestBLIsOnThisSlot;
      statsItem.bidwiseBidsHistory = bidwiseBidsHistory;
    }
    if (isOwner || priceRevealSettings.count) {
      let count = latestBLIsOnThisSlot.length;
      statsItem.count = count;
    }
    if (isOwner || priceRevealSettings.range) {
      let min = (latestBLIsOnThisSlot.length > 0) ? latestBLIsOnThisSlot[0].rate : 0;
      let max = (latestBLIsOnThisSlot.length > 0) ? latestBLIsOnThisSlot[latestBLIsOnThisSlot.length - 1].rate : 0;
      statsItem.minBidRate = min;
      statsItem.maxBidRate = max;
    }
    if (isOwner || priceRevealSettings.median) {
      let median = (latestBLIsOnThisSlot.length > 0) ? 
                   (latestBLIsOnThisSlot[latestBLIsOnThisSlot.length - 1].rate - latestBLIsOnThisSlot[0].rate) / 2 : 0;
      statsItem.medianRate = median;
    }
    if (isOwner || priceRevealSettings.average) {
      let avg = (latestBLIsOnThisSlot.length > 0) ? average(latestBLIsOnThisSlot.map(b => b.rate)) : 0;
      statsItem.averageRate = avg;
    }
    bidStats.push(statsItem);
  }
  ret.bidStats = bidStats;
  return res.json(ret);
});



router.post('/create-or-update-bid', [addUserToReq, authorizeUser], async (req, res) => {
  let user = req.user;
  let bidData = req.body.bidData;
  let tId = bidData.tenderId;
  let bId = bidData.bidId;
  let bidfridayBid = await Bid.findOne({ _id: bId });
  if (!bidfridayBid) {
    bidfridayBid = new Bid({
      tender: tId,
      createdBy: user
    });
    bidfridayBid = await bidfridayBid.save();
  }
  bidfridayBid.description = bidData.bidDescription;
  for(let slotData of bidData.slotData) {
    let tenderSlot = await TenderSlot.findOne({ _id: slotData.tenderSlotId });
    let tenderLineItem = await TenderLineItem.findOne({ _id: slotData.tenderLineItemId });
    let bidSlot = await BidSlot.findOne({ bid: bidfridayBid, tenderSlot: tenderSlot });
    if (!bidSlot) {
      bidSlot = new BidSlot({
        bid: bidfridayBid._id,
        tenderSlot: tenderSlot._id
      });
      bidSlot = await bidSlot.save();
      bidfridayBid.slots.push(bidSlot._id);
    }
    let latestBidLineItem = await BidLineItem.findOne({ _id: bidSlot.bidLineItems[bidSlot.bidLineItems.length - 1] });
    if (!latestBidLineItem) {
      latestBidLineItem = new BidLineItem({
        bid: bidfridayBid,
        slot: bidSlot._id,
        tenderLineItem: tenderLineItem._id,
        name: slotData.name,
        rate: slotData.rate,
        description: slotData.description,
        specifications: slotData.specifications,
        createdBy: user
      });
      latestBidLineItem = await latestBidLineItem.save();
      bidSlot.bidLineItems.push(latestBidLineItem._id);
    }    
    let needsUpdate = (slotData.forceUpdate)
                    ||(latestBidLineItem.name !== slotData.name)
                    ||(latestBidLineItem.rate !== slotData.rate)
                    ||(latestBidLineItem.description !== slotData.description)
                    ||(latestBidLineItem.specification !== slotData.specification);
    if (needsUpdate) {
      latestBidLineItem = new BidLineItem({
        bid: bidfridayBid,
        slot: bidSlot._id,
        tenderLineItem: tenderLineItem._id,
        name: slotData.name,
        rate: slotData.rate,
        description: slotData.description,
        specifications: slotData.specifications,
        createdBy: user
      });
      latestBidLineItem = await latestBidLineItem.save();
      bidSlot.bidLineItems.push(latestBidLineItem._id);
    }
    await bidSlot.save();
  }
  bidfridayBid = await bidfridayBid.save();
  bidfridayBid = await bidfridayBid.populate({
    path: 'slots',
    match: { status: "active" },
    populate: {
      path: 'bidLineItems'
    }
  })
  .populate('createdBy', ['name', 'email'])
  .execPopulate();
  return res.json(bidfridayBid);
});



router.post('/get-bid', async (req, res) => {
  let bidId = req.body.bidId;
  let bid = await Bid.findOne({ _id: bidId });
  if (!bid) {
    return res.json({});
  }
  bid = await bid.populate({
    path: 'slots',
    match: { status: "active" },
    populate: [{
      path: 'bidLineItems'
    }, {
      path: 'tenderSlot',
      populate: {
        path: 'tenderLineItems'
      }
    }]
  })
  .populate({
    path: 'tender',
    populate: {
      path: 'createdBy',
      select: ['name', 'email']
    }
  })
  .populate({
    path: 'tender',
    populate: {
      path: 'slots',
      populate: {
        path: 'tenderLineItems'
      }
    }
  })
  .populate('createdBy', ['name', 'email'])
  .execPopulate();
  return res.json(bid);
});



router.post('/get-my-bids', [addUserToReq, authorizeUser], async (req, res) => {
  let user = req.user;
  let bids = await Bid.find({ createdBy: user._id })
                      .populate('createdBy')
                      .populate({
                        path: 'tender',
                        populate: {
                          path: 'createdBy',
                          select: ['name', 'email']
                        }
                      });
  return res.json(bids);
});



router.post('/asset', [addUserToReq, authorizeUser], async (req, res) => {
  let assetId = req.body.assetId;
  let user = await User.findOne({ email: req.body.creatorEmail.toLowerCase() });

  let tokens = JSON.parse(user.tokens);
  let mondayToken = tokens.monday;
  monday.setToken(mondayToken);
  
  let queryStr = `query { assets (ids: [${assetId}]) { id name url public_url } }`;
  let qRes = await monday.api(queryStr);

  return res.json(qRes.data);
});



// ---------------------------------



router.post('/connect-monday-user', async (req, res) => {
  try {
    let code = req.body.code;
    let tokenEndPt = 'https://auth.monday.com/oauth2/token';
    let tokenReqBody = {
      client_id: process.env.MONDAY_CLIENTID,
      client_secret: process.env.MONDAY_CLIENTSECRET,
      redirect_uri: (process.env.NODE_ENV === 'production') ? process.env.MONDAY_REDIRECTURI : 'http://localhost:4001/monday/connect',
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
    let payload = {
      email: u.email,
    };
    let bftoken = jwt.sign(payload, BIDFRIDAY_SECRET);
    let tokens = JSON.parse(u.tokens);
    let hasMondayConnected = tokens.monday && tokens.monday !== "";
    let ret = {
      user: u,
      bftoken: bftoken,
      hasMondayConnected: hasMondayConnected
    };
    return res.json(ret);
  } catch (excp) {
    console.log(excp);
    return res.status(500).send();
  }
});



router.post('/users', async (req, res) => {
  const uData = req.body;
  if (!uData || uData === {}) {
    return res.status(400).send();
  }
  let user = await User.findOne({ email: uData.email });
  if (!user) {
    user = new User({
      username: uData.nickname || '',
      name: uData.name || '',
      email: uData.email.toLowerCase()
    });
    user = await user.save();
  }
  let payload = {
    email: user.email,
  };
  let bftoken = jwt.sign(payload, BIDFRIDAY_SECRET);
  let tokens = (user.tokens === "") ? {} : JSON.parse(user.tokens);
  let hasMondayConnected = tokens.monday && tokens.monday !== "";
  let ret = {
    user: user,
    bftoken: bftoken,
    hasMondayConnected: hasMondayConnected
  };
  return res.json(ret);
});



router.post('/update-user', [addUserToReq, authorizeUser], async (req, res) => {
  const uData = req.body;
  if (!uData || uData === {}) {
    return res.status(400).send();
  }
  let user = await User.findOne({ email: req.user.email });
  if (!user) {
    return res.status(400).send();
  }
  user.name = uData.name;
  user.phone = uData.phone;
  user.location = uData.location;
  user = await user.save();
  return res.json(user);
});



module.exports = router;