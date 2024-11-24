import { Suspense, lazy } from 'react';
import { ClerkProvider } from '@/providers/ClerkProvider';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";
import { config } from "./lib/wagmi";
import Header from "./components/Header";
import Spinner from "./components/Spinner";

// Lazy load all major routes
const Index = lazy(() => import("./pages/Index"));
const AssetDetail = lazy(() => import("./pages/AssetDetail"));
const Watchlist = lazy(() => import("./pages/watchlist"));
const News = lazy(() => import("./pages/News"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <Spinner size="lg" className="mb-4" />
    <p className="text-purple-500 font-medium">Loading page...</p>
  </div>
);

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
          <Router>
            <div className="min-h-screen bg-[#121212] text-white">
              <Header />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/asset/:assetId" element={<AssetDetail />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </QueryClientProvider>
      </ClerkProvider>
    </WagmiConfig>
  );
}

export default App;