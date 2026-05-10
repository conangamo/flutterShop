import { Stack } from 'expo-router';

export default function AddressesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0A0F',
        },
        headerTintColor: '#F0F0F5',
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
      <Stack.Screen name="index" options={{ title: 'Địa chỉ của tôi' }} />
      <Stack.Screen name="new" options={{ title: 'Thêm địa chỉ mới' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
