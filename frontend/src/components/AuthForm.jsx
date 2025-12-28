import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';

function AuthForm({ onSuccess, initialMode = 'login' }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await authAPI.login(email, password);
        login(response.user, response.token);
        console.log('🔐 User logged in successfully:', response.user.email);
        onSuccess && onSuccess(response);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const response = await authAPI.register(email, password);
        login(response.user, response.token);
        console.log('👤 User registered successfully:', response.user.email);
        onSuccess && onSuccess(response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-bg rounded-2xl p-2 sm:p-6 flex flex-col items-center gap-2 animate-fadein-modal shadow-xl mt-2">
      {/* Logo/Icon */}
      <div className="mb-2 flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-700 shadow-lg">
          <i className="fa-solid fa-user-lock text-2xl text-white drop-shadow"></i>
        </span>
      </div>
      {/* Heading and subtitle */}
      <h2 className="text-2xl font-bold mb-1 text-blue-700 dark:text-blue-300">{mode === 'login' ? 'Login to CryptoGaze' : 'Create Your Account'}</h2>
      <div className="text-sm text-gray-500 dark:text-gray-300 mb-3">{mode === 'login' ? 'Access your dashboard and watchlist.' : 'Sign up to start tracking your favorite coins.'}</div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 text-base ${mode === 'login' ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white scale-105' : 'bg-white/70 dark:bg-gray-800/70 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 text-base ${mode === 'signup' ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white scale-105' : 'bg-white/70 dark:bg-gray-800/70 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800'}`}
          onClick={() => setMode('signup')}
        >
          Signup
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs slide-up">
        <input
          type="email"
          placeholder="Email"
          className="glass-bg border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 text-base shadow-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="glass-bg border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 text-base shadow-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {/* Forgot password link (non-functional) */}
        {mode === 'login' && (
          <div className="text-xs text-right text-blue-500 dark:text-blue-300 mb-1 cursor-pointer hover:underline transition-all">Forgot password?</div>
        )}
        {mode === 'signup' && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="glass-bg border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 text-base shadow-sm"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        )}
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow-md mt-2 hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-blue-400" disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default AuthForm; 