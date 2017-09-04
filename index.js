const path = require('path');
const express = require('express');
const Twilio = require('twilio');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/token', (req, res) => {
  const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const SERVICE_SID = process.env.TWILIO_SYNC_SERVICE;
  const API_KEY = process.env.TWILIO_API_KEY;
  const API_SECRET = process.env.TWILIO_API_SECRET;

  const IDENTITY = 'only for testing';

  const AccessToken = Twilio.jwt.AccessToken;
  const SyncGrant = AccessToken.SyncGrant;

  const syncGrant = new SyncGrant({
    serviceSid: SERVICE_SID
  });

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);

  accessToken.addGrant(syncGrant);
  accessToken.identity = IDENTITY;

  res.send({ token: accessToken.toJwt() });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
