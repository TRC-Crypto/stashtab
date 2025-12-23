import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { mockUser, mockTransactions, formatDate } from '@/lib/mockData';

// Simulate live yield calculation
function useLiveYield(balance: number, apy: number) {
  const [yieldAmount, setYieldAmount] = useState(0);

  useEffect(() => {
    // Calculate yield per second
    const yearlyYield = balance * (apy / 100);
    const secondlyYield = yearlyYield / (365 * 24 * 60 * 60);

    let accumulated = 0;
    const interval = setInterval(() => {
      accumulated += secondlyYield;
      setYieldAmount(accumulated);
    }, 1000);

    return () => clearInterval(interval);
  }, [balance, apy]);

  return yieldAmount;
}

function TransactionItem({ transaction }: { transaction: (typeof mockTransactions)[0] }) {
  const isIncoming = transaction.type === 'deposit' || transaction.type === 'receive';
  const icons = {
    deposit: '📥',
    withdrawal: '📤',
    send: '➡️',
    receive: '⬅️',
  };

  return (
    <Pressable className="flex-row items-center py-4 border-b border-surface-300 active:opacity-70">
      <View className="w-10 h-10 rounded-full bg-surface-300 items-center justify-center mr-3">
        <Text className="text-lg">{icons[transaction.type]}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium capitalize">{transaction.type}</Text>
        <Text className="text-zinc-500 text-sm">{formatDate(transaction.timestamp)}</Text>
      </View>
      <View className="items-end">
        <Text className={`font-mono font-semibold ${isIncoming ? 'text-yield' : 'text-white'}`}>
          {isIncoming ? '+' : '-'}${transaction.amount}
        </Text>
        {transaction.status === 'pending' && (
          <Text className="text-yellow-500 text-xs">Pending</Text>
        )}
      </View>
    </Pressable>
  );
}

function YieldTicker({ balance, apy }: { balance: number; apy: number }) {
  const liveYield = useLiveYield(balance, apy);

  return (
    <View className="flex-row items-baseline">
      <Text className="text-yield font-semibold">+${mockUser.yieldEarned}</Text>
      {liveYield > 0 && (
        <Text className="text-yield/60 text-xs ml-1">+${liveYield.toFixed(8)}</Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Parse balance for calculations
  const balanceNumber = parseFloat(mockUser.balance.replace(',', ''));
  const apyNumber = parseFloat(mockUser.apy);

  return (
    <ScrollView
      className="flex-1 bg-surface-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d974" />
      }
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-8">
        <Text className="text-zinc-400 text-lg">Welcome back</Text>
        <Text className="text-white text-2xl font-semibold mt-1">{mockUser.email}</Text>
      </View>

      {/* Balance Card */}
      <View className="mx-6 bg-surface-100 rounded-2xl p-6 border border-surface-300">
        <Text className="text-zinc-400 mb-2">Total Balance</Text>
        <Text className="text-white text-4xl font-bold">${mockUser.balance}</Text>

        {/* Live Yield Ticker */}
        <View className="mt-4 p-3 bg-surface-200 rounded-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-zinc-500 text-xs mb-1">Yield Earned</Text>
              <YieldTicker balance={balanceNumber} apy={apyNumber} />
            </View>
            <View className="items-end">
              <Text className="text-zinc-500 text-xs mb-1">Current APY</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-yield mr-2 animate-pulse" />
                <Text className="text-white font-semibold">{mockUser.apy}%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row px-6 mt-6 gap-3">
        <Pressable
          onPress={() => router.push('/(tabs)/deposit')}
          className="flex-1 bg-yield py-4 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-2xl mb-1">📥</Text>
          <Text className="text-black font-semibold">Deposit</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(tabs)/send')}
          className="flex-1 bg-surface-200 py-4 rounded-xl items-center border border-surface-300 active:opacity-80"
        >
          <Text className="text-2xl mb-1">📤</Text>
          <Text className="text-white font-semibold">Send</Text>
        </Pressable>
        <Pressable
          onPress={() => {}}
          className="flex-1 bg-surface-200 py-4 rounded-xl items-center border border-surface-300 active:opacity-80"
        >
          <Text className="text-2xl mb-1">💳</Text>
          <Text className="text-white font-semibold">Buy</Text>
        </Pressable>
      </View>

      {/* Yield Stats Card */}
      <View className="mx-6 mt-6 bg-gradient-to-r from-surface-100 to-surface-200 rounded-xl p-4 border border-surface-300">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">📈</Text>
            <View>
              <Text className="text-white font-medium">Earning on Aave</Text>
              <Text className="text-zinc-500 text-sm">Auto-compound enabled</Text>
            </View>
          </View>
          <View className="bg-yield/20 px-3 py-1 rounded-full">
            <Text className="text-yield font-medium">{mockUser.apy}% APY</Text>
          </View>
        </View>
      </View>

      {/* Transactions */}
      <View className="px-6 mt-8 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-semibold">Recent Activity</Text>
          <Pressable>
            <Text className="text-yield">See All</Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="bg-surface-100 rounded-xl border border-surface-300 p-8 items-center">
            <ActivityIndicator color="#00d974" />
          </View>
        ) : mockTransactions.length > 0 ? (
          <View className="bg-surface-100 rounded-xl border border-surface-300 px-4">
            {mockTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </View>
        ) : (
          <View className="bg-surface-100 rounded-xl border border-surface-300 p-8 items-center">
            <Text className="text-zinc-400">No transactions yet</Text>
            <Pressable onPress={() => router.push('/(tabs)/deposit')} className="mt-3">
              <Text className="text-yield font-medium">Make your first deposit</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Network Badge */}
      <View className="items-center pb-8">
        <View className="flex-row items-center bg-surface-200 px-4 py-2 rounded-full">
          <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          <Text className="text-zinc-400 text-sm">Base Sepolia Testnet</Text>
        </View>
      </View>
    </ScrollView>
  );
}
