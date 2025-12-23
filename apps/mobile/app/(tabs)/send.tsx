import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useState, useMemo } from 'react';
import { mockUser } from '@/lib/mockData';

// Validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Format address for display
function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SendScreen() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);

  const availableBalance = parseFloat(mockUser.balance.replace(',', ''));

  const validation = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (address && !isValidAddress(address)) {
      errors.push('Invalid Ethereum address');
    }

    if (amountNum > 0 && amountNum < 1) {
      errors.push('Minimum send amount is $1');
    }

    if (amountNum > availableBalance) {
      errors.push('Insufficient balance');
    }

    if (amountNum > 1000) {
      warnings.push('Large transaction - please double check');
    }

    // Check if sending to self
    if (address.toLowerCase() === mockUser.safeAddress.toLowerCase()) {
      errors.push("You can't send to yourself");
    }

    return {
      isValid: errors.length === 0 && address.length > 0 && amountNum > 0,
      errors,
      warnings,
    };
  }, [address, amount, availableBalance]);

  const handleSend = async () => {
    Keyboard.dismiss();

    if (!validation.isValid) return;

    if (validation.warnings.length > 0) {
      Alert.alert('Confirm Transaction', validation.warnings.join('\n'), [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: executeSend },
      ]);
    } else {
      Alert.alert('Confirm Send', `Send $${amount} USDC to ${formatAddress(address)}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: executeSend },
      ]);
    }
  };

  const executeSend = async () => {
    setSending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert('Success', `$${amount} USDC sent successfully!`, [
        {
          text: 'OK',
          onPress: () => {
            setAddress('');
            setAmount('');
          },
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleMaxPress = () => {
    // Leave a small amount for gas
    const maxAmount = Math.max(0, availableBalance - 0.01);
    setAmount(maxAmount.toFixed(2));
  };

  const networkFee = 0.01; // Approximate fee

  return (
    <View className="flex-1 bg-surface-50 px-6 pt-16">
      {/* Header */}
      <Text className="text-white text-2xl font-semibold mb-2">Send</Text>
      <Text className="text-zinc-400 mb-8">Transfer USDC to any address</Text>

      {/* Balance */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 p-4 mb-6">
        <Text className="text-zinc-400 text-sm">Available Balance</Text>
        <View className="flex-row items-baseline mt-1">
          <Text className="text-white text-2xl font-semibold">${mockUser.balance}</Text>
          <Text className="text-zinc-400 ml-2">USDC</Text>
        </View>
      </View>

      {/* Address Input */}
      <View className="mb-4">
        <Text className="text-zinc-400 text-sm mb-2">Recipient Address</Text>
        <View
          className={`bg-surface-200 border rounded-xl flex-row items-center ${
            addressFocused ? 'border-yield' : 'border-surface-300'
          } ${address && !isValidAddress(address) ? 'border-red-500' : ''}`}
        >
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="0x..."
            placeholderTextColor="#52525b"
            className="flex-1 px-4 py-4 text-white font-mono"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setAddressFocused(true)}
            onBlur={() => setAddressFocused(false)}
          />
          {address.length > 0 && (
            <Pressable onPress={() => setAddress('')} className="pr-4">
              <Text className="text-zinc-400">✕</Text>
            </Pressable>
          )}
        </View>
        {address && !isValidAddress(address) && (
          <Text className="text-red-400 text-sm mt-1">Invalid address format</Text>
        )}
        {address && isValidAddress(address) && (
          <Text className="text-yield text-sm mt-1">✓ Valid address</Text>
        )}
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="text-zinc-400 text-sm mb-2">Amount (USDC)</Text>
        <View className="flex-row items-center bg-surface-200 border border-surface-300 rounded-xl">
          <Text className="text-zinc-400 pl-4 text-lg">$</Text>
          <TextInput
            value={amount}
            onChangeText={(text) => {
              // Only allow numbers and one decimal point
              const cleaned = text.replace(/[^0-9.]/g, '');
              const parts = cleaned.split('.');
              if (parts.length <= 2) {
                if (parts[1]?.length > 2) {
                  setAmount(`${parts[0]}.${parts[1].slice(0, 2)}`);
                } else {
                  setAmount(cleaned);
                }
              }
            }}
            placeholder="0.00"
            placeholderTextColor="#52525b"
            keyboardType="decimal-pad"
            className="flex-1 px-2 py-4 text-white text-xl"
          />
          <Pressable onPress={handleMaxPress} className="pr-4">
            <Text className="text-yield font-medium">MAX</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Amounts */}
      <View className="flex-row gap-3 mb-6">
        {['25', '50', '100', '500'].map((val) => (
          <Pressable
            key={val}
            onPress={() => setAmount(val)}
            className={`flex-1 py-3 rounded-lg items-center border ${
              amount === val ? 'bg-yield/20 border-yield' : 'bg-surface-200 border-surface-300'
            } active:opacity-80`}
          >
            <Text className={amount === val ? 'text-yield font-medium' : 'text-white'}>${val}</Text>
          </Pressable>
        ))}
      </View>

      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          {validation.errors.map((error, i) => (
            <Text key={i} className="text-red-400 text-sm">
              • {error}
            </Text>
          ))}
        </View>
      )}

      {validation.warnings.length > 0 && validation.errors.length === 0 && (
        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          {validation.warnings.map((warning, i) => (
            <Text key={i} className="text-yellow-400 text-sm">
              ⚠️ {warning}
            </Text>
          ))}
        </View>
      )}

      {/* Summary */}
      {amount && parseFloat(amount) > 0 && validation.isValid && (
        <View className="bg-surface-100 rounded-xl border border-surface-300 p-4 mb-4">
          <View className="flex-row justify-between py-2">
            <Text className="text-zinc-400">Amount</Text>
            <Text className="text-white">${parseFloat(amount).toFixed(2)} USDC</Text>
          </View>
          <View className="flex-row justify-between py-2 border-t border-surface-300">
            <Text className="text-zinc-400">Network Fee</Text>
            <Text className="text-white">~${networkFee.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between py-2 border-t border-surface-300">
            <Text className="text-white font-medium">Total</Text>
            <Text className="text-white font-semibold">
              ${(parseFloat(amount) + networkFee).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Send Button */}
      <Pressable
        onPress={handleSend}
        disabled={!validation.isValid || sending}
        className={`py-4 rounded-xl items-center flex-row justify-center ${
          validation.isValid && !sending ? 'bg-yield active:opacity-80' : 'bg-surface-300'
        }`}
      >
        {sending ? (
          <>
            <ActivityIndicator color="#000" size="small" />
            <Text className="text-black font-semibold text-lg ml-2">Sending...</Text>
          </>
        ) : (
          <Text
            className={`font-semibold text-lg ${
              validation.isValid ? 'text-black' : 'text-zinc-500'
            }`}
          >
            Send USDC
          </Text>
        )}
      </Pressable>

      {/* Security Notice */}
      <View className="mt-6 items-center">
        <Text className="text-zinc-500 text-xs text-center">
          🔒 Transactions are secured by Safe smart contracts
        </Text>
      </View>
    </View>
  );
}
