/**
 * Simple Express server for the /api/lookup-user endpoint
 * Run alongside Vite dev server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Privy user lookup endpoint
app.post('/api/lookup-user', async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Get Privy credentials
  const appId = process.env.VITE_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('Missing Privy credentials');
    return res.status(500).json({
      error: 'Server configuration error: Missing Privy credentials'
    });
  }

  try {
    // Call Privy API
    const privyResponse = await fetch('https://auth.privy.io/api/v1/users/email/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'privy-app-id': appId,
        'Authorization': `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({ address: email }),
    });

    // Handle 404 - user not found
    if (privyResponse.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        email,
      });
    }

    // Handle other errors
    if (!privyResponse.ok) {
      const errorText = await privyResponse.text();
      console.error('Privy API error:', privyResponse.status, errorText);
      return res.status(privyResponse.status).json({
        success: false,
        error: `Privy API error: ${privyResponse.statusText}`,
      });
    }

    const userData = await privyResponse.json();

    // Extract wallet addresses
    const ethereumAddresses = [];
    const solanaAddresses = [];

    userData.linked_accounts.forEach((account) => {
      if (account.type === 'wallet' && account.address) {
        if (account.chain_type === 'ethereum') {
          ethereumAddresses.push(account.address);
        } else if (account.chain_type === 'solana') {
          solanaAddresses.push(account.address);
        }
      }
    });

    return res.status(200).json({
      success: true,
      email,
      userId: userData.id,
      ethereumAddresses,
      solanaAddresses,
    });

  } catch (error) {
    console.error('Error looking up user:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`📧 Email lookup endpoint: http://localhost:${PORT}/api/lookup-user`);
});
