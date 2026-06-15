import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

  const googleEnabled = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';

  const formContent = (
    <div className="backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col items-center gap-2 animate-fadein-modal shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(59,130,246,0.15)] mt-2 w-full max-w-md mx-auto">
      {/* Logo/Icon */}
      <div className="mb-2 flex items-center justify-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <i className="fa-solid fa-user-lock text-2xl text-white drop-shadow-md"></i>
        </span>
      </div>
      {/* Heading and subtitle */}
      <h2 className="text-3xl font-extrabold mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
      <div className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">{mode === 'login' ? 'Enter your details to access your dashboard.' : 'Sign up to start tracking your favorite coins.'}</div>
      
      <div className="flex w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
        <button
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-200 text-sm ${mode === 'login' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-200 text-sm ${mode === 'signup' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          onClick={() => setMode('signup')}
        >
          Signup
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full slide-up">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-envelope text-gray-400"></i>
          </div>
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-gray-100"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fa-solid fa-lock text-gray-400"></i>
          </div>
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-gray-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {mode === 'login' && (
          <div className="text-xs text-right text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline transition-all">Forgot password?</div>
        )}
        {mode === 'signup' && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-shield-halved text-gray-400"></i>
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-gray-100"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:scale-[1.01] transition-all duration-200" disabled={loading}>
          {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="flex items-center gap-2 w-full my-4 opacity-70">
        <div className="flex-1 h-px bg-gray-400 dark:bg-gray-600"></div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">Or continue with</div>
        <div className="flex-1 h-px bg-gray-400 dark:bg-gray-600"></div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {googleEnabled ? (
          <div className="flex justify-center w-full min-h-[40px] overflow-hidden rounded-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap={false}
              theme="filled_blue"
              shape="pill"
              text={mode === 'login' ? "signin_with" : "signup_with"}
            />
          </div>
        ) : (
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2 px-4 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <i className="fa-brands fa-google mr-1"></i> Google Sign-In — configure <code className="text-[10px]">VITE_GOOGLE_CLIENT_ID</code> to enable
          </div>
        )}
        <button
          type="button"
          onClick={handleWalletLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 h-[44px] rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:scale-[1.01] transition-all duration-200 disabled:opacity-50"
        >
          <i className="fa-brands fa-ethereum text-lg"></i>
          Continue with MetaMask
        </button>
      </div>
      
      {error && <div className="text-red-600 text-sm text-center mt-2 w-full">{error}</div>}
    </div>
  );

  if (googleEnabled) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {formContent}
      </GoogleOAuthProvider>
    );
  }

  return formContent;
}

export default AuthForm;