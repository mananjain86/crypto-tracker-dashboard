import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual Client ID when available

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.googleLogin(credentialResponse.credential);
      login(response.user, response.token);
      console.log('👤 Google login successful:', response.user.email);
      onSuccess && onSuccess(response);
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask not detected! Please install the extension.');
      return;
    }
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const response = await authAPI.walletLogin(accounts[0]);
        login(response.user, response.token);
        console.log('🦊 Wallet login successful:', response.user.walletAddress);
        onSuccess && onSuccess(response);
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Connection rejected by user.');
      } else {
        setError(err.message || 'Wallet login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="glass-bg rounded-2xl p-2 sm:p-6 flex flex-col items-center gap-2 animate-fadein-modal shadow-xl mt-2 w-full max-w-sm mx-auto">
        {/* Logo/Icon */}
        <div className="mb-2 flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-700 shadow-lg">
            <i className="fa-solid fa-user-lock text-2xl text-white drop-shadow"></i>
          </span>
        </div>
        {/* Heading and subtitle */}
        <h2 className="text-2xl font-bold mb-1 text-blue-700 dark:text-blue-300">{mode === 'login' ? 'Login to CryptoGaze' : 'Create Your Account'}</h2>
        <div className="text-sm text-center text-gray-500 dark:text-gray-300 mb-3">{mode === 'login' ? 'Access your dashboard and watchlist.' : 'Sign up to start tracking your favorite coins.'}</div>
        
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
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full slide-up">
          <input
            type="email"
            placeholder="Email"
            className="glass-bg border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 text-base shadow-sm w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="glass-bg border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 text-base shadow-sm w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {mode === 'login' && (
            <div className="text-xs text-right text-blue-500 dark:text-blue-300 mb-1 cursor-pointer hover:underline transition-all">Forgot password?</div>
          )}
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="glass-bg border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200 text-base shadow-sm w-full"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          )}
          
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-[1.02] transition-all duration-200 border-2 border-transparent hover:border-blue-400" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center gap-2 w-full my-4 opacity-70">
          <div className="flex-1 h-px bg-gray-400 dark:bg-gray-600"></div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Or continue with</div>
          <div className="flex-1 h-px bg-gray-400 dark:bg-gray-600"></div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-center w-full min-h-[40px] overflow-hidden rounded-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap={false}
              theme="filled_blue"
              shape="pill"
              text={mode === 'login' ? "signin_with" : "signup_with"}
              width="320"
            />
          </div>
          <button
            type="button"
            onClick={handleWalletLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 h-[40px] rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
          >
            <i className="fa-brands fa-ethereum text-lg"></i>
            Continue with MetaMask
          </button>
        </div>
        
        {error && <div className="text-red-600 text-sm text-center mt-2 w-full">{error}</div>}
      </div>
    </GoogleOAuthProvider>
  );
}

export default AuthForm;