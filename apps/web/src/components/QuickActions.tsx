'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const actions = [
  {
    href: '/deposit',
    label: 'Deposit',
    description: 'Add USDC to your account',
    icon: '↓',
    color: 'bg-green-500/20 text-green-400',
  },
  {
    href: '/send',
    label: 'Send',
    description: 'Transfer to anyone',
    icon: '↗',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    href: '/withdraw',
    label: 'Withdraw',
    description: 'Cash out to wallet',
    icon: '↑',
    color: 'bg-purple-500/20 text-purple-400',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {actions.map(({ href, label, description, icon, color }, index) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            href={href}
            className="glass rounded-xl p-4 block hover:border-zinc-600 transition-all hover:scale-[1.02]"
          >
            <div
              className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl mb-3`}
            >
              {icon}
            </div>
            <h3 className="text-white font-semibold mb-1">{label}</h3>
            <p className="text-zinc-500 text-sm">{description}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

