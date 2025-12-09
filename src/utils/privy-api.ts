/**
 * Client-side utility functions for Privy API interactions
 */

export interface UserLookupResult {
  success: boolean;
  email: string;
  ethereumAddresses: string[];
  solanaAddresses: string[];
  userId: string;
  error?: string;
}

/**
 * Lookup a Privy user by their email address
 * Returns their wallet addresses (ETH and Solana)
 *
 * @param email - The email address to lookup
 * @returns Promise with user wallet addresses or error
 */
export async function lookupUserByEmail(email: string): Promise<UserLookupResult> {
  try {
    const response = await fetch('/api/lookup-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        email,
        ethereumAddresses: [],
        solanaAddresses: [],
        userId: '',
        error: data.error || 'Failed to lookup user',
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      email,
      ethereumAddresses: [],
      solanaAddresses: [],
      userId: '',
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
