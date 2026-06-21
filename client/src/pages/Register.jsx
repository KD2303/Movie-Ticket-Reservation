import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../services/api';
import { authStart, authSuccess, authFail, clearError } from '../store/authSlice';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { loading, error, isLoggedIn } = useSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    dispatch(clearError());
    if (isLoggedIn) {
      navigate(redirect, { replace: true });
    }
  }, [isLoggedIn, navigate, redirect, dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) return;

    dispatch(authStart());
    try {
      const res = await registerUser({ name, email, password, phone });
      dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
    } catch (err) {
      dispatch(authFail(err.response?.data?.message || 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 flex flex-col justify-between px-6 fade-in">
      <div>
        {/* Header */}
        <div className="pt-8 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-800 transition-colors mb-6"
            aria-label="Go Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-gray-900 font-black text-2xl tracking-tight leading-tight">Create Account</h1>
          <p className="text-gray-400 text-xs font-semibold mt-1">Sign up to get tickets and rewards</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-pulse">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 focus:border-purple/50 focus:bg-white rounded-2xl text-xs font-bold text-gray-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 focus:border-purple/50 focus:bg-white rounded-2xl text-xs font-bold text-gray-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 focus:border-purple/50 focus:bg-white rounded-2xl text-xs font-bold text-gray-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-xs font-bold mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min 6 characters)"
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 focus:border-purple/50 focus:bg-white rounded-2xl text-xs font-bold text-gray-900 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-purple py-4 rounded-2xl text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(95,51,225,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>

      {/* Footer link to Login */}
      <div className="text-center mt-6">
        <p className="text-gray-400 text-xs font-semibold">
          Already have an account?{' '}
          <button
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(redirect)}`)}
            className="text-purple hover:underline font-bold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
