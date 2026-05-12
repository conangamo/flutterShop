import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // animationEnabled: true,
      }}>
      <Stack.Screen name="login" options={{ title: 'Đăng nhập' }} />
      <Stack.Screen name="signup" options={{ title: 'Đăng ký' }} />
      <Stack.Screen name="forgot" options={{ title: 'Quên mật khẩu' }} />
    </Stack>
  );
}
