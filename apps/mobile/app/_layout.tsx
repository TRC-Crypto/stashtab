import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Component, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import '../global.css';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: (error: Error, reset: () => void) => ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback
        ? this.props.fallback(this.state.error, this.reset)
        : ErrorFallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}

function ErrorFallback(error: Error, reset: () => void) {
  return (
    <View className="flex-1 bg-surface-50 items-center justify-center px-6">
      <Text className="text-red-400 text-xl font-semibold mb-2">Something went wrong</Text>
      <Text className="text-zinc-400 text-center mb-6">{error.message}</Text>
      <Pressable onPress={reset} className="bg-yield px-6 py-3 rounded-xl">
        <Text className="text-black font-semibold">Try Again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#18181b' },
        }}
      />
    </ErrorBoundary>
  );
}
