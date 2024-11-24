import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Layout = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Retro grid background is handled by CSS */}
      
      {/* Scanline effect */}
      <div className="scanline"></div>

      <header className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-[#00ff00]/30">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl retro-text text-[#00ff00] hover:text-[#00ff00]/80 transition-colors">
              CryptoRetro
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="button">
                Market
              </Link>
              <Link to="/watchlist" className="button">
                Watchlist
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';
export default Layout;
