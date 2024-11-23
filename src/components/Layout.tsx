import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Layout = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 relative overflow-hidden">
      {/* Animated cyberpunk background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <header className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-orbitron text-white hover:text-purple-400 transition-colors">
              CryptoRetro
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Market
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';
export default Layout;
