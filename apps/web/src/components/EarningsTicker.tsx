'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { USDC_DECIMALS, SECONDS_PER_YEAR } from '@stashtab/config';

interface EarningsTickerProps {
  balance: bigint;
  apyPercent: number;
}

export function EarningsTicker({ balance, apyPercent }: EarningsTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(Date.now());
  const startBalanceRef = useRef(Number(balance) / 10 ** USDC_DECIMALS);

  // Calculate yield per millisecond
  const yieldPerMs = (startBalanceRef.current * (apyPercent / 100)) / (SECONDS_PER_YEAR * 1000);

  useEffect(() => {
    startTimeRef.current = Date.now();
    startBalanceRef.current = Number(balance) / 10 ** USDC_DECIMALS;
  }, [balance]);

  useEffect(() => {
    if (balance === 0n || apyPercent === 0) {
      setDisplayValue(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const earned = yieldPerMs * elapsed;
      setDisplayValue(earned);
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [balance, apyPercent, yieldPerMs]);

  // Format with many decimal places for the ticker effect
  const formattedValue = displayValue.toFixed(10);
  const [integerPart, decimalPart] = formattedValue.split('.');

  if (balance === 0n) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-zinc-400 mb-2">Earnings This Session</p>
        <p className="text-zinc-500 text-sm">Deposit USDC to start earning</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-zinc-400 text-sm mb-3 text-center">Earnings This Session</p>
      <div className="flex items-center justify-center">
        <span className="text-yield text-3xl font-mono font-bold yield-glow">+$</span>
        <span className="text-yield text-3xl font-mono font-bold yield-glow">{integerPart}.</span>
        <AnimatedDecimal decimal={decimalPart} />
      </div>
      <p className="text-zinc-500 text-xs text-center mt-3">
        Earning at {apyPercent.toFixed(2)}% APY
      </p>
    </div>
  );
}

function AnimatedDecimal({ decimal }: { decimal: string }) {
  return (
    <span className="text-yield text-3xl font-mono font-bold yield-glow inline-flex">
      {decimal.split('').map((digit, index) => (
        <AnimatePresence mode="popLayout" key={index}>
          <motion.span
            key={`${index}-${digit}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: index < 6 ? 1 : 0.5 - index * 0.05 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-block"
            style={{ minWidth: '0.6em' }}
          >
            {digit}
          </motion.span>
        </AnimatePresence>
      ))}
    </span>
  );
}

