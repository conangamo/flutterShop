import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '~/components/Button';
import { useToast } from '~/components/ToastProvider';
import { VoucherBottomSheet } from '~/components/checkout/VoucherBottomSheet';
import { AddressCard } from '~/components/address/AddressCard';
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
  const params = useLocalSearchParams<{ promoCode?: string | string[]; selectedItems?: string | string[] }>();
  const locale = getAppLocale();
  const L = strings(locale);
  const { items: allCartItems, clearCart } = useCart();
  const { addToast } = useToast();
  
  // Filter items based on selectedItems param from cart
  const selectedItemsParam = Array.isArray(params.selectedItems) ? params.selectedItems[0] : params.selectedItems;
  const selectedKeys = selectedItemsParam ? selectedItemsParam.split(',') : [];
  
  // If selectedItems param exists, filter cart items; otherwise use all items (backward compatibility)
  const items = selectedKeys.length > 0 
    ? allCartItems.filter(it => {
        const itemKey = `${it.product.id}::${it.variantId ?? ''}`;
        return selectedKeys.includes(itemKey);
      })
    : allCartItems;
  
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    paymentMethods[0]?.id ?? ''
  );
  const [placing, setPlacing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [showVoucherSheet, setShowVoucherSheet] = useState(false);
  const promoFromRoute = Array.isArray(params.promoCode) ? params.promoCode[0] : params.promoCode;

  useEffect(() => {
    const normalized = promoFromRoute?.trim().toUpperCase();
    if (!normalized) return;
    setVoucherCode(normalized);
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
  const discount = voucherDiscount;
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
        promoCode: voucherCode ?? undefined,
      });
      clearCart();
      addToast('success', L.checkout.successTitle, L.checkout.successMessage);
      router.replace({
        pathname: '/checkout-success',
        params: {
          orderId: created.id,
          promoCode: voucherCode ?? undefined,
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
          promoCode: voucherCode ?? undefined,
        },
      });
    } finally {
      setPlacing(false);
    }
  };

  const handleApplyVoucher = (code: string, discountAmount: number) => {
    setVoucherCode(code);
    setVoucherDiscount(discountAmount);
    addToast('success', 'Thành công', `Đã áp dụng mã ${code}`);
  };

  const handleRemoveVoucher = () => {
    setVoucherCode(null);
    setVoucherDiscount(0);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thanh toán',
          headerShown: false,
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
                    <Pressable onPress={() => router.push('/addresses')}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#6C63FF', letterSpacing: 0.3 }}>Thay đổi</Text>
                    </Pressable>
                  </View>

                  <View style={{ gap: 14 }}>
                    {shippingAddresses.length === 0 ? (
                      <View style={{ padding: 16, borderRadius: 16, backgroundColor: '#1C1C28', borderWidth: 1, borderColor: '#2A2A3A' }}>
                        <Text style={{ fontSize: 14, color: '#8888A0', lineHeight: 22, textAlign: 'center' }}>
                          Chưa có địa chỉ. Đăng nhập và thêm địa chỉ trong Address book.
                        </Text>
                      </View>
                    ) : (
                      shippingAddresses.map((address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                          isSelected={address.id === selectedAddressId}
                          onPress={() => setSelectedAddressId(address.id)}
                        />
                      ))
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
                  <Pressable
                    onPress={() => setShowVoucherSheet(true)}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="ticket" size={20} color="#6C63FF" />
                        <Text className="text-[16px] font-semibold text-text-primary">
                          Mã giảm giá
                        </Text>
                      </View>
                      {voucherCode ? (
                        <View className="mt-2 flex-row items-center gap-2">
                          <View className="rounded-[10px] bg-semantic-success/15 px-3 py-1.5">
                            <Text className="text-[13px] font-bold text-semantic-success">
                              {voucherCode}
                            </Text>
                          </View>
                          <Text className="text-[13px] font-semibold text-semantic-success">
                            -{formatCurrency(voucherDiscount)}
                          </Text>
                        </View>
                      ) : (
                        <Text className="mt-1 text-[13px] text-text-secondary">
                          Chọn hoặc nhập mã
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2">
                      {voucherCode ? (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveVoucher();
                          }}
                          className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-semantic-error/10"
                        >
                          <Ionicons name="close" size={18} color="#FF6584" />
                        </Pressable>
                      ) : null}
                      <Ionicons name="chevron-forward" size={20} color="#8888A0" />
                    </View>
                  </Pressable>
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
                    value={discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
                    valueClass={discount > 0 ? "text-semantic-success" : "text-text-secondary"}
                  />

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

      <VoucherBottomSheet
        visible={showVoucherSheet}
        onClose={() => setShowVoucherSheet(false)}
        onApply={handleApplyVoucher}
        currentSubtotal={subtotal}
        appliedCode={voucherCode ?? undefined}
      />
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
