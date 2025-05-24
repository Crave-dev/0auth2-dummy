const express = require('express');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const port = process.env.PORT || 5001;

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`hello world`);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    const tokenRes = await fetch(`${process.env.AUTH_PROVIDER_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: `http://localhost:${port}/callback`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch(`${process.env.AUTH_PROVIDER_URL}/userinfo`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userData = await userRes.json();
    res.send(`<h2>Hello ${userData.name}</h2>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth flow failed');
  }
});

app.listen(port, () => console.log(`Backend on http://localhost:${port}`));