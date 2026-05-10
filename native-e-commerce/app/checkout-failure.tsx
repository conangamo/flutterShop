import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { getAppLocale, strings } from '~/lib/i18n';

export default function CheckoutFailure() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const params = useLocalSearchParams<{ error?: string; promoCode?: string }>();
  const errorMessage = params.error ?? (L.errors.orderFailed || 'Order placement failed');
  const promoCode = params.promoCode ?? '';
  const checkoutCopy = {
    failureTitle: 'Order Failed',
    failureMessage: 'There was an error processing your order. Please try again.',
    troubleshoot: 'Troubleshooting',
    troubleshoot1: 'Check your payment details and try again',
    troubleshoot2: 'Ensure sufficient funds are available',
    troubleshoot3: 'Contact support if the issue persists',
    retryCheckout: 'Try Again',
    backToCart: 'Back to Cart',
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: checkoutCopy.failureTitle,
          headerShadowVisible: false,
        }}
      />
      <View className="flex-1 bg-bg-primary items-center justify-center px-6">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}>
          <View className="items-center justify-center">
            {/* Error Icon */}
            <Animated.View
              entering={FadeIn.duration(600)}
              className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-accent-coral/10 border-2 border-accent-coral"
              style={{
                shadowColor: '#FF6584',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text className="text-accent-coral text-4xl">✕</Text>
            </Animated.View>

            {/* Error Title */}
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Text className="text-center text-[32px] font-extrabold text-text-primary mb-2">
                {checkoutCopy.failureTitle}
              </Text>
              <Text className="text-center text-[16px] leading-[24px] text-text-secondary mb-8">
                {checkoutCopy.failureMessage}
              </Text>
            </Animated.View>

            {/* Error Details */}
            <Animated.View entering={FadeInDown.duration(500).delay(300)} className="w-full">
              <View className="rounded-[28px] bg-bg-surface border border-semantic-border p-6">
                <View className="flex-row items-start gap-3 rounded-[20px] bg-accent-coral/10 border border-accent-coral/20 p-4">
                  <Ionicons name="alert-circle-outline" size={20} color="#FF6584" />
                  <View className="flex-1">
                    <Text className="text-[12px] uppercase tracking-[1.5px] text-accent-coral">
                      {L.errors?.generic ?? 'Error Details'}
                    </Text>
                    <Text className="mt-2 text-[14px] leading-[20px] text-text-primary">
                      {errorMessage}
                    </Text>
                  </View>
                </View>
                {promoCode ? (
                  <View className="mt-3 rounded-[14px] bg-semantic-warning/10 border border-semantic-warning/25 p-3">
                    <Text className="text-[12px] uppercase tracking-[1.5px] text-semantic-warning">
                      Promo used
                    </Text>
                    <Text className="mt-1 text-[13px] font-semibold text-semantic-warning">{promoCode}</Text>
                  </View>
                ) : null}

                {/* Troubleshooting Tips */}
                <View className="mt-6">
                  <Text className="text-[12px] uppercase tracking-[1.5px] text-text-secondary">
                    {checkoutCopy.troubleshoot}
                  </Text>
                  <View className="mt-3 gap-2">
                    <View className="flex-row items-start gap-2">
                      <Text className="mt-0.5 text-[16px] text-accent">•</Text>
                      <Text className="flex-1 text-[13px] leading-[20px] text-text-secondary">
                        {checkoutCopy.troubleshoot1}
                      </Text>
                    </View>
                    <View className="flex-row items-start gap-2">
                      <Text className="mt-0.5 text-[16px] text-accent">•</Text>
                      <Text className="flex-1 text-[13px] leading-[20px] text-text-secondary">
                        {checkoutCopy.troubleshoot2}
                      </Text>
                    </View>
                    <View className="flex-row items-start gap-2">
                      <Text className="mt-0.5 text-[16px] text-accent">•</Text>
                      <Text className="flex-1 text-[13px] leading-[20px] text-text-secondary">
                        {checkoutCopy.troubleshoot3}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-8 w-full gap-3">
              <Pressable
                className="items-center rounded-2xl bg-accent-coral px-8 py-4 w-full"
                style={{
                  shadowColor: '#FF6584',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 10,
                }}
                onPress={() => router.replace('/checkout')}>
                <Text className="font-extrabold text-[15px] text-white">
                  {checkoutCopy.retryCheckout}
                </Text>
              </Pressable>
              <Pressable
                className="items-center rounded-2xl border border-semantic-border bg-bg-elevated px-8 py-4 w-full"
                onPress={() => router.replace('/cart')}>
                <Text className="font-semibold text-[15px] text-text-primary">
                  {checkoutCopy.backToCart}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
