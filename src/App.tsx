import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AssetDetail from "./pages/AssetDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/asset/:id" element={<AssetDetail />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;