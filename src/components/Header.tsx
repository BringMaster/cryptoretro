import { Link } from "react-router-dom";
import { useAccount, useBalance } from 'wagmi';
import { useChainId, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { mainnet, polygon, optimism, arbitrum, sepolia, goerli, polygonMumbai, arbitrumGoerli, optimismGoerli } from 'wagmi/chains';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const Header = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { data: balance } = useBalance({
    address: address,
  });

  const getNetworkName = (chainId: number) => {
    const networks = {
      [mainnet.id]: 'Ethereum',
      [polygon.id]: 'Polygon',
      [optimism.id]: 'Optimism',
      [arbitrum.id]: 'Arbitrum',
      [sepolia.id]: 'Sepolia Testnet',
      [goerli.id]: 'Goerli Testnet',
      [polygonMumbai.id]: 'Mumbai Testnet',
      [arbitrumGoerli.id]: 'Arbitrum Goerli',
      [optimismGoerli.id]: 'Optimism Goerli'
    };
    return networks[chainId] || 'Unknown Network';
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-[#1E1E1E] border-b border-[#2a2a2a]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="text-3xl font-black font-['Space Mono'] tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 hover:from-cyan-500 hover:via-purple-500 hover:to-cyan-500 transition-all duration-500 transform hover:scale-105"
            >
              RetroToken
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Market
              </Link>
              <Link 
                to="/watchlist" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Watchlist
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={() => open()}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-grey-900/20 hover:text-grey-400 hover:border-gray-400/70 transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-[#2a2a2a] rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400">
                      {chainId ? getNetworkName(chainId) : 'Unknown Network'}
                    </span>
                    <span className="text-sm font-medium">
                      {balance ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : '0.00'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Wallet</span>
                    <span className="text-sm font-medium text-gray-300">
                      {truncateAddress(address as string)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-grey-900/20 hover:text-grey-400 hover:border-gray-400/70 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
