import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Web3Status from "./Web3Status";
import Web3Connect from "./Web3Connect";

const Header = () => {
  const { isLoaded, isSignedIn } = useUser();

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
            <nav className="flex gap-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                Markets
              </Link>
              {isSignedIn && (
                <Link to="/watchlist" className="text-gray-300 hover:text-white transition-colors">
                  Watchlist
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-4">
                <Web3Status />
                <Web3Connect />
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonTrigger: "focus:shadow-none focus:ring-0"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex gap-4">
                <SignInButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Register
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
