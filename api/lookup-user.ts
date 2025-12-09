/**
 * Serverless function to lookup Privy user by email
 * Works with Vercel/Netlify deployment
 *
 * Endpoint: POST /api/lookup-user
 * Body: { "email": "[email protected]" }
 */

interface PrivyLinkedAccount {
  type: string;
  address?: string;
  chain_type?: string;
  verified_at?: number;
  wallet_client_type?: string;
  connector_type?: string;
}

interface PrivyUser {
  id: string;
  created_at: number;
  linked_accounts: PrivyLinkedAccount[];
  has_accepted_terms: boolean;
  is_guest: boolean;
}

interface LookupResponse {
  success: boolean;
  email: string;
  ethereumAddresses: string[];
  solanaAddresses: string[];
  userId: string;
  error?: string;
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Get Privy credentials from environment variables
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

    const userData: PrivyUser = await privyResponse.json();

    // Extract wallet addresses
    const ethereumAddresses: string[] = [];
    const solanaAddresses: string[] = [];

    userData.linked_accounts.forEach((account) => {
      if (account.type === 'wallet' && account.address) {
        if (account.chain_type === 'ethereum') {
          ethereumAddresses.push(account.address);
        } else if (account.chain_type === 'solana') {
          solanaAddresses.push(account.address);
        }
      }
    });

    const response: LookupResponse = {
      success: true,
      email,
      userId: userData.id,
      ethereumAddresses,
      solanaAddresses,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error looking up user:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
