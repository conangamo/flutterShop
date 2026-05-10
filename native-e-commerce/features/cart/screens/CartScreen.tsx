import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useToast } from '~/components/ToastProvider';
import { AppInput } from '~/components/ui/AppInput';
import { useCart } from '~/features/cart/hooks/useCart';
import { getAddresses } from '~/features/account/services/addressStorage';
import { getAccessToken } from '~/lib/api/token';
import { formatCurrency } from '~/lib/utils/formatters';
import { getAppLocale, strings } from '~/lib/i18n';

export default function CartScreen() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const { items, updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();
  const [addressPreview, setAddressPreview] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{
    productId: string;
    variantId: string | null;
    productName: string;
  } | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const handleRemoveItem = (productId: string, variantId: string | null, productName: string) => {
    setPendingDelete({ productId, variantId, productName });
  };

  const confirmDeleteItem = () => {
    if (!pendingDelete) return;
    removeFromCart(pendingDelete.productId, pendingDelete.variantId);
    addToast('success', L.common.success, `${pendingDelete.productName}: ${L.cart.removeSuccess}`);
    setPendingDelete(null);
  };

  const handleCheckoutPress = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      Alert.alert(L.errors.checkoutNeedLoginTitle, L.errors.checkoutNeedLoginBody, [
        { text: L.common.cancel, style: 'cancel' },
        { text: L.common.login, onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (appliedPromo) {
      router.push({ pathname: '/checkout', params: { promoCode: appliedPromo } });
      return;
    }
    router.push('/checkout');
  }, [L, appliedPromo, router]);

  const refreshPreview = useCallback(async () => {
    const S = strings(locale);
    try {
      const list = await getAddresses();
      const d = list.find((a) => a.isDefault) ?? list[0];
      setAddressPreview(d ? `${d.address}, ${d.city}` : S.cart.addressBookPrompt);
    } catch {
      setAddressPreview(S.cart.addressLoginPrompt);
    }
  }, [locale]);

  useFocusEffect(
    useCallback(() => {
      void refreshPreview();
    }, [refreshPreview])
  );

  const subtotal = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const shipping = items.length === 0 ? 0 : subtotal >= 1_500_000 ? 0 : 30_000;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Giỏ hàng',
          headerShown: false,
        }}
      />

      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
            {/* === HEADER === */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 13, letterSpacing: 3, color: '#6C63FF', textTransform: 'uppercase', fontWeight: '700' }}>
                  Giỏ hàng
                </Text>
                <Text style={{ marginTop: 8, fontSize: 30, fontWeight: '800', color: '#F0F0F5' }}>Giỏ của tôi</Text>
              </View>
              <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 9999, backgroundColor: '#1C1C28', borderWidth: 1, borderColor: '#2A2A3A' }}>
                <Ionicons name="cart-outline" size={20} color="#6C63FF" />
              </View>
            </View>

            {/* === DELIVERY ADDRESS === */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <View style={{ backgroundColor: '#13131A', borderRadius: 24, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#2A2A3A', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 9999, backgroundColor: 'rgba(108, 99, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(108, 99, 255, 0.3)' }}>
                    <Ionicons name="location" size={22} color="#6C63FF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, letterSpacing: 1.2, color: '#6C63FF', textTransform: 'uppercase', fontWeight: '800', marginBottom: 6 }}>
                      Địa chỉ giao hàng
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#F0F0F5', lineHeight: 22 }} numberOfLines={2}>
                      {addressPreview}
                    </Text>
                  </View>
                  <Pressable 
                    onPress={() => router.push('/address')}
                    style={{ padding: 8, backgroundColor: '#1C1C28', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A3A' }}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#8888A0" />
                  </Pressable>
                </View>
              </View>
            </Animated.View>

            {/* === CART ITEMS OR EMPTY STATE === */}
            {items.length === 0 ? (
              <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 40 }}>
                  <Text style={{ fontSize: 52, marginBottom: 16 }}>🛍️</Text>
                  <Text style={{ color: '#F0F0F5', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
                    Giỏ hàng trống
                  </Text>
                  <Text style={{ color: '#8888A0', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
                    Thêm sản phẩm để bắt đầu
                  </Text>
                  <Pressable
                    onPress={() => router.push('/(tabs)')}
                    style={{
                      backgroundColor: '#6C63FF',
                      borderRadius: 16,
                      paddingHorizontal: 24,
                      paddingVertical: 14,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                      Tiếp tục mua sắm
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            ) : (
              <>
                {/* === CART ITEMS LIST === */}
                <View style={{ gap: 16, marginBottom: 20 }}>
                  {items.map((it, index) => (
                    <Animated.View
                      key={`${it.product.id}::${it.variantId ?? ''}`}
                      entering={FadeInDown.duration(400).delay(200 + index * 50)}
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#13131A',
                        borderRadius: 20,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#2A2A3A',
                        alignItems: 'center',
                        gap: 14,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 4,
                      }}
                    >
                      {/* Product image thumbnail — LEFT */}
                      <View style={{ width: 90, height: 90, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1C1C28' }}>
                        <Image
                          source={{ uri: it.product.image }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Product info — CENTER, flex:1 */}
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={2}
                          style={{
                            color: '#F0F0F5',
                            fontSize: 16,
                            fontWeight: '700',
                            marginBottom: 6,
                            lineHeight: 22,
                          }}
                        >
                          {it.product.name}
                        </Text>
                        <Text
                          style={{
                            color: '#6C63FF',
                            fontSize: 18,
                            fontWeight: '800',
                            marginBottom: 10,
                            letterSpacing: 0.3,
                          }}
                        >
                          {formatCurrency(Number(it.product.price))}
                        </Text>

                        {/* Variant badges */}
                        {(it.variantSize || it.variantColor) ? (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {it.variantSize ? (
                              <View style={{ backgroundColor: 'rgba(108, 99, 255, 0.18)', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(108, 99, 255, 0.3)' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#6C63FF', letterSpacing: 0.3 }}>
                                  Cỡ {it.variantSize}
                                </Text>
                              </View>
                            ) : null}
                            {it.variantColor ? (
                              <View style={{ backgroundColor: '#1C1C28', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#2A2A3A' }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#8888A0', letterSpacing: 0.3 }}>
                                  {it.variantColor}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        ) : null}

                        {/* Inline quantity controls */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Pressable
                            onPress={() => {
                              const vid = it.variantId ?? null;
                              if (it.quantity <= 1) {
                                handleRemoveItem(it.product.id, vid, it.product.name);
                                return;
                              }
                              updateQuantity(it.product.id, vid, it.quantity - 1);
                            }}
                            style={{
                              backgroundColor: '#1C1C28',
                              borderRadius: 10,
                              width: 36,
                              height: 36,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: '#2A2A3A',
                            }}
                          >
                            <Text style={{ color: '#F0F0F5', fontWeight: '800', fontSize: 18 }}>−</Text>
                          </Pressable>
                          <Text
                            style={{
                              color: '#F0F0F5',
                              fontWeight: '800',
                              fontSize: 16,
                              minWidth: 28,
                              textAlign: 'center',
                            }}
                          >
                            {it.quantity}
                          </Text>
                          <Pressable
                            onPress={() => {
                              const vid = it.variantId ?? null;
                              updateQuantity(it.product.id, vid, it.quantity + 1);
                            }}
                            style={{
                              backgroundColor: '#6C63FF',
                              borderRadius: 10,
                              width: 36,
                              height: 36,
                              alignItems: 'center',
                              justifyContent: 'center',
                              shadowColor: '#6C63FF',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 6,
                              elevation: 2,
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>+</Text>
                          </Pressable>
                        </View>
                      </View>

                      {/* Delete icon — RIGHT */}
                      <Pressable
                        onPress={() => handleRemoveItem(it.product.id, it.variantId ?? null, it.product.name)}
                        style={{ 
                          padding: 10,
                          backgroundColor: 'rgba(255, 101, 132, 0.1)',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: 'rgba(255, 101, 132, 0.2)',
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF6584" />
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>

                {/* === PROMO CODE === */}
                <Animated.View entering={FadeInDown.duration(500).delay(400)}>
                  <View style={{ backgroundColor: '#13131A', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2A2A3A', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <Ionicons name="pricetag" size={20} color="#6C63FF" />
                      <Text style={{ fontSize: 17, fontWeight: '800', color: '#F0F0F5', letterSpacing: 0.3 }}>Mã giảm giá</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                      <View style={{ flex: 1 }}>
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
                          setAppliedPromo(normalized);
                          setPromoInput(normalized);
                        }}
                        style={{
                          backgroundColor: '#6C63FF',
                          borderRadius: 14,
                          paddingHorizontal: 20,
                          paddingVertical: 14,
                          shadowColor: '#6C63FF',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>Áp dụng</Text>
                      </Pressable>
                    </View>
                    {appliedPromo ? (
                      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, backgroundColor: 'rgba(62, 207, 142, 0.15)', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(62, 207, 142, 0.3)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="checkmark-circle" size={18} color="#3ECF8E" />
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#3ECF8E', letterSpacing: 0.3 }}>Đang áp dụng: {appliedPromo}</Text>
                        </View>
                        <Pressable onPress={() => setAppliedPromo(null)}>
                          <Text style={{ fontSize: 14, fontWeight: '800', color: '#3ECF8E' }}>Bỏ</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                </Animated.View>

                {/* === FLOATING ORDER SUMMARY PANEL === */}
                <Animated.View
                  entering={FadeInDown.duration(500).delay(500)}
                  style={{
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#2A2A3A',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 24,
                    elevation: 16,
                  }}
                >
                  {/* Premium background with gradient feel */}
                  <View style={{ backgroundColor: '#13131A', padding: 24 }}>
                    {/* Summary title */}
                    <Text style={{ color: '#F0F0F5', fontSize: 19, fontWeight: '800', marginBottom: 20, letterSpacing: 0.3 }}>
                      Tóm tắt đơn hàng
                    </Text>

                    {/* Subtotal row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#8888A0', fontSize: 15, fontWeight: '500' }}>Tạm tính</Text>
                      <Text style={{ color: '#F0F0F5', fontSize: 15, fontWeight: '700' }}>
                        {formatCurrency(subtotal)}
                      </Text>
                    </View>

                    {/* Shipping row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                      <Text style={{ color: '#8888A0', fontSize: 15, fontWeight: '500' }}>Phí vận chuyển</Text>
                      <Text style={{ color: '#3ECF8E', fontSize: 15, fontWeight: '700' }}>
                        {shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
                      </Text>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: '#2A2A3A', marginBottom: 20 }} />

                    {/* Total */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                      <Text style={{ color: '#F0F0F5', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 }}>Tổng cộng</Text>
                      <Text style={{ color: '#6C63FF', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 }}>
                        {formatCurrency(total)}
                      </Text>
                    </View>

                    {/* Checkout Button */}
                    <Pressable
                      onPress={handleCheckoutPress}
                      style={{
                        backgroundColor: '#6C63FF',
                        borderRadius: 18,
                        paddingVertical: 20,
                        alignItems: 'center',
                        shadowColor: '#6C63FF',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.5,
                        shadowRadius: 20,
                        elevation: 12,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.8 }}>
                        Tiến hành thanh toán
                      </Text>
                    </Pressable>
                  </View>
                </Animated.View>
              </>
            )}
          </View>
        </ScrollView>

        {/* === DELETE CONFIRMATION MODAL === */}
        {pendingDelete ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 24 }}>
            <View style={{ width: '100%', maxWidth: 420, borderWidth: 1, borderColor: '#2A2A3A', backgroundColor: '#13131A', padding: 20, borderRadius: 20 }}>
              <Text style={{ fontSize: 19, fontWeight: '700', color: '#F0F0F5' }}>{L.cart.removeConfirmTitle}</Text>
              <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 21, color: '#8888A0' }}>
                {L.cart.removeConfirmBody}
              </Text>
              <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '600', color: '#6C63FF' }}>
                {pendingDelete.productName}
              </Text>
              <View style={{ marginTop: 20, flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => setPendingDelete(null)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#2A2A3A',
                    backgroundColor: '#1C1C28',
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#F0F0F5' }}>{L.common.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={confirmDeleteItem}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 101, 132, 0.3)',
                    backgroundColor: 'rgba(255, 101, 132, 0.15)',
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#FF6584' }}>{L.common.delete}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </>
  );
}
