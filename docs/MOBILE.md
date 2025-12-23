# Mobile App Guide

The Stashtab mobile app is built with Expo and React Native.

## Overview

The mobile app provides a native experience for iOS and Android with:

- Tab-based navigation (Home, Deposit, Send, Settings)
- NativeWind (Tailwind CSS for React Native)
- Expo Router for file-based routing
- Mock data for development

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Expo Go app on your phone (for testing)
- Or: iOS Simulator / Android Emulator

### Development

```bash
# Install dependencies
pnpm install

# Start the mobile app
cd apps/mobile
pnpm dev
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

### Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Entry redirect
│   ├── (auth)/             # Auth screens
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   └── (tabs)/             # Tab screens
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── deposit.tsx
│       ├── send.tsx
│       └── settings.tsx
├── src/
│   ├── components/         # Shared components
│   └── lib/
│       └── mockData.ts     # Mock data for development
├── assets/                 # Images, fonts
├── app.json               # Expo config
├── tailwind.config.js     # NativeWind config
└── package.json
```

## Integrating Privy

To add real authentication, integrate Privy's React Native SDK:

1. Install dependencies:

```bash
pnpm add @privy-io/expo
```

2. Wrap your app with PrivyProvider in `app/_layout.tsx`:

```tsx
import { PrivyProvider } from "@privy-io/expo";

export default function RootLayout() {
  return (
    <PrivyProvider appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID}>
      <Stack ... />
    </PrivyProvider>
  );
}
```

3. Use the Privy hook in your login screen:

```tsx
import { usePrivy } from "@privy-io/expo";

export default function LoginScreen() {
  const { login, authenticated } = usePrivy();

  if (authenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Pressable onPress={() => login()}>
      <Text>Sign In</Text>
    </Pressable>
  );
}
```

## Connecting to the API

Replace mock data with real API calls:

```tsx
// src/lib/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getAccount(token: string) {
  const response = await fetch(`${API_URL}/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function getTransactions(token: string) {
  const response = await fetch(`${API_URL}/account/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}
```

## QR Code for Deposits

Install the QR code library:

```bash
pnpm add react-native-qrcode-svg react-native-svg
```

Use in your deposit screen:

```tsx
import QRCode from "react-native-qrcode-svg";

<QRCode
  value={safeAddress}
  size={200}
  backgroundColor="white"
  color="black"
/>;
```

## Push Notifications

1. Configure in `app.json`:

```json
{
  "expo": {
    "plugins": ["expo-notifications"]
  }
}
```

2. Request permissions and get token:

```tsx
import * as Notifications from "expo-notifications";

async function registerForPush() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const token = await Notifications.getExpoPushTokenAsync();
  // Send token to your backend
  await registerDevice(token.data);
}
```

## Building for Production

### Expo Application Services (EAS)

1. Install EAS CLI:

```bash
npm install -g eas-cli
eas login
```

2. Configure builds:

```bash
eas build:configure
```

3. Build for stores:

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Over-the-Air Updates

Push updates without app store review:

```bash
eas update --branch production
```

## Customization

### Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      yield: {
        DEFAULT: "#your-brand-color",
      },
    },
  },
},
```

### App Icon & Splash

Replace files in `assets/`:
- `icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `adaptive-icon.png` (1024x1024, Android)
- `favicon.png` (48x48, web)

### App Name

Update in `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

## Testing

### On Device

Use Expo Go for quick testing during development.

### Simulators

```bash
# iOS Simulator
pnpm ios

# Android Emulator
pnpm android
```

### Development Build

For features requiring native code:

```bash
eas build --profile development --platform ios
```

## Troubleshooting

### Metro bundler issues

```bash
npx expo start --clear
```

### Dependency issues

```bash
pnpm install
npx expo install --fix
```

### iOS build issues

Ensure Xcode and Command Line Tools are installed.

### Android build issues

Ensure Android Studio and SDK are properly configured.

