'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-yield flex items-center justify-center">
            <span className="text-black font-bold text-xl">S</span>
          </div>
          <span className="font-semibold text-2xl text-white">Stashtab</span>
        </Link>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome back</h1>
          <p className="text-zinc-400 text-center mb-8">
            Sign in to access your account
          </p>

          <button
            onClick={login}
            disabled={!ready}
            className="w-full py-4 rounded-xl bg-yield text-black font-semibold text-lg hover:bg-yield-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ready ? 'Sign In' : 'Loading...'}
          </button>

          <p className="text-zinc-500 text-sm text-center mt-6">
            Don't have an account?{' '}
            <button onClick={login} className="text-yield hover:text-yield-light transition-colors">
              Sign up
            </button>
          </p>
        </div>

        {/* Security Note */}
        <p className="text-zinc-600 text-xs text-center mt-6 max-w-sm mx-auto">
          By signing in, you agree to our Terms of Service. This is testnet software—do not use real funds.
        </p>
      </motion.div>
    </div>
  );
}

