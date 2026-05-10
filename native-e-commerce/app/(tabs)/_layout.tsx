import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '~/components/HeaderButton';
import { TabBarIcon } from '~/components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // === FLOATING GLASSMORPHISM TAB BAR ===
        tabBarStyle: {
          // Floating Effect
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          
          // Pill Shape
          height: 64,
          borderRadius: 32, 
          
          // Glassmorphism Effect
          backgroundColor: 'rgba(28, 28, 40, 0.9)', // Semi-transparent bg-elevated
          
          // Border & Shadow
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
          
          // Remove default styling
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
        },

        // === ICON & LABEL COLORS ===
        tabBarActiveTintColor: '#6C63FF', // accent — active tab
        tabBarInactiveTintColor: '#888899', // Slightly brighter for glass effect

        // === MINIMALIST APPROACH - NO LABELS ===
        tabBarShowLabel: false,

        // === HEADER (for tab screens that show a header) ===
        headerStyle: {
          backgroundColor: '#0A0A0F',
        },
        headerTintColor: '#F0F0F5',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: -0.3,
          color: '#F0F0F5',
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: 'Đơn hàng',
          headerShown: true,
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
