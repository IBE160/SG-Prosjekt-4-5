import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signup(email, password);
      navigate('/dashboard'); // Redirect on successful signup
    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-indigo-500/20 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          <p className="text-white/80 mt-2">Join Study Buddy to supercharge your learning.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80">Email Address</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              className="mt-1 block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md shadow-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80">Password</label>
            <input
              type="password"
              id="password"
              autoComplete="new-password"
              className="mt-1 block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md shadow-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-black/20 disabled:opacity-50"
            disabled={loading}
          >
            <UserPlus className="h-5 w-5" />
            {loading ? 'Signing up...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-white/80">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;