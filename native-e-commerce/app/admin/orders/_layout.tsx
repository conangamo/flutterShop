import { Stack } from 'expo-router';

import { adminTheme } from '~/features/admin/ui/theme';

export default function AdminOrdersLayout() {
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
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
