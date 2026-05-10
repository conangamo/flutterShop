import { Stack } from 'expo-router';

import { adminTheme } from '~/features/admin/ui/theme';

export default function AdminLayout() {
  const bg = adminTheme.bg;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: bg,
        },
        headerTintColor: adminTheme.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: adminTheme.text,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: bg,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="orders" options={{ headerShown: false }} />
      <Stack.Screen name="inventory" options={{ headerShown: false }} />
      <Stack.Screen name="promos" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
    </Stack>
  );
}
