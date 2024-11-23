import { ClerkProvider } from '@/providers/ClerkProvider';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";
import { config } from "./lib/wagmi";
import Header from "./components/Header";
import Index from "./pages/Index";
import AssetDetail from "./pages/AssetDetail";
import Watchlist from "./pages/watchlist";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <WagmiConfig config={config}>
      <ClerkProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <div className="min-h-screen bg-[#121212] text-white">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/asset/:assetId" element={<AssetDetail />} />
                <Route path="/watchlist" element={<Watchlist />} />
              </Routes>
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    </WagmiConfig>
  );
}

export default App;