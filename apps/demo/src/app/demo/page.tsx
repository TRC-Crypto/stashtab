'use client';

import { Copy, Check, Calculator, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function InteractiveDemoPage() {
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [apy, setApy] = useState(5.2);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('year');

  // Demo Safe address
  const demoAddress = '0x1234567890123456789012345678901234567890';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(demoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate yield
  const calculateYield = () => {
    const amount = parseFloat(depositAmount) || 0;
    const rates = {
      day: apy / 365,
      week: (apy / 365) * 7,
      month: apy / 12,
      year: apy,
    };
    return (amount * rates[timeframe]) / 100;
  };

  const yieldAmount = calculateYield();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#09090b] to-[#18181b]">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Interactive Demo</h1>
        <p className="text-zinc-400 mb-12">Experience Stashtab features in action</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Deposit Flow */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Send className="w-6 h-6 text-[#00d974]" />
              Deposit Flow
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 flex justify-center">
                <QRCodeSVG value={demoAddress} size={200} />
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-sm">Your Safe Address</span>
                  <button
                    onClick={handleCopy}
                    className="text-[#00d974] hover:text-[#00c466] transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-white font-mono text-sm break-all">{demoAddress}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-zinc-400 text-sm mb-2">How it works:</p>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Send USDC to this address</li>
                  <li>• Funds are automatically deposited to Aave</li>
                  <li>• Start earning yield immediately</li>
                  <li>• No additional steps required</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Yield Calculator */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#00d974]" />
              Yield Calculator
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Deposit Amount (USDC)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00d974]"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">APY (%)</label>
                <input
                  type="number"
                  value={apy}
                  onChange={(e) => setApy(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00d974]"
                  placeholder="5.2"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Timeframe</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['day', 'week', 'month', 'year'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeframe === tf
                          ? 'bg-[#00d974] text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-6 border border-[#00d974]/20">
                <div className="text-zinc-400 text-sm mb-2">Estimated Yield</div>
                <div className="text-4xl font-bold text-[#00d974]">
                  $
                  {yieldAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-zinc-500 text-sm mt-2">
                  Over{' '}
                  {timeframe === 'day'
                    ? '1 day'
                    : timeframe === 'week'
                      ? '1 week'
                      : timeframe === 'month'
                        ? '1 month'
                        : '1 year'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Playground */}
        <div className="mt-8 bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <h2 className="text-2xl font-semibold mb-6">API Playground</h2>
          <div className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">GET /account/balance</span>
                <button className="text-[#00d974] text-sm hover:text-[#00c466]">Try it</button>
              </div>
              <pre className="text-zinc-300 text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    balance: {
                      totalBalance: '1,234.56',
                      yieldEarned: '45.23',
                      apy: 5.2,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">POST /account/send</span>
                <button className="text-[#00d974] text-sm hover:text-[#00c466]">Try it</button>
              </div>
              <pre className="text-zinc-300 text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    to: '0x...',
                    amount: '100',
                    status: 'pending',
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="https://github.com/TRC-Crypto/stashtab/blob/main/docs/API.md"
              target="_blank"
              className="text-[#00d974] hover:text-[#00c466] transition-colors"
            >
              View Full API Documentation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
