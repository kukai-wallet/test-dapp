import { useState } from "react";
import Section from "../reusables/section";
import { lookupUserByEmail, isValidEmail, type UserLookupResult } from "../../utils/privy-api";
import { showSuccessToast, showErrorToast } from "../ui/custom-toast";

const EmailLookup = () => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<UserLookupResult | null>(null);

  const handleLookup = async () => {
    if (!email.trim()) {
      showErrorToast("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      showErrorToast("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const lookupResult = await lookupUserByEmail(email);

      if (lookupResult.success) {
        setResult(lookupResult);
        showSuccessToast("User found!");
      } else {
        setResult(lookupResult);
        showErrorToast(lookupResult.error || "User not found");
      }
    } catch (error) {
      showErrorToast("Failed to lookup user");
      console.error("Lookup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    showSuccessToast("Address copied to clipboard!");
  };

  const availableActions = [
    {
      name: isLoading ? "Looking up..." : "Lookup user",
      function: handleLookup,
      disabled: isLoading || !email.trim(),
    },
  ];

  return (
    <Section
      name="Email to Address Lookup"
      description="Look up a user's wallet addresses by their email. This searches your app's Privy users."
      filepath="src/components/sections/email-lookup"
      actions={availableActions}
    >
      <div className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading && email.trim()) {
                handleLookup();
              }
            }}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
            disabled={isLoading}
          />
        </div>

        {/* Results Display */}
        {result && result.success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <span>✓</span>
              <span>User Found</span>
            </div>

            {/* User ID */}
            <div className="text-sm">
              <span className="font-medium text-gray-700">User ID:</span>
              <div className="font-mono text-xs text-gray-600 mt-1 break-all">
                {result.userId}
              </div>
            </div>

            {/* Ethereum Addresses */}
            {result.ethereumAddresses.length > 0 && (
              <div>
                <div className="font-medium text-gray-700 mb-2">
                  Ethereum Addresses ({result.ethereumAddresses.length})
                </div>
                <div className="space-y-2">
                  {result.ethereumAddresses.map((address, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex-1 font-mono text-xs break-all">
                        {address}
                      </div>
                      <button
                        onClick={() => handleCopyAddress(address)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solana Addresses */}
            {result.solanaAddresses.length > 0 && (
              <div>
                <div className="font-medium text-gray-700 mb-2">
                  Solana Addresses ({result.solanaAddresses.length})
                </div>
                <div className="space-y-2">
                  {result.solanaAddresses.map((address, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex-1 font-mono text-xs break-all">
                        {address}
                      </div>
                      <button
                        onClick={() => handleCopyAddress(address)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Wallets Message */}
            {result.ethereumAddresses.length === 0 &&
              result.solanaAddresses.length === 0 && (
                <div className="text-sm text-gray-600">
                  This user has no linked wallet addresses.
                </div>
              )}
          </div>
        )}

        {/* Error Display */}
        {result && !result.success && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium">
              <span>✗</span>
              <span>User Not Found</span>
            </div>
            <p className="text-sm text-red-600 mt-2">
              {result.error || "No user found with this email address in your app."}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
};

export default EmailLookup;
