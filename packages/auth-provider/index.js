const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));

const mockCode = 'abc123';
const mockToken = 'xyz789';
const mockUser = { id: 1, name: 'Alice' };

const clients = {
  [`${process.env.TRUSTED_CLIENT_ID}`]: process.env.TRUSTED_CLIENT_SECRET,
}

app.get('/', (req, res) => {
  res.send(`hello world`);
});

// Redirect with code
app.get('/authorize', (req, res) => {
  const { client_id, redirect_uri, state } = req.query;
  const trustedClientId = process.env.TRUSTED_CLIENT_ID;
  if (client_id !== trustedClientId) {
    return res.status(400).json({ error: 'invalid_client' });
  }
  const trustedClientSecret = process.env.TRUSTED_CLIENT_SECRET;
  if (clients?.[client_id] !== trustedClientSecret) {
    return res.status(400).json({ error: 'invalid_client_secret' });
  }
  const trustedRedirectUri = `${process.env.TRUSTED_CLIENT_URL}/callback`;
  console.log('trustedRedirectUri', trustedRedirectUri, redirect_uri);
  if (redirect_uri !== trustedRedirectUri) {
    return res.status(400).json({ error: 'invalid_redirect_uri' });
  }
  const redirect = `${redirect_uri}?code=${mockCode}&state=${state}`;
  res.redirect(redirect);
});

// Exchange code for token
app.post('/token', (req, res) => {
  if (req.body.code === mockCode) {
    return res.json({ access_token: mockToken, token_type: 'Bearer' });
  }
  res.status(400).json({ error: 'invalid_grant' });
});

// Return user info
app.get('/userinfo', (req, res) => {
  if (req.headers.authorization === `Bearer ${mockToken}`) {
    return res.json(mockUser);
  }
  res.status(401).send('Unauthorized');
});

app.listen(port, () => console.log(`Auth provider on http://localhost:${port}`));