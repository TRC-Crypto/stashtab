import { View, Text, Pressable, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { mockUser } from "@/lib/mockData";

export default function DepositScreen() {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(mockUser.safeAddress);
    Alert.alert("Copied!", "Address copied to clipboard");
  };

  return (
    <View className="flex-1 bg-surface-50 px-6 pt-16">
      {/* Header */}
      <Text className="text-white text-2xl font-semibold mb-2">Deposit</Text>
      <Text className="text-zinc-400 mb-8">
        Send USDC to your wallet address below
      </Text>

      {/* QR Code Placeholder */}
      <View className="bg-white rounded-2xl p-6 items-center mb-6">
        <View className="w-48 h-48 bg-zinc-200 rounded-lg items-center justify-center">
          <Text className="text-zinc-500 text-center px-4">
            QR Code{"\n"}
            <Text className="text-xs">(Install react-native-qrcode-svg)</Text>
          </Text>
        </View>
      </View>

      {/* Address */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 p-4 mb-4">
        <Text className="text-zinc-400 text-sm mb-2">Your Deposit Address</Text>
        <Text className="text-white font-mono text-sm break-all">
          {mockUser.safeAddress}
        </Text>
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
          <Text className="text-zinc-300 text-sm">
            • Only send USDC on Base network
          </Text>
          <Text className="text-zinc-300 text-sm">
            • Deposits are automatically invested in Aave
          </Text>
          <Text className="text-zinc-300 text-sm">
            • Minimum deposit: $10 USDC
          </Text>
        </View>
      </View>
    </View>
  );
}

