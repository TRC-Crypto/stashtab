import { View, Text, ScrollView, Pressable } from "react-native";
import { mockUser, mockTransactions, formatDate } from "@/lib/mockData";

function TransactionItem({
  transaction,
}: {
  transaction: (typeof mockTransactions)[0];
}) {
  const isIncoming =
    transaction.type === "deposit" || transaction.type === "receive";
  const icons = {
    deposit: "📥",
    withdrawal: "📤",
    send: "➡️",
    receive: "⬅️",
  };

  return (
    <View className="flex-row items-center py-4 border-b border-surface-300">
      <View className="w-10 h-10 rounded-full bg-surface-300 items-center justify-center mr-3">
        <Text className="text-lg">{icons[transaction.type]}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium capitalize">
          {transaction.type}
        </Text>
        <Text className="text-zinc-500 text-sm">
          {formatDate(transaction.timestamp)}
        </Text>
      </View>
      <Text
        className={`font-mono font-semibold ${
          isIncoming ? "text-yield" : "text-white"
        }`}
      >
        {isIncoming ? "+" : "-"}${transaction.amount}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-surface-50">
      {/* Header */}
      <View className="px-6 pt-16 pb-8">
        <Text className="text-zinc-400 text-lg">Welcome back</Text>
        <Text className="text-white text-2xl font-semibold mt-1">
          {mockUser.email}
        </Text>
      </View>

      {/* Balance Card */}
      <View className="mx-6 bg-surface-100 rounded-2xl p-6 border border-surface-300">
        <Text className="text-zinc-400 mb-2">Total Balance</Text>
        <Text className="text-white text-4xl font-bold">
          ${mockUser.balance}
        </Text>
        <View className="flex-row items-center mt-4">
          <View className="flex-1">
            <Text className="text-zinc-500 text-sm">Yield Earned</Text>
            <Text className="text-yield font-semibold">
              +${mockUser.yieldEarned}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-zinc-500 text-sm">Current APY</Text>
            <Text className="text-white font-semibold">{mockUser.apy}%</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row px-6 mt-6 space-x-3">
        <Pressable className="flex-1 bg-yield py-4 rounded-xl items-center active:opacity-80">
          <Text className="text-black font-semibold">Deposit</Text>
        </Pressable>
        <Pressable className="flex-1 bg-surface-200 py-4 rounded-xl items-center border border-surface-300 active:opacity-80">
          <Text className="text-white font-semibold">Send</Text>
        </Pressable>
        <Pressable className="flex-1 bg-surface-200 py-4 rounded-xl items-center border border-surface-300 active:opacity-80">
          <Text className="text-white font-semibold">Withdraw</Text>
        </Pressable>
      </View>

      {/* Transactions */}
      <View className="px-6 mt-8 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-semibold">
            Recent Activity
          </Text>
          <Pressable>
            <Text className="text-yield">See All</Text>
          </Pressable>
        </View>

        <View className="bg-surface-100 rounded-xl border border-surface-300 px-4">
          {mockTransactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

