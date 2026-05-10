import { Stack } from 'expo-router';

export default function AdminOrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0A0F', // bg-primary
        },
        headerTintColor: '#F0F0F5', // text-primary
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#F0F0F5',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#0A0A0F',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Quản lý đơn hàng' }} />
      <Stack.Screen name="[id]" options={{ title: 'Chi tiết đơn hàng' }} />
    </Stack>
  );
}
