import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { mockUser } from '@/lib/mockData';

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-surface-300 active:opacity-70"
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className={`flex-1 ${danger ? 'text-red-400' : 'text-white'}`}>{label}</Text>
      {value && <Text className="text-zinc-400">{value}</Text>}
      {onPress && <Text className="text-zinc-500 ml-2">›</Text>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-surface-50 px-6 pt-16">
      {/* Header */}
      <Text className="text-white text-2xl font-semibold mb-8">Settings</Text>

      {/* Profile */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 mb-6">
        <View className="p-4 border-b border-surface-300">
          <Text className="text-zinc-400 text-sm mb-1">Email</Text>
          <Text className="text-white">{mockUser.email}</Text>
        </View>
        <View className="p-4">
          <Text className="text-zinc-400 text-sm mb-1">Wallet Address</Text>
          <Text className="text-white font-mono text-sm">
            {mockUser.safeAddress.slice(0, 8)}...
            {mockUser.safeAddress.slice(-6)}
          </Text>
        </View>
      </View>

      {/* Settings List */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 px-4 mb-6">
        <SettingsItem icon="🔔" label="Notifications" value="On" onPress={() => {}} />
        <SettingsItem icon="🔒" label="Security" onPress={() => {}} />
        <SettingsItem icon="🌐" label="Network" value="Base Sepolia" onPress={() => {}} />
        <SettingsItem icon="📄" label="Terms of Service" onPress={() => {}} />
        <SettingsItem icon="🛡️" label="Privacy Policy" onPress={() => {}} />
      </View>

      {/* Logout */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 px-4">
        <SettingsItem icon="🚪" label="Log Out" onPress={handleLogout} danger />
      </View>

      {/* Version */}
      <Text className="text-zinc-500 text-sm text-center mt-8">Stashtab v1.0.0</Text>
    </View>
  );
}
