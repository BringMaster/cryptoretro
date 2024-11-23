import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useConfig, usePublicClient } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";

export default function Web3Status() {
  const { isSignedIn } = useUser();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const chain = config.chains.find(c => c.id === chainId);
  const publicClient = usePublicClient();
  
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
    chainId: chainId,
    watch: true,
  });

  if (!isSignedIn || !isConnected || !address) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-[#2a2a2a] rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm text-gray-400">{chain?.name || "Unknown Network"}</span>
      </div>
      <div className="h-4 w-[1px] bg-gray-700" />
      <div className="flex items-center gap-2">
        <div className="text-sm">
          {isBalanceLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : balance ? (
            <div className="flex items-center gap-1">
              <span className="font-medium text-white">
                {parseFloat(formatEther(balance.value)).toFixed(4)}
              </span>
              <span className="text-gray-400">
                {balance.symbol}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Loading balance...</span>
          )}
        </div>
        <div className="h-4 w-[1px] bg-gray-700" />
        <div className="text-sm text-gray-400">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
      </div>
    </div>
  );
}
