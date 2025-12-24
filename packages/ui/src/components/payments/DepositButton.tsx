/**
 * DepositButton Component
 *
 * Button that opens a deposit modal with QR code
 */

'use client';

import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from 'react';
import type { Address } from 'viem';

export interface DepositButtonProps {
  address: Address;
  token?: Address; // Optional token address (defaults to native/USDC)
  className?: string;
  buttonText?: string;
}

/**
 * DepositButton Component
 *
 * Button that opens a modal with QR code for receiving deposits
 *
 * @example
 * ```tsx
 * import { DepositButton } from '@stashtab/ui/components';
 *
 * <DepositButton
 *   address={userSafeAddress}
 *   buttonText="Receive Funds"
 * />
 * ```
 */
export function DepositButton({
  address,
  token,
  className = '',
  buttonText = 'Deposit',
}: DepositButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Format address for QR code (could include token if specified)
  const qrValue = token ? `${address}?token=${token}` : address;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${className}`}
      >
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Deposit</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <QRCodeSVG value={qrValue} size={256} />

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Send to:</div>
                <div className="font-mono text-sm break-all bg-gray-100 p-2 rounded">{address}</div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Copy Address
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
