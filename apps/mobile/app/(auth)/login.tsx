import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const handleLogin = () => {
    // NOTE: Privy React Native integration is planned for v0.2.0
    // See ROADMAP.md for details
    // For now, this is a mock implementation for UI development
    // In production, this will use @privy-io/expo SDK
    router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 bg-surface-50 justify-center px-6">
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-yield items-center justify-center mb-6">
          <Text className="text-black text-4xl font-bold">S</Text>
        </View>
        <Text className="text-white text-3xl font-bold">Stashtab</Text>
        <Text className="text-zinc-400 text-lg mt-2">Your money, earning yield</Text>
      </View>

      {/* Features */}
      <View className="mb-12 space-y-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-yield/20 items-center justify-center mr-4">
            <Text className="text-yield text-lg">✓</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">No seed phrases</Text>
            <Text className="text-zinc-500 text-sm">Sign in with email or social</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-yield/20 items-center justify-center mr-4">
            <Text className="text-yield text-lg">✓</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Auto yield</Text>
            <Text className="text-zinc-500 text-sm">Earn interest automatically via Aave</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-yield/20 items-center justify-center mr-4">
            <Text className="text-yield text-lg">✓</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Your keys</Text>
            <Text className="text-zinc-500 text-sm">Secure smart wallet you control</Text>
          </View>
        </View>
      </View>

      {/* Login Buttons */}
      <View className="space-y-3">
        <Pressable
          onPress={handleLogin}
          className="bg-yield py-4 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-black font-semibold text-lg">Continue with Email</Text>
        </Pressable>

        <Pressable
          onPress={handleLogin}
          className="bg-surface-200 py-4 rounded-xl items-center border border-surface-300 active:opacity-80"
        >
          <Text className="text-white font-semibold text-lg">Continue with Google</Text>
        </Pressable>
      </View>

      {/* Terms */}
      <Text className="text-zinc-500 text-xs text-center mt-8 px-8">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}
