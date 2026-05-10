import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '~/components/Button';
import { useToast } from '~/components/ToastProvider';
import { AppInput } from '~/components/ui/AppInput';
import { useCart } from '~/features/cart/hooks/useCart';
import { getAddresses } from '~/features/account/services/addressStorage';
import { getAccessToken } from '~/lib/api/token';
import { placeOrder } from '~/lib/api/orders';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { Address } from '~/lib/types/models';
import { variantIdForOrderApi } from '~/lib/utils/variant';
import { formatCurrency } from '~/lib/utils/formatters';

const paymentMethods = [
  {
    id: 'card',
    title: 'Thẻ tín dụng / Ghi nợ',
    subtitle: 'Visa, Mastercard, JCB',
    icon: 'card-outline' as const,
    type: 'CREDIT_CARD' as const,
  },
  {
    id: 'cod',
    title: 'Thanh toán khi nhận hàng',
    subtitle: 'Trả tiền khi nhận hàng',
    icon: 'cash-outline' as const,
    type: 'COD' as const,
  },
  {
    id: 'wallet',
    title: 'Ví điện tử',
    subtitle: 'Momo, ZaloPay, VNPay',
    icon: 'wallet-outline' as const,
    type: 'E_WALLET' as const,
  },
];

const SHIPPING_FEE_VND = 30_000;
const FREE_SHIPPING_THRESHOLD = 1_500_000;

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ promoCode?: string | string[] }>();
  const locale = getAppLocale();
  const L = strings(locale);
  const { items, clearCart } = useCart();
  const { addToast } = useToast();
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    paymentMethods[0]?.id ?? ''
  );
  const [placing, setPlacing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const promoFromRoute = Array.isArray(params.promoCode) ? params.promoCode[0] : params.promoCode;

  useEffect(() => {
    const normalized = promoFromRoute?.trim().toUpperCase();
    if (!normalized) return;
    setPromoInput((prev) => prev || normalized);
    setPromoCode((prev) => prev ?? normalized);
  }, [promoFromRoute]);

  const refreshAddresses = useCallback(async () => {
    try {
      const list = await getAddresses();
      setShippingAddresses(list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      setSelectedAddressId((prev) => {
        if (prev && list.some((a) => a.id === prev)) return prev;
        return def?.id ?? '';
      });
    } catch {
      setShippingAddresses([]);
      setSelectedAddressId('');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshAddresses();
    }, [refreshAddresses])
  );

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping =
    items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_VND;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const selectedAddress = useMemo(
    () =>
      shippingAddresses.find((address) => address.id === selectedAddressId) ??
      shippingAddresses[0],
    [selectedAddressId, shippingAddresses]
  );

  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find((method) => method.id === selectedPaymentMethodId) ?? paymentMethods[0],
    [selectedPaymentMethodId]
  );
  const canPlaceOrder = items.length > 0 && Boolean(selectedAddress) && !placing;

  const handleCheckoutConfirm = async () => {
    const token = await getAccessToken();
    if (!token) {
      Alert.alert(L.errors.checkoutNeedLoginTitle, L.errors.checkoutNeedLoginBody, [
        { text: L.common.cancel, style: 'cancel' },
        { text: L.common.login, onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (!selectedAddress) {
      Alert.alert(L.errors.checkoutNeedAddressTitle, L.errors.checkoutNeedAddressBody, [
        { text: L.common.ok, onPress: () => router.push('/addresses/new') },
      ]);
      return;
    }
    if (!items.length) return;

    setShowConfirm(true);
  };

  const handleConfirmPlaceOrder = () => {
    setShowConfirm(false);
    void handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const created = await placeOrder({
        items: items.map((it) => ({
          productId: it.product.id,
          variantId: variantIdForOrderApi(it.product.id, it.variantId),
          quantity: it.quantity,
        })),
        shippingAddressId: selectedAddress!.id,
        paymentMethod: selectedPaymentMethodId,
        paymentMethodType: selectedPaymentMethod!.type,
        promoCode: promoCode ?? undefined,
      });
      clearCart();
      addToast('success', L.checkout.successTitle, L.checkout.successMessage);
      router.replace({
        pathname: '/checkout-success',
        params: {
          orderId: created.id,
          promoCode: promoCode ?? undefined,
          paymentMethodType: selectedPaymentMethod!.type,
          orderTotal: total.toString(),
        },
      });
    } catch (e) {
      const msg = resolveApiError(e, locale);
      addToast('error', L.common.error, msg);
      router.replace({
        pathname: '/checkout-failure',
        params: {
          error: msg,
          promoCode: promoCode ?? undefined,
        },
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thanh toán',
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1 bg-bg-primary">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pb-8 pt-3">
            <Text className="text-[13px] uppercase tracking-[3px] text-accent">
              Thanh toán an toàn
            </Text>
            <Text className="mt-2 text-[30px] font-bold text-text-primary">Thanh toán</Text>

            {items.length === 0 ? (
              <View className="mt-5 rounded-[28px] bg-bg-surface border border-semantic-border p-6">
                <Text className="text-center text-[15px] text-text-secondary">{L.empty.checkoutCart}</Text>
                <View className="mt-4">
                  <Button title={L.empty.checkoutBackShop} onPress={() => router.replace('/(tabs)')} />
                </View>
              </View>
            ) : (
              <>
                <View style={{ marginTop: 20, borderRadius: 28, backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#F0F0F5', letterSpacing: 0.3 }}>
                        Địa chỉ giao hàng
                      </Text>
                      <Text style={{ marginTop: 4, fontSize: 14, color: '#8888A0', fontWeight: '500' }}>
                        Giao hàng đến đâu?
                      </Text>
                    </View>
                    <Pressable onPress={() => router.push('/address')}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#6C63FF', letterSpacing: 0.3 }}>Thay đổi</Text>
                    </Pressable>
                  </View>

                  <View style={{ gap: 12 }}>
                    {shippingAddresses.length === 0 ? (
                      <Text style={{ fontSize: 14, color: '#8888A0', lineHeight: 22 }}>
                        Chưa có địa chỉ. Đăng nhập và thêm địa chỉ trong Address book.
                      </Text>
                    ) : (
                      shippingAddresses.map((address) => {
                        const isSelected = address.id === selectedAddressId;

                        return (
                          <Pressable
                            key={address.id}
                            onPress={() => setSelectedAddressId(address.id)}
                            style={{
                              borderRadius: 18,
                              borderWidth: isSelected ? 2 : 1,
                              borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
                              backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.08)' : '#1C1C28',
                              padding: 16,
                              shadowColor: isSelected ? '#6C63FF' : '#000',
                              shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
                              shadowOpacity: isSelected ? 0.3 : 0.1,
                              shadowRadius: isSelected ? 12 : 6,
                              elevation: isSelected ? 6 : 2,
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'start', gap: 14 }}>
                              <View
                                style={{
                                  marginTop: 2,
                                  height: 48,
                                  width: 48,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 9999,
                                  backgroundColor: isSelected ? '#6C63FF' : '#13131A',
                                  borderWidth: 1,
                                  borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
                                }}>
                                <Ionicons
                                  name="location"
                                  size={22}
                                  color={isSelected ? '#FFFFFF' : '#8888A0'}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                  <Text style={{ fontSize: 16, fontWeight: '800', color: isSelected ? '#6C63FF' : '#F0F0F5', letterSpacing: 0.2 }}>
                                    {address.name}
                                  </Text>
                                  {address.isDefault ? (
                                    <View style={{ borderRadius: 9999, backgroundColor: 'rgba(62, 207, 142, 0.15)', borderWidth: 1, borderColor: 'rgba(62, 207, 142, 0.3)', paddingHorizontal: 8, paddingVertical: 3 }}>
                                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#3ECF8E', letterSpacing: 0.5 }}>
                                        Mặc định
                                      </Text>
                                    </View>
                                  ) : null}
                                </View>
                                <Text style={{ fontSize: 14, lineHeight: 22, color: '#8888A0', fontWeight: '500', marginBottom: 4 }}>
                                  {address.address}
                                </Text>
                                <Text style={{ fontSize: 14, color: '#8888A0', fontWeight: '500' }}>
                                  {address.city} • {address.phone}
                                </Text>
                              </View>
                              {isSelected && (
                                <View style={{ position: 'absolute', top: 14, right: 14, width: 24, height: 24, borderRadius: 9999, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 }}>
                                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>✓</Text>
                                </View>
                              )}
                            </View>
                          </Pressable>
                        );
                      })
                    )}
                  </View>

                  <Pressable
                    style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, backgroundColor: '#1C1C28', borderWidth: 1, borderColor: '#2A2A3A', paddingHorizontal: 16, paddingVertical: 14 }}
                    onPress={() => router.push('/addresses')}>
                    <View>
                      <Text style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8888A0', fontWeight: '700' }}>
                        Quản lý địa chỉ
                      </Text>
                      <Text style={{ marginTop: 4, fontSize: 14, fontWeight: '700', color: '#F0F0F5' }}>
                        Mở sổ địa chỉ
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8888A0" />
                  </Pressable>
                </View>

                <View style={{ marginTop: 16, borderRadius: 28, backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#F0F0F5', letterSpacing: 0.3, marginBottom: 6 }}>Phương thức thanh toán</Text>
                  <Text style={{ fontSize: 14, color: '#8888A0', fontWeight: '500', marginBottom: 16 }}>
                    Chọn cách thanh toán
                  </Text>

                  <View style={{ gap: 12 }}>
                    {paymentMethods.map((method) => {
                      const isSelected = method.id === selectedPaymentMethodId;
                      return (
                        <Pressable
                          key={method.id}
                          onPress={() => setSelectedPaymentMethodId(method.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 18,
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
                            backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.08)' : '#1C1C28',
                            padding: 16,
                            shadowColor: isSelected ? '#6C63FF' : '#000',
                            shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
                            shadowOpacity: isSelected ? 0.3 : 0.1,
                            shadowRadius: isSelected ? 12 : 6,
                            elevation: isSelected ? 6 : 2,
                          }}>
                          <View
                            style={{
                              marginRight: 14,
                              height: 52,
                              width: 52,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 9999,
                              backgroundColor: isSelected ? '#6C63FF' : '#13131A',
                              borderWidth: 1,
                              borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
                            }}>
                            <Ionicons
                              name={method.icon}
                              size={24}
                              color={isSelected ? '#FFFFFF' : '#8888A0'}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: isSelected ? '#6C63FF' : '#F0F0F5', letterSpacing: 0.2, marginBottom: 4 }}>
                              {method.title}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#8888A0', fontWeight: '500' }}>
                              {method.subtitle}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={{ width: 24, height: 24, borderRadius: 9999, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 }}>
                              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>✓</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="mt-4 rounded-[28px] bg-bg-surface border border-semantic-border p-4">
                  <Text className="text-[16px] font-semibold text-text-primary">Mã giảm giá</Text>
                  <Text className="mt-1 text-[13px] text-text-secondary">
                    Mã sẽ được backend kiểm tra khi đặt đơn.
                  </Text>
                  <View className="mt-3 flex-row items-end gap-2">
                    <View className="flex-1">
                      <AppInput
                        value={promoInput}
                        onChangeText={setPromoInput}
                        placeholder="Nhập mã giảm giá"
                        autoCapitalize="characters"
                      />
                    </View>
                    <Pressable
                      onPress={() => {
                        const normalized = promoInput.trim().toUpperCase();
                        if (!normalized) return;
                        setPromoCode(normalized);
                        setPromoInput(normalized);
                      }}
                      className="rounded-full bg-accent px-4 py-2.5">
                      <Text className="text-[12px] font-semibold text-white">Áp dụng</Text>
                    </Pressable>
                  </View>
                  {promoCode ? (
                    <View className="mt-3 flex-row items-center justify-between rounded-[14px] bg-semantic-success/10 border border-semantic-success/25 px-3 py-2">
                      <Text className="text-[12px] font-semibold text-semantic-success">Đang áp dụng: {promoCode}</Text>
                      <Pressable onPress={() => setPromoCode(null)}>
                        <Text className="text-[12px] font-semibold text-semantic-success">Bỏ</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>

                <View className="mt-4 rounded-[28px] bg-bg-surface border border-semantic-border p-5">
                  <Text className="text-[16px] font-semibold text-text-primary mb-4">Tóm tắt đơn hàng</Text>

                  <SummaryRow label="Tạm tính" value={formatCurrency(subtotal)} />
                  <SummaryRow
                    label="Phí vận chuyển"
                    value={shipping === 0 && items.length > 0 ? 'Miễn phí' : formatCurrency(shipping)}
                  />
                  <SummaryRow
                    label="Giảm giá"
                    value={`-${formatCurrency(discount)}`}
                    valueClass="text-semantic-success"
                  />
                  {promoCode ? (
                    <Text className="mb-3 text-[12px] text-semantic-success">
                      Promo `{promoCode}` sẽ được xác nhận khi nhấn Đặt hàng.
                    </Text>
                  ) : null}

                  <View className="my-3 h-px bg-semantic-border" />

                  <SummaryRow label="Tổng cộng" value={formatCurrency(total)} total />

                  <View className="mt-3 rounded-[20px] bg-bg-elevated border border-semantic-border p-3">
                    <Text className="text-[12px] uppercase tracking-[1.5px] text-text-secondary">
                      Phương thức đã chọn
                    </Text>
                    <Text className="mt-1 text-[14px] font-semibold text-text-primary">
                      {selectedPaymentMethod?.title}
                    </Text>
                  </View>
                </View>

                <View className="mt-5 px-4 pb-10 pt-4">
                  <Pressable
                    onPress={handleCheckoutConfirm}
                    disabled={!canPlaceOrder}
                    className="bg-accent rounded-2xl py-[18px] items-center"
                    style={{
                      shadowColor: '#6C63FF',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.45,
                      shadowRadius: 20,
                      elevation: 12,
                    }}
                  >
                    <Text className="text-white text-[17px] font-extrabold tracking-wider">
                      {placing ? 'Đang đặt hàng…' : 'Đặt hàng'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {showConfirm ? (
          <View className="absolute inset-0 z-50 items-center justify-center bg-black/70 px-5">
            <View className="w-full max-w-[420px] rounded-[28px] bg-bg-surface border border-semantic-border p-5">
              <Text className="text-[18px] font-semibold text-text-primary">
                {L.errors.checkoutConfirmTitle}
              </Text>
              <Text className="mt-2 text-[14px] leading-[22px] text-text-secondary">
                Tổng: {formatCurrency(total)}. Bạn có chắc chắn?
              </Text>
              <View className="mt-4 rounded-[16px] bg-bg-elevated border border-semantic-border p-3">
                <Text className="text-[12px] uppercase tracking-[1.5px] text-text-secondary">
                  Thông tin đơn hàng
                </Text>
                <Text className="mt-1 text-[13px] text-text-primary">
                  {items.length} sản phẩm · {selectedPaymentMethod?.title}
                </Text>
                <Text className="mt-1 text-[13px] text-text-secondary" numberOfLines={2}>
                  {selectedAddress?.address}, {selectedAddress?.city}
                </Text>
                {promoCode ? (
                  <Text className="mt-1 text-[12px] font-semibold text-semantic-success">
                    Promo: {promoCode}
                  </Text>
                ) : null}
              </View>

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  className="flex-1 items-center rounded-[20px] border border-semantic-border bg-bg-elevated px-4 py-3"
                  onPress={() => setShowConfirm(false)}>
                  <Text className="font-semibold text-text-primary">{L.common.cancel}</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-[20px] bg-accent px-4 py-3"
                  disabled={placing}
                  onPress={handleConfirmPlaceOrder}>
                  <Text className="font-semibold text-white">
                    {placing ? 'Đang đặt…' : L.errors.checkoutConfirmPlace}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </>
  );
}

function SummaryRow({
  label,
  value,
  valueClass = 'text-text-primary',
  total = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  total?: boolean;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text
        className={
          total ? 'text-[16px] font-semibold text-text-primary' : 'text-[14px] text-text-secondary'
        }>
        {label}
      </Text>
      <Text
        className={`${total ? 'text-[20px] font-bold text-accent' : 'text-[14px] font-semibold'} ${valueClass}`}>
        {value}
      </Text>
    </View>
  );
}
