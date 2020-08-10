require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const DIR = 'build';
let PORT = 4000;
if (process.env.NODE_ENV === 'production') PORT = process.env.PORT || 8080;

const mongoURI = process.env.MONGO_URL;
mongoose.connect(mongoURI, { useNewUrlParser: true });

const app = express();
app.use(express.static(DIR));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use('/api', require('./api'));

const base = path.join(__dirname, '../');
const indexFilePath = path.join(base, `/${DIR}/index.html`);
app.use('/*', (req, res) => res.sendFile(indexFilePath));

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
