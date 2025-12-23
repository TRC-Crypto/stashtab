import { Tabs } from "expo-router";
import { View, Text } from "react-native";

function TabIcon({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: string;
  label: string;
}) {
  return (
    <View className="items-center pt-2">
      <Text
        className={`text-2xl ${focused ? "text-yield" : "text-zinc-500"}`}
      >
        {icon}
      </Text>
      <Text
        className={`text-xs mt-1 ${
          focused ? "text-yield font-medium" : "text-zinc-500"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1f1f23",
          borderTopColor: "#3f3f46",
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="deposit"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📥" label="Deposit" />
          ),
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📤" label="Send" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" label="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}

