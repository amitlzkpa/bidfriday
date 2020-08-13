require('dotenv').config();
const router = require('express').Router();
const axios = require('axios');
const monday = require('monday-sdk-js')();

const BoardPair = require('./models/BoardPair');
const User = require('./models/User');


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



router.post('/create-or-update-tender', async (req, res) => {
  let tInfo = req.body;
  console.log(tInfo);
  return res.json(tInfo);
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
    console.log('a');
    console.log(tokenReqBody);
    let at = await axios.post(tokenEndPt, tokenReqBody);
    let accessToken = at.data.access_token;
    monday.setToken(accessToken);
    let qRes = await monday.api('query { me { id name email country_code location url account { id name } } }');
    let uData = qRes.data.me;
    console.log('b');
    console.log(uData);
    let u = await User.findOne({ email: uData.email });
    console.log('c');
    console.log(u);
    if (u) {
      let currTokens = JSON.parse(u.tokens);
      currTokens.monday = accessToken;
      u.tokens = currTokens;
    } else {
      u = new User({
        name: uData.name,
        email: uData.email,
        username: uData.account.name,
        tokens: `{ "monday": "${accessToken}" }`
      });
    }
    console.log('d');
    console.log(u);
    u = await u.save();
    return res.json(u);
  } catch (excp) {
    console.log(excp);
    return res.status(500).send();
  }
});



module.exports = router;