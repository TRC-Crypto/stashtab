'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KYCStatus {
  enabled: boolean;
  required: boolean;
  status: 'none' | 'pending' | 'in_review' | 'approved' | 'declined' | 'expired';
  level: string;
  canTransact: boolean;
}

interface KYCGateProps {
  children: React.ReactNode;
  feature?: 'send' | 'withdraw' | 'fiat_purchase' | 'fiat_sell';
  requiredLevel?: 'basic' | 'standard' | 'enhanced';
  fallback?: React.ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export function KYCGate({ children, feature, requiredLevel = 'standard', fallback }: KYCGateProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingVerification, setStartingVerification] = useState(false);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  async function fetchKYCStatus() {
    try {
      const token = localStorage.getItem('privy:token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/kyc/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch KYC status');
      }

      const data = await response.json();
      setKycStatus(data);
    } catch (err) {
      console.error('KYC status error:', err);
      // If KYC endpoint fails, assume KYC is not required
      setKycStatus({
        enabled: false,
        required: false,
        status: 'none',
        level: 'none',
        canTransact: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function startVerification() {
    setStartingVerification(true);
    setError(null);

    try {
      const token = localStorage.getItem('privy:token');
      if (!token) {
        throw new Error('Please log in first');
      }

      const response = await fetch(`${API_URL}/kyc/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: requiredLevel,
          redirectUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to start verification');
      }

      const data = await response.json();

      // Redirect to verification URL
      if (data.session?.verificationUrl) {
        window.location.href = data.session.verificationUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification');
    } finally {
      setStartingVerification(false);
    }
  }

  async function resumeVerification() {
    setStartingVerification(true);
    setError(null);

    try {
      const token = localStorage.getItem('privy:token');
      if (!token) {
        throw new Error('Please log in first');
      }

      const response = await fetch(`${API_URL}/kyc/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to resume verification');
      }

      const data = await response.json();

      if (data.session?.verificationUrl) {
        window.location.href = data.session.verificationUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume verification');
    } finally {
      setStartingVerification(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // KYC not enabled or not required - show children
  if (!kycStatus?.enabled || !kycStatus?.required || kycStatus?.canTransact) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default KYC gate UI
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-surface border border-border rounded-2xl p-8 text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">Identity Verification Required</h2>

        <p className="text-zinc-400 mb-6">
          {feature
            ? `To use ${feature.replace('_', ' ')}, please verify your identity.`
            : 'Please verify your identity to continue.'}
        </p>

        {kycStatus.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Your verification is in progress. Click below to continue where you left off.
            </p>
          </div>
        )}

        {kycStatus.status === 'in_review' && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              Your verification is being reviewed. This usually takes a few minutes.
            </p>
          </div>
        )}

        {kycStatus.status === 'declined' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">
              Your verification was not successful. Please try again with valid documents.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {kycStatus.status === 'pending' ? (
            <button
              onClick={resumeVerification}
              disabled={startingVerification}
              className="w-full py-3 px-4 bg-accent text-black font-medium rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startingVerification ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                'Continue Verification'
              )}
            </button>
          ) : (
            <button
              onClick={startVerification}
              disabled={startingVerification}
              className="w-full py-3 px-4 bg-accent text-black font-medium rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startingVerification ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : kycStatus.status === 'declined' ? (
                'Try Again'
              ) : (
                'Start Verification'
              )}
            </button>
          )}

          <p className="text-xs text-zinc-500">
            Verification is powered by Persona and typically takes 2-3 minutes.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to check KYC status
 */
export function useKYCStatus() {
  const [status, setStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const token = localStorage.getItem('privy:token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/kyc/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch KYC status:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  return { status, loading, isVerified: status?.status === 'approved' };
}
