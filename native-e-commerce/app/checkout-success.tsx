import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function CheckoutSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; promoCode?: string; paymentMethodType?: string; orderTotal?: string }>();
  const orderId = params.orderId ?? '';
  const promoCode = params.promoCode ?? '';
  const paymentMethodType = params.paymentMethodType ?? '';
  const orderTotal = params.orderTotal ?? '0';
  const checkoutCopy = {
    successTitle: 'Đặt hàng thành công!',
    successMessage: 'Đơn hàng của bạn đã được ghi nhận.',
    orderId: 'MÃ ĐƠN HÀNG',
    nextSteps: 'TIẾN TRÌNH ĐƠN HÀNG',
    step1Title: 'Đã xác nhận',
    step1Desc: 'Chúng tôi đang chuẩn bị hàng.',
    step2Title: 'Đang giao',
    step2Desc: 'Sẽ thông báo khi lấy hàng.',
    step3Title: 'Đã giao',
    step3Desc: 'Cảm ơn bạn đã mua sắm.',
    viewOrder: 'Xem chi tiết đơn hàng',
    continueShopping: 'Tiếp tục mua sắm',
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: checkoutCopy.successTitle,
          headerShadowVisible: false,
        }}
      />
      <View className="flex-1 bg-bg-primary items-center justify-center px-6">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}>
          <View className="items-center justify-center">
            {/* Success Icon */}
            <Animated.View
              entering={FadeIn.duration(600)}
              className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-semantic-success/10 border-2 border-semantic-success"
              style={{
                shadowColor: '#3ECF8E',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text className="text-semantic-success text-4xl">✓</Text>
            </Animated.View>

            {/* Main Message */}
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Text className="text-center text-[32px] font-extrabold text-text-primary mb-2">
                {checkoutCopy.successTitle}
              </Text>
              <Text className="text-center text-[16px] leading-[24px] text-text-secondary mb-8">
                {checkoutCopy.successMessage}
              </Text>
            </Animated.View>

            {/* Order Details Card */}
            <Animated.View entering={FadeInDown.duration(500).delay(300)} className="w-full">
              <View className="rounded-[28px] bg-bg-surface border border-semantic-border p-6">
                <View className="mb-4 border-b border-semantic-border pb-4">
                  <Text className="text-[12px] uppercase tracking-[1.5px] text-text-secondary">
                    {checkoutCopy.orderId}
                  </Text>
                  <Text className="mt-2 text-[18px] font-semibold text-accent" numberOfLines={1}>
                    {orderId}
                  </Text>
                </View>
                {promoCode ? (
                  <View className="mb-4 rounded-[14px] bg-semantic-success/10 border border-semantic-success/25 p-3">
                    <Text className="text-[12px] uppercase tracking-[1.5px] text-semantic-success">
                      Promo applied
                    </Text>
                    <Text className="mt-1 text-[13px] font-semibold text-semantic-success">{promoCode}</Text>
                  </View>
                ) : null}

                {/* QR Code for E_WALLET Payment */}
                {paymentMethodType === 'E_WALLET' ? (
                  <View className="mb-4 items-center">
                    <View className="bg-white rounded-[12px] p-6" style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                    }}>
                      <Image
                        source={{ uri: `https://img.vietqr.io/image/BIDV-5321170903-compact2.png?amount=${orderTotal}&addInfo=${orderId}&accountName=NGUYEN PHUONG THAO` }}
                        style={{ width: 250, height: 250 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text className="text-center text-[14px] font-bold text-text-primary mt-4">
                      Vui lòng quét mã QR trên để hoàn tất thanh toán
                    </Text>
                  </View>
                ) : null}

                <View>
                  <Text className="text-[12px] uppercase tracking-[1.5px] text-text-secondary">
                    {checkoutCopy.nextSteps}
                  </Text>
                  <View className="mt-3 gap-5">
                    <View className="flex-row items-start gap-3">
                      <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-accent/15 border border-accent/30">
                        <Text className="text-[12px] font-bold text-accent">1</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-text-primary">
                          {checkoutCopy.step1Title}
                        </Text>
                        <Text className="mt-1 text-[13px] text-text-secondary">
                          {checkoutCopy.step1Desc}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-start gap-3">
                      <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-accent/15 border border-accent/30">
                        <Text className="text-[12px] font-bold text-accent">2</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-text-primary">
                          {checkoutCopy.step2Title}
                        </Text>
                        <Text className="mt-1 text-[13px] text-text-secondary">
                          {checkoutCopy.step2Desc}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-start gap-3">
                      <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-accent/15 border border-accent/30">
                        <Text className="text-[12px] font-bold text-accent">3</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-text-primary">
                          {checkoutCopy.step3Title}
                        </Text>
                        <Text className="mt-1 text-[13px] text-text-secondary">
                          {checkoutCopy.step3Desc}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mt-8 w-full gap-3">
              <Pressable
                className="items-center rounded-2xl bg-accent px-8 py-4 w-full"
                style={{
                  shadowColor: '#6C63FF',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 10,
                }}
                onPress={() => router.push(`/order/${encodeURIComponent(orderId)}`)}>
                <Text className="font-extrabold text-[15px] text-white">
                  {checkoutCopy.viewOrder}
                </Text>
              </Pressable>
              <Pressable
                className="items-center rounded-2xl border border-semantic-border bg-bg-elevated px-8 py-4 w-full"
                onPress={() => router.replace('/(tabs)')}>
                <Text className="font-semibold text-[15px] text-text-primary">
                  {checkoutCopy.continueShopping}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
