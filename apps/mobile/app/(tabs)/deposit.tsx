import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import api from '@/lib/api';

export default function DepositScreen() {
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAccount();

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setSafeAddress(response.data.safeAddress);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!safeAddress) return;
    await Clipboard.setStringAsync(safeAddress);
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface-50 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#00d974" />
        <Text className="text-zinc-400 mt-4">Loading address...</Text>
      </View>
    );
  }

  if (error || !safeAddress) {
    return (
      <View className="flex-1 bg-surface-50 items-center justify-center px-6">
        <Text className="text-red-400 text-lg mb-4">Error loading address</Text>
        <Text className="text-zinc-400 text-center mb-6">{error || 'No address found'}</Text>
        <Pressable onPress={loadAccountData} className="bg-yield px-6 py-3 rounded-xl">
          <Text className="text-black font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-50 px-6 pt-16">
      {/* Header */}
      <Text className="text-white text-2xl font-semibold mb-2">Deposit</Text>
      <Text className="text-zinc-400 mb-8">Send USDC to your wallet address below</Text>

      {/* QR Code */}
      <View className="bg-white rounded-2xl p-6 items-center mb-6">
        <QRCode value={safeAddress} size={192} color="#000000" backgroundColor="#FFFFFF" />
      </View>

      {/* Address */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 p-4 mb-4">
        <Text className="text-zinc-400 text-sm mb-2">Your Deposit Address</Text>
        <Text className="text-white font-mono text-sm break-all">{safeAddress}</Text>
      </View>

      {/* Copy Button */}
      <Pressable
        onPress={handleCopy}
        className="bg-yield py-4 rounded-xl items-center active:opacity-80 mb-6"
      >
        <Text className="text-black font-semibold text-lg">Copy Address</Text>
      </Pressable>

      {/* Info */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 p-4">
        <Text className="text-zinc-400 text-sm mb-3">Important</Text>
        <View className="space-y-2">
          <Text className="text-zinc-300 text-sm">• Only send USDC on Base network</Text>
          <Text className="text-zinc-300 text-sm">
            • Deposits are automatically invested in Aave
          </Text>
          <Text className="text-zinc-300 text-sm">• Minimum deposit: $10 USDC</Text>
        </View>
      </View>
    </View>
  );
}
