import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function Web3Connect() {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <Button
      variant="outline"
      onClick={() => open()}
      className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333333] text-white border-purple-500/20"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}
