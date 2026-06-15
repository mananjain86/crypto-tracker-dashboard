import { Link, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import { useState } from 'react';

function Header({ onLoginClick, onSignupClick, searchTerm, setSearchTerm, isLandingPage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/');
    }
  };

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/watchlist', label: 'Watchlist' },
    { to: '/overview', label: 'Overview' },
    { to: '/trending', label: 'Trending' },
    { to: '/news', label: 'News' },
    { to: '/vote', label: 'Vote' },
  ];

  if (isLandingPage) {
    return (
      <header className="top-0 left-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md transition-all duration-300">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-6 lg:gap-12">
            <Link to="/">
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 font-sans tracking-tighter text-gray-900 dark:text-white group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
                  <i className="fa-solid fa-chart-pie text-white text-sm sm:text-lg"></i>
                </div>
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                  Crypto<span className="text-blue-600 dark:text-blue-400">Gaze</span>
                </span>
              </h1>
            </Link>
            <nav className="hidden lg:flex items-center gap-5 font-medium text-sm">
              {navLinks.map(link => (
                <Link key={link.to} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            {user ? (
              <button className="px-4 py-2 rounded-lg text-red-600 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm font-medium" id="logout" onClick={handleLogout}>Logout</button>
            ) : (
              <div className="hidden sm:flex gap-3">
                <button className="px-5 py-2 rounded-xl text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all text-sm font-bold shadow-sm" id="login" onClick={onLoginClick}>Login</button>
                <button className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]" id="signup" onClick={onSignupClick}>Sign Up</button>
              </div>
            )}
            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg text-gray-700 dark:text-gray-300`}></i>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-fadein-modal">
            <nav className="flex flex-col gap-2 py-3">
              {navLinks.map(link => (
                <Link key={link.to} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors text-sm font-medium" to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>
            {!user && (
              <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium" onClick={() => { onLoginClick?.(); setMobileMenuOpen(false); }}>Login</button>
                <button className="flex-1 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition text-sm font-medium" onClick={() => { onSignupClick?.(); setMobileMenuOpen(false); }}>Sign Up</button>
              </div>
            )}
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="top-0 left-0 w-full z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link to="/">
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5 font-sans tracking-tighter text-gray-900 dark:text-white group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
                <i className="fa-solid fa-chart-pie text-white text-sm sm:text-lg"></i>
              </div>
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                Crypto<span className="text-blue-600 dark:text-blue-400">Gaze</span>
              </span>
            </h1>
          </Link>
          <nav className="hidden lg:flex items-center gap-5 font-medium text-sm">
            {navLinks.map(link => (
              <Link key={link.to} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 relative group" to={link.to}>
                {link.label}
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {setSearchTerm && (
            <input
              type="text"
              id="search"
              placeholder="Search coins..."
              className="hidden sm:block rounded-lg px-4 py-2 w-48 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          )}
          <DarkModeToggle />
          {user ? (
            <button className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-400 transition text-sm font-medium shadow-sm" id="logout" onClick={handleLogout}>Logout</button>
          ) : (
            <div className="hidden sm:flex gap-3">
              <button className="px-5 py-2 rounded-xl text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all text-sm font-bold shadow-sm" id="login" onClick={onLoginClick}>Login</button>
              <button className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]" id="signup" onClick={onSignupClick}>Sign Up</button>
            </div>
          )}
          {/* Mobile menu button */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg text-gray-700 dark:text-gray-300`}></i>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-fadein-modal">
          {setSearchTerm && (
            <input
              type="text"
              placeholder="Search coins..."
              className="w-full rounded-lg px-4 py-2 mt-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          )}
          <nav className="flex flex-col gap-2 py-3">
            {navLinks.map(link => (
              <Link key={link.to} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors text-sm font-medium" to={link.to} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          {!user && (
            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium" onClick={() => { onLoginClick?.(); setMobileMenuOpen(false); }}>Login</button>
              <button className="flex-1 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition text-sm font-medium" onClick={() => { onSignupClick?.(); setMobileMenuOpen(false); }}>Sign Up</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;