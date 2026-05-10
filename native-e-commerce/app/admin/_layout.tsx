import { Stack } from 'expo-router';

export default function AdminLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="orders" options={{ headerShown: false }} />
      <Stack.Screen name="inventory" options={{ title: 'Tồn kho' }} />
      <Stack.Screen name="promos" options={{ title: 'Khuyến mãi' }} />
      <Stack.Screen name="users" options={{ title: 'Người dùng' }} />
      <Stack.Screen name="categories" options={{ title: 'Danh mục' }} />
    </Stack>
  );
}
