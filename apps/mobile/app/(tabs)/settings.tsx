import { View, Text, Pressable, Alert, Switch, ScrollView, Linking } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { mockUser } from '@/lib/mockData';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-zinc-400 text-sm uppercase tracking-wide mb-2 px-1">{title}</Text>
      <View className="bg-surface-100 rounded-xl border border-surface-300">{children}</View>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  danger,
  showArrow = true,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showArrow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-4 px-4 border-b border-surface-300 last:border-b-0 active:opacity-70"
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className={`flex-1 ${danger ? 'text-red-400' : 'text-white'}`}>{label}</Text>
      {value && <Text className="text-zinc-400">{value}</Text>}
      {onPress && showArrow && <Text className="text-zinc-500 ml-2">›</Text>}
    </Pressable>
  );
}

function SettingsToggle({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: string;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View className="flex-row items-center py-4 px-4 border-b border-surface-300 last:border-b-0">
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="flex-1 text-white">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3f3f46', true: '#00d974' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(mockUser.safeAddress);
    Alert.alert('Copied!', 'Wallet address copied to clipboard');
  };

  const handleViewOnExplorer = () => {
    Linking.openURL(`https://sepolia.basescan.org/address/${mockUser.safeAddress}`);
  };

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm Deletion', 'Type DELETE to confirm account deletion.', [
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data export has been initiated. You will receive an email with your data shortly.'
    );
  };

  return (
    <ScrollView className="flex-1 bg-surface-50 px-6 pt-16">
      {/* Header */}
      <Text className="text-white text-2xl font-semibold mb-8">Settings</Text>

      {/* Profile */}
      <SettingsSection title="Account">
        <View className="p-4 border-b border-surface-300">
          <Text className="text-zinc-400 text-sm mb-1">Email</Text>
          <Text className="text-white">{mockUser.email}</Text>
        </View>
        <View className="p-4">
          <Text className="text-zinc-400 text-sm mb-1">Wallet Address</Text>
          <View className="flex-row items-center">
            <Text className="text-white font-mono text-sm flex-1">
              {mockUser.safeAddress.slice(0, 8)}...
              {mockUser.safeAddress.slice(-6)}
            </Text>
            <Pressable onPress={handleCopyAddress} className="mr-3 active:opacity-70">
              <Text className="text-yield">Copy</Text>
            </Pressable>
            <Pressable onPress={handleViewOnExplorer} className="active:opacity-70">
              <Text className="text-yield">View ↗</Text>
            </Pressable>
          </View>
        </View>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingsToggle
          icon="🔔"
          label="Push Notifications"
          value={pushEnabled}
          onValueChange={setPushEnabled}
        />
        <SettingsToggle
          icon="💸"
          label="Transaction Alerts"
          value={transactionAlerts}
          onValueChange={setTransactionAlerts}
        />
        <SettingsToggle
          icon="🛡️"
          label="Security Alerts"
          value={securityAlerts}
          onValueChange={setSecurityAlerts}
        />
        <SettingsToggle
          icon="📣"
          label="Product Updates"
          value={marketingEnabled}
          onValueChange={setMarketingEnabled}
        />
      </SettingsSection>

      {/* Security */}
      <SettingsSection title="Security">
        <SettingsToggle
          icon="🔐"
          label="Biometric Login"
          value={biometricEnabled}
          onValueChange={setBiometricEnabled}
        />
        <SettingsItem icon="📱" label="Connected Devices" value="1 device" onPress={() => {}} />
        <SettingsItem
          icon="🔑"
          label="Recovery Phrase"
          onPress={() => {
            Alert.alert(
              'Recovery Phrase',
              'Your wallet is secured by Safe smart contracts. Recovery is handled through your Privy account.',
              [{ text: 'OK' }]
            );
          }}
        />
      </SettingsSection>

      {/* Network */}
      <SettingsSection title="Network">
        <SettingsItem
          icon="🌐"
          label="Network"
          value="Base Sepolia"
          onPress={() => {
            Alert.alert(
              'Network',
              'You are connected to Base Sepolia testnet. Mainnet support coming soon.',
              [{ text: 'OK' }]
            );
          }}
        />
        <SettingsItem icon="📈" label="Yield Protocol" value="Aave v3" showArrow={false} />
      </SettingsSection>

      {/* Data */}
      <SettingsSection title="Data & Privacy">
        <SettingsItem icon="📥" label="Export My Data" onPress={handleExportData} />
        <SettingsItem icon="🗑️" label="Delete Account" onPress={handleDeleteAccount} danger />
      </SettingsSection>

      {/* Legal */}
      <SettingsSection title="Legal">
        <SettingsItem
          icon="📄"
          label="Terms of Service"
          onPress={() => Linking.openURL('https://stashtab.app/terms')}
        />
        <SettingsItem
          icon="🛡️"
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://stashtab.app/privacy')}
        />
        <SettingsItem icon="📜" label="Licenses" onPress={() => {}} />
      </SettingsSection>

      {/* Support */}
      <SettingsSection title="Support">
        <SettingsItem
          icon="💬"
          label="Help Center"
          onPress={() => Linking.openURL('https://stashtab.app/help')}
        />
        <SettingsItem
          icon="✉️"
          label="Contact Support"
          onPress={() => Linking.openURL('mailto:support@stashtab.app')}
        />
      </SettingsSection>

      {/* Logout */}
      <View className="bg-surface-100 rounded-xl border border-surface-300 mb-8">
        <SettingsItem icon="🚪" label="Log Out" onPress={handleLogout} danger showArrow={false} />
      </View>

      {/* Version */}
      <View className="items-center pb-8">
        <Text className="text-zinc-500 text-sm">Stashtab v1.0.0</Text>
        <Text className="text-zinc-600 text-xs mt-1">Build 2024.12.23</Text>
      </View>
    </ScrollView>
  );
}
