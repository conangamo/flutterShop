import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Quản trị' }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Bảng điều khiển' }} />
      <Stack.Screen name="orders" options={{ headerShown: false, title: 'Đơn hàng' }} />
      <Stack.Screen name="inventory" options={{ headerShown: false, title: 'Kho hàng' }} />
      <Stack.Screen name="promos" options={{ headerShown: false, title: 'Khuyến mãi' }} />
      <Stack.Screen name="users" options={{ headerShown: false, title: 'Người dùng' }} />
      <Stack.Screen name="categories" options={{ headerShown: false, title: 'Danh mục' }} />
    </Stack>
  );
}
