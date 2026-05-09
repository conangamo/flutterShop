import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { resetOnboardingSeen } from '~/lib/onboardingStorage';
import { useToast } from '~/components/ToastProvider';

type TestRouteItem = {
  label: string;
  path?: string;
  variant?: 'primary' | 'outline';
  onPress?: () => void;
};

const TAB_ROUTES: TestRouteItem[] = [
  { label: 'Home Tab', path: '/(tabs)' },
  { label: 'Cart Tab', path: '/(tabs)/cart' },
  { label: 'Order Tab', path: '/(tabs)/order' },
  { label: 'Account Tab', path: '/(tabs)/account' },
];

const AUTH_ROUTES: TestRouteItem[] = [
  { label: 'Login', path: '/(auth)/login' },
  { label: 'Signup', path: '/(auth)/signup' },
  { label: 'Forgot Password', path: '/(auth)/forgot' },
];

const FLOW_ROUTES: TestRouteItem[] = [
  { label: 'Checkout', path: '/checkout' },
  { label: 'Address', path: '/address' },
  { label: 'Onboarding', path: '/onboarding' },
  { label: 'Modal', path: '/modal' },
  { label: 'Checkout Success', path: '/checkout-success' },
  { label: 'Checkout Failure', path: '/checkout-failure' },
];

const DETAIL_ROUTES: TestRouteItem[] = [
  { label: 'Product Detail (sample)', path: '/product/jewelry-set-01' },
  { label: 'Orders list', path: '/(tabs)/order' },
  { label: 'Edit Profile', path: '/account/edit' },
  { label: 'Addresses', path: '/addresses' },
];

export default function Settings() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleResetOnboarding = async () => {
    await resetOnboardingSeen();
    addToast('success', 'Done', 'Onboarding has been reset. Reopen app to see it again.');
    console.log('Onboarding has been reset. Reopen app to see it again.');
  };

  const renderItem = (item: TestRouteItem, index: number) => {
    const isPrimary = item.variant === 'primary';

    return (
      <Animated.View key={item.label} entering={FadeInDown.duration(300).delay(index * 30)}>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            borderRadius: 12,
            paddingVertical: 12,
            backgroundColor: isPrimary ? '#6C63FF' : 'transparent',
            borderWidth: isPrimary ? 0 : 1,
            borderColor: '#2A2A3A',
          }}
          onPress={() => {
            if (item.onPress) {
              item.onPress();
              return;
            }

            if (item.path) {
              router.push(item.path as any);
            }
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: isPrimary ? '#fff' : '#F0F0F5' }}>
            {item.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const actions: TestRouteItem[] = [
    {
      label: 'Reset Onboarding',
      variant: 'outline',
      onPress: handleResetOnboarding,
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Cài đặt', headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, marginTop: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#F0F0F5' }}>Cài đặt</Text>
                <Text style={{ marginTop: 4, color: '#8888A0' }}>Quick links để test tất cả màn hình chính.</Text>
              </View>
              <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 9999, backgroundColor: '#1C1C28', borderWidth: 1, borderColor: '#2A2A3A' }}>
                <Ionicons name="settings-outline" size={20} color="#6C63FF" />
              </View>
            </View>
          </Animated.View>

          <Section title="Tabs">{TAB_ROUTES.map((item, idx) => renderItem(item, idx))}</Section>
          <Section title="Auth">{AUTH_ROUTES.map((item, idx) => renderItem(item, idx))}</Section>
          <Section title="Flow">{FLOW_ROUTES.map((item, idx) => renderItem(item, idx))}</Section>
          <Section title="Dynamic Detail Routes">{DETAIL_ROUTES.map((item, idx) => renderItem(item, idx))}</Section>
          <Section title="Actions">{actions.map((item, idx) => renderItem(item, idx))}</Section>
        </ScrollView>
      </View>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 28 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 4,
            height: 16,
            backgroundColor: '#6C63FF',
            borderRadius: 2,
            marginRight: 10,
          }}
        />
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, color: '#8888A0', textTransform: 'uppercase' }}>
          {title}
        </Text>
      </View>
      <View style={{ gap: 12 }}>{children}</View>
    </View>
  );
}
