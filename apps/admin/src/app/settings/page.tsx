"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-zinc-400 mt-1">Configure your platform settings</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-surface-100 rounded-xl border border-surface-300 p-6">
          <h2 className="text-lg font-semibold mb-6">General</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Stashtab"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@stashtab.app"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Environment
              </label>
              <select className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent">
                <option value="testnet">Testnet (Base Sepolia)</option>
                <option value="mainnet">Mainnet (Base)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Limits Settings */}
        <div className="bg-surface-100 rounded-xl border border-surface-300 p-6">
          <h2 className="text-lg font-semibold mb-6">Limits</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Minimum Deposit (USDC)
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Maximum Withdrawal (USDC)
              </label>
              <input
                type="number"
                defaultValue="10000"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Daily Transfer Limit (USDC)
              </label>
              <input
                type="number"
                defaultValue="25000"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* KYC Settings */}
        <div className="bg-surface-100 rounded-xl border border-surface-300 p-6">
          <h2 className="text-lg font-semibold mb-6">KYC / Compliance</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                KYC Provider
              </label>
              <select className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent">
                <option value="none">Disabled</option>
                <option value="persona">Persona</option>
                <option value="sumsub">Sumsub</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Require KYC for Withdrawals</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Users must complete KYC before withdrawing
                </p>
              </div>
              <button className="w-12 h-6 bg-accent rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                KYC Threshold (USDC)
              </label>
              <input
                type="number"
                defaultValue="1000"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Require KYC for transactions above this amount
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-surface-100 rounded-xl border border-surface-300 p-6">
          <h2 className="text-lg font-semibold mb-6">Notifications</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Send transaction confirmations via email
                </p>
              </div>
              <button className="w-12 h-6 bg-accent rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Admin Alerts</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Get notified of large transactions
                </p>
              </div>
              <button className="w-12 h-6 bg-accent rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Alert Threshold (USDC)
              </label>
              <input
                type="number"
                defaultValue="5000"
                className="w-full px-4 py-2 bg-surface-200 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-accent hover:bg-accent-dark rounded-lg font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

