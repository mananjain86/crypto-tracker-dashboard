import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import CoinPage from './pages/CoinPage';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Overview from './pages/Overview';
import Trending from './pages/Trending';
import News from './pages/News';
import Vote from './pages/Vote';
import Landing from './pages/Landing';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/coin/:id" element={<CoinPage />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/news" element={<News />} />
          <Route path="/vote" element={<Vote />} />
        </Routes>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '10px',
            },
          }} 
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
