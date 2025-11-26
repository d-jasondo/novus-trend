const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());

// Increase limit to 50MB for image uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const authRouter = require('./routes/auth');
const tweetsRouter = require('./routes/tweets');
const linkedinAuthRouter = require('./routes/linkedin-auth');
const linkedinRouter = require('./routes/linkedin');
const chatRouter = require('./routes/chat');

app.use('/auth', authRouter);
app.use('/tweets', tweetsRouter);
app.use('/auth/linkedin', linkedinAuthRouter);
app.use('/linkedin', linkedinRouter);
app.use('/chat', chatRouter);

// simple health
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
