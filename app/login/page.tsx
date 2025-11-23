'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
      } else if (result?.ok) {
        // Force a hard refresh to ensure session cookies are picked up
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('An error occurred, please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#eb7823]/10 to-[#6e3787]/10 rounded-full blur-3xl opacity-60 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#eb7823]/10 to-[#6e3787]/10 rounded-full blur-3xl opacity-60 -ml-20 -mb-20"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-[#f0e6dd] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/leopath.png" alt="Leopath Logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-[#8a7a70]">
              Sign in to continue your career journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a] placeholder-[#8a7a70]/50"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a] placeholder-[#8a7a70]/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#eb7823] to-[#6e3787] text-white py-3.5 px-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#eb7823]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="text-center mt-6">
                <p className="text-sm text-[#8a7a70]">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-bold text-[#eb7823] hover:text-[#6e3787] transition-colors">
                        Create Account
                    </Link>
                </p>
            </div>
          </form>

          {/* Quick Access */}
          <div className="mt-8 pt-6 border-t border-[#f0e6dd]">
            <p className="text-center text-sm text-[#8a7a70] mb-3">
              Or view demo
            </p>
            <Link
              href="/"
              className="block w-full text-center py-2 px-4 border border-[#f0e6dd] rounded-xl text-[#1a1a1a] hover:bg-[#fdf6f0] transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
