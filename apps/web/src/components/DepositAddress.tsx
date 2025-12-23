'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Address } from 'viem';

interface DepositAddressProps {
  address: Address | null;
  isLoading: boolean;
}

export function DepositAddress({ address, isLoading }: DepositAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 bg-surface-300 rounded-xl mb-6" />
          <div className="h-4 w-64 bg-surface-300 rounded mb-4" />
          <div className="h-10 w-32 bg-surface-300 rounded" />
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center">
          <p className="text-zinc-400">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex flex-col items-center">
        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl mb-6">
          <QRCodeSVG value={address} size={192} level="H" />
        </div>

        {/* Address */}
        <div className="w-full mb-4">
          <p className="text-zinc-400 text-sm text-center mb-2">Your deposit address (Base)</p>
          <div className="bg-surface-100 rounded-xl p-4 font-mono text-sm text-white break-all text-center">
            {address}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="px-6 py-3 rounded-xl bg-surface-200 text-white font-medium hover:bg-surface-300 transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Copy Address
            </>
          )}
        </button>

        {/* Warning */}
        <p className="text-zinc-500 text-xs text-center mt-4 max-w-sm">
          Only send USDC on Base network to this address. Sending other tokens or using other networks may result in permanent loss.
        </p>
      </div>
    </div>
  );
}

