import { Link, useNavigate } from 'react-router-dom';
// import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

function Header({ onLoginClick, onSignupClick, searchTerm, setSearchTerm, isLandingPage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  if (isLandingPage) {
  return (
    <header className="top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-16">
          <Link to="/">
            <h1 className="text-2xl font-bold flex items-center gap-8">
              <i className="fa-solid fa-coins" style={{ color: 'hsl(219, 88%, 57%)' }}></i> cryptoGaze
            </h1>
          </Link>
          <nav className="flex items-center gap-6 font-[450]">
              <Link className="hover:text-blue-600" to="/home">Home</Link>
            <Link className="hover:text-blue-600" to="/watchlist">Watchlist</Link>
            <Link className="hover:text-blue-600" to="/overview">Overview</Link>
            <Link className="hover:text-blue-600" to="/trending">Trending</Link>
            <Link className="hover:text-blue-600" to="/news">News</Link>
            <Link className="hover:text-blue-600" to="/vote">Vote</Link>
            </nav>
          </div>
          <nav className="flex items-center gap-6 navbar">
            {/* Search bar hidden on landing page */}
            {/* <input ... /> */}
            {/* <DarkModeToggle /> */}
            {user ? (
              <button className="login px-4 py-2 rounded text-red-600 border border-red-600 hover:bg-red-50 transition" id="logout" onClick={handleLogout}>Logout</button>
            ) : (
              <div className="flex gap-4">
                <button className="login px-4 py-2 rounded hover:bg-gray-300 transition bg-gray-100 shadow-xl/100 inset-shadow-xl shadow-gray-300" id="login" onClick={onLoginClick}>Login</button>
                <button className="signup px-4 py-2 rounded text-white bg-[#267cfb] hover:bg-blue-600 transition shadow-xl/100 inset-shadow-xl shadow-gray-300" id="signup" onClick={onSignupClick}>Signup</button>
              </div>
            )}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="top-0 left-0 w-full z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-16">
          <Link to="/">
            <h1 className="text-2xl font-bold flex items-center gap-4 font-sans tracking-tight">
              <i className="fa-solid fa-coins" style={{ color: 'hsl(219, 88%, 57%)' }}></i>
              cryptoGaze
            </h1>
          </Link>
          <nav className="flex items-center gap-6 font-[500] text-base">
            <Link className="hover:text-blue-600 transition-all duration-200 relative group" to="/home">
              Home
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
            <Link className="hover:text-blue-600 transition-all duration-200 relative group" to="/watchlist">
              Watchlist
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
            <Link className="hover:text-blue-600 transition-all duration-200 relative group" to="/overview">
              Overview
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
            <Link className="hover:text-blue-600 transition-all duration-200 relative group" to="/trending">
              Trending
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
            <Link className="hover:text-blue-600 transition-all duration-200 relative group" to="/news">
              News
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
            <Link className="hover:text-blue-600 transition-all duration-200 relative group" to="/vote">
              Vote
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
          </nav>
        </div>
        <nav className="flex items-center gap-6 navbar">
          <input
            type="text"
            id="search"
            placeholder="Search"
            className="rounded px-4 py-2 w-56 ml-2 bg-gray-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ minWidth: '180px' }}
          />
          {/* <DarkModeToggle /> */}
          {user ? (
            <button className="login px-4 py-2 rounded text-white bg-red-500 hover:bg-red-400 transition shadow-xl/100 inset-shadow-xl shadow-gray-300" id="logout" onClick={handleLogout}>Logout</button>
          ) : (
            <div className="flex gap-4">
              <button className="login px-4 py-2 rounded hover:bg-gray-300 transition bg-gray-100 shadow-xl/100 inset-shadow-xl shadow-gray-300" id="login" onClick={onLoginClick}>Login</button>
              <button className="signup px-4 py-2 rounded text-white bg-[#267cfb] hover:bg-blue-600 transition shadow-xl/100 inset-shadow-xl shadow-gray-300" id="signup" onClick={onSignupClick}>Signup</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header; 