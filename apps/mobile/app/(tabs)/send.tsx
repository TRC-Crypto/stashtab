import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { mockUser } from '@/lib/mockData';

export default function SendScreen() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = () => {
    // TODO: Implement send transaction
    console.log('Send', { address, amount });
  };

  const isValid = address.length > 0 && parseFloat(amount) > 0;

  return (
    <View className="flex-1 bg-surface-50 px-6 pt-16">
      {/* Header */}
      <Text className="text-white text-2xl font-semibold mb-2">Send</Text>
      <Text className="text-zinc-400 mb-8">Transfer USDC to any address</Text>

      {/* Balance */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 p-4 mb-6">
        <Text className="text-zinc-400 text-sm">Available Balance</Text>
        <Text className="text-white text-2xl font-semibold mt-1">${mockUser.balance} USDC</Text>
      </View>

      {/* Address Input */}
      <View className="mb-4">
        <Text className="text-zinc-400 text-sm mb-2">Recipient Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="0x..."
          placeholderTextColor="#52525b"
          className="bg-surface-200 border border-surface-300 rounded-xl px-4 py-4 text-white font-mono"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Amount Input */}
      <View className="mb-6">
        <Text className="text-zinc-400 text-sm mb-2">Amount (USDC)</Text>
        <View className="flex-row items-center bg-surface-200 border border-surface-300 rounded-xl">
          <Text className="text-zinc-400 pl-4">$</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#52525b"
            keyboardType="decimal-pad"
            className="flex-1 px-2 py-4 text-white text-lg"
          />
          <Pressable onPress={() => setAmount(mockUser.balance.replace(',', ''))} className="pr-4">
            <Text className="text-yield font-medium">MAX</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Amounts */}
      <View className="flex-row space-x-3 mb-8">
        {['25', '50', '100', '500'].map((val) => (
          <Pressable
            key={val}
            onPress={() => setAmount(val)}
            className="flex-1 bg-surface-200 py-3 rounded-lg items-center border border-surface-300 active:border-yield"
          >
            <Text className="text-white">${val}</Text>
          </Pressable>
        ))}
      </View>

      {/* Send Button */}
      <Pressable
        onPress={handleSend}
        disabled={!isValid}
        className={`py-4 rounded-xl items-center ${
          isValid ? 'bg-yield active:opacity-80' : 'bg-surface-300'
        }`}
      >
        <Text className={`font-semibold text-lg ${isValid ? 'text-black' : 'text-zinc-500'}`}>
          Send USDC
        </Text>
      </Pressable>

      {/* Fee Info */}
      <Text className="text-zinc-500 text-sm text-center mt-4">Network fee: ~$0.01</Text>
    </View>
  );
}
