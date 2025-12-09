import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { sepolia, base, baseSepolia, mainnet } from "viem/chains";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "../ui/custom-toast";

const SUPPORTED_CHAINS = [
  { chain: sepolia, name: "ETH Sepolia (Testnet)" },
  { chain: mainnet, name: "ETH Mainnet" },
  { chain: base, name: "Base (Mainnet)" },
  { chain: baseSepolia, name: "Base Sepolia (Testnet)" },
];

const ChainSwitcher = () => {
  const { wallets } = useWallets();
  const [selectedChainId, setSelectedChainId] = useState<number>(sepolia.id);
  const [currentChain, setCurrentChain] = useState<number | null>(null);

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  useEffect(() => {
    if (embeddedWallet && embeddedWallet.chainId) {
      const chainIdStr = embeddedWallet.chainId.toString();
      const chainIdNum = chainIdStr.includes(":")
        ? Number(chainIdStr.split(":")[1])
        : Number(chainIdStr);
      setCurrentChain(chainIdNum);
    }
  }, [embeddedWallet]);

  const handleSwitchChain = async () => {
    if (!embeddedWallet) {
      showErrorToast("No embedded wallet found. Please create a wallet first.");
      return;
    }

    try {
      await embeddedWallet.switchChain(selectedChainId);
      setCurrentChain(selectedChainId);
      const chainName = SUPPORTED_CHAINS.find(
        (c) => c.chain.id === selectedChainId
      )?.name;
      showSuccessToast(`Switched to ${chainName}`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to switch chain");
    }
  };

  const getCurrentChainName = () => {
    if (!currentChain) return "Unknown";
    const chain = SUPPORTED_CHAINS.find((c) => c.chain.id === currentChain);
    return chain?.name || `Chain ID: ${currentChain}`;
  };

  const availableActions = [
    {
      name: "Switch chain",
      function: handleSwitchChain,
      disabled: !embeddedWallet || selectedChainId === currentChain,
    },
  ];

  return (
    <Section
      name="Chain switcher"
      description={
        "Switch your embedded wallet between different networks (ETH Sepolia, ETH Mainnet Base Mainnet, Base Sepolia). Your wallet works across all supported chains."
      }
      filepath="src/components/sections/chain-switcher"
      actions={availableActions}
    >
      {embeddedWallet ? (
        <>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">
              Current chain: <span className="text-blue-600">{getCurrentChainName()}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Wallet address: {embeddedWallet.address}
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="chain-select"
              className="block text-sm font-medium mb-2"
            >
              Select chain to switch to:
            </label>
            <div className="relative">
              <select
                id="chain-select"
                value={selectedChainId}
                onChange={(e) => setSelectedChainId(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
              >
                {SUPPORTED_CHAINS.map(({ chain, name }) => (
                  <option key={chain.id} value={chain.id}>
                    {name} (Chain ID: {chain.id})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-600">
          No embedded wallet found. Please create a wallet first using the "Create a wallet" section above.
        </div>
      )}
    </Section>
  );
};

export default ChainSwitcher;
