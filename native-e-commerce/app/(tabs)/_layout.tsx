import { Link, Tabs } from 'expo-router';

import { HeaderButton } from '~/components/HeaderButton';
import { TabBarIcon } from '~/components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // === TAB BAR CONTAINER ===
        tabBarStyle: {
          backgroundColor: '#1C1C28', // bg-elevated
          borderTopWidth: 0, // Remove the default top border line
          elevation: 0, // Android: remove shadow
          shadowOpacity: 0, // iOS: remove shadow
          height: 64, // Slightly taller for breathing room
          paddingBottom: 10, // Lift icons from the very bottom edge
          paddingTop: 8,
        },

        // === ICON & LABEL COLORS ===
        tabBarActiveTintColor: '#6C63FF', // accent — active tab
        tabBarInactiveTintColor: '#444455', // text-muted — inactive tabs

        // === LABEL STYLING ===
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.4,
          marginTop: 2,
        },

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
