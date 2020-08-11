require('dotenv').config();
const router = require('express').Router();

const BoardPair = require('./models/BoardPair');


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



module.exports = router;