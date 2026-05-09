import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useToast } from '~/components/ToastProvider';

import { Button } from '~/components/Button';
import { useCart } from '~/features/cart/hooks/useCart';
import { fetchProductById } from '~/lib/api/catalog';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { Product } from '~/lib/types/models';
import type { ProductDetail, ProductVariant } from '~/lib/types/products';
import { formatCurrency } from '~/lib/utils/formatters';

const SHOE_SIZE_GUIDE: { eu: string; us: string; cm: string }[] = [
  { eu: '36', us: '5.5', cm: '22.5' },
  { eu: '37', us: '6', cm: '23.0' },
  { eu: '38', us: '7', cm: '24.0' },
  { eu: '39', us: '7.5', cm: '24.5' },
  { eu: '40', us: '8', cm: '25.0' },
  { eu: '41', us: '8.5', cm: '25.5' },
  { eu: '42', us: '9', cm: '26.0' },
  { eu: '43', us: '10', cm: '27.0' },
];

function uniqueValues(variants: ProductVariant[], key: 'size' | 'color'): string[] {
  const set = new Set<string>();
  for (const v of variants) {
    const value = v[key];
    if (value) set.add(value);
  }
  return Array.from(set);
}

function findVariantBySelection(
  variants: ProductVariant[],
  size: string | null,
  color: string | null
): ProductVariant | undefined {
  if (variants.length === 0) return undefined;
  const exact = variants.find((v) => {
    const sizeOk = size == null || (v.size ?? null) === size;
    const colorOk = color == null || (v.color ?? null) === color;
    return sizeOk && colorOk;
  });
  if (exact) return exact;
  return variants.find((v) => {
    const sizeOk = size == null || (v.size ?? null) === size;
    const colorOk = color == null || (v.color ?? null) === color;
    return sizeOk && colorOk;
  }) ?? variants.find((v) => v.stock > 0) ?? variants[0];
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const resolvedProductId = Array.isArray(params.id) ? params.id[0] : params.id;
  const productId = resolvedProductId ?? '';

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const load = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const p = await fetchProductById(productId);
      setProduct(p);
      const firstAvailable = p.variants.find((v) => v.stock > 0) ?? p.variants[0];
      setSelectedSize(firstAvailable?.size ?? null);
      setSelectedColor(firstAvailable?.color ?? null);
      setActiveImageIndex(0);
      setQuantity(1);
    } catch (e) {
      const msg = e instanceof ApiError ? resolveApiError(e, locale) : L.errors.productLoadFailed;
      setLoadError(msg);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId, locale, L.errors.productLoadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const sizes = useMemo(
    () => (product ? uniqueValues(product.variants, 'size') : []),
    [product]
  );
  const colors = useMemo(
    () => (product ? uniqueValues(product.variants, 'color') : []),
    [product]
  );

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    return (
      findVariantBySelection(product.variants, selectedSize, selectedColor) ??
      product.variants[0]
    );
  }, [product, selectedSize, selectedColor]);

  const galleryImages = useMemo(() => {
    if (!product) return [] as string[];
    const list = (product.images ?? []).slice();
    if (product.image && !list.includes(product.image)) list.unshift(product.image);
    if (selectedVariant?.image && !list.includes(selectedVariant.image)) {
      list.unshift(selectedVariant.image);
    }
    return list;
  }, [product, selectedVariant]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chi tiết sản phẩm', headerShown: false }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0F' }}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </>
    );
  }

  if (loadError || !product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chi tiết sản phẩm', headerShown: false }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0F', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#F0F0F5' }}>Không tìm thấy sản phẩm</Text>
          <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#8888A0' }}>
            {loadError ?? 'Sản phẩm bạn đang tìm không tồn tại.'}
          </Text>
        </View>
      </>
    );
  }

  const price = selectedVariant?.price ?? product.price;
  const heroUri =
    galleryImages[activeImageIndex] ?? selectedVariant?.image ?? product.image;
  const totalStock = selectedVariant?.stock ?? product.totalStock ?? 0;
  const isOutOfStock = totalStock <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return false;
    const snapshot: Product = {
      ...product,
      price: selectedVariant.price,
      image: selectedVariant.image ?? product.image,
    };
    addToCart(snapshot, quantity, selectedVariant.id, {
      size: selectedVariant.size ?? null,
      color: selectedVariant.color ?? null,
    });
    addToast('success', L.common.success, L.cart.addSuccess);
    return true;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (!added) return;
    router.push('/checkout');
  };

  return (
    <>
      <Stack.Screen options={{ title: product.name, headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
          {/* === ZONE 1: Full-bleed Product Image === */}
          <View style={{ height: 400, minHeight: 320, width: '100%', position: 'relative' }}>
            <Image
              source={{ uri: heroUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            
            {/* Gradient overlay at the bottom of the image for blending */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                backgroundColor: 'transparent',
              }}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(10, 10, 15, 0)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(10, 10, 15, 0.3)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(10, 10, 15, 0.6)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(10, 10, 15, 0.9)' }} />
            </View>

            {/* Gallery thumbnails overlay */}
            {galleryImages.length > 1 ? (
              <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                  {galleryImages.map((img, idx) => (
                    <Pressable
                      key={`${img}-${idx}`}
                      onPress={() => setActiveImageIndex(idx)}
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 2,
                        borderColor: idx === activeImageIndex ? '#6C63FF' : 'transparent',
                      }}
                    >
                      <Image source={{ uri: img }} style={{ width: 56, height: 56 }} resizeMode="cover" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          {/* === ZONE 2: Info Panel (overlaps image via negative margin) === */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(150)}
            style={{
              backgroundColor: '#13131A', // bg-surface
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              marginTop: -28, // Overlap the image slightly
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 40,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: '#2A2A3A', // semantic-border
            }}
          >
            {/* === PRODUCT NAME & BRAND === */}
            <View style={{ marginBottom: 12 }}>
              {product.brand ? (
                <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 2, color: '#6C63FF', textTransform: 'uppercase', marginBottom: 6 }}>
                  {product.brand}
                </Text>
              ) : null}
              <Text
                style={{
                  color: '#F0F0F5', // text-primary
                  fontSize: 24,
                  fontWeight: '800',
                  letterSpacing: -0.5,
                }}
              >
                {product.name}
              </Text>
            </View>

            {/* === PRICE ROW === */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#6C63FF', fontSize: 28, fontWeight: '800' }}>
                {formatCurrency(price)}
              </Text>
              {product.compareAtPrice && product.compareAtPrice > price ? (
                <Text
                  style={{
                    color: '#8888A0',
                    fontSize: 16,
                    textDecorationLine: 'line-through',
                    marginLeft: 10,
                  }}
                >
                  {formatCurrency(product.compareAtPrice)}
                </Text>
              ) : null}
              {product.discount ? (
                <View style={{ marginLeft: 10, backgroundColor: 'rgba(255, 101, 132, 0.15)', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#FF6584', fontSize: 11, fontWeight: '700' }}>{product.discount}</Text>
                </View>
              ) : null}
            </View>

            {/* === RATING & STOCK === */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text style={{ color: '#8888A0', fontSize: 13, fontWeight: '600' }}>
                  {product.rating.toFixed(1)} ({product.reviews})
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: isOutOfStock ? 'rgba(255, 101, 132, 0.15)' : 'rgba(62, 207, 142, 0.15)',
                  borderRadius: 9999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: isOutOfStock ? '#FF6584' : '#3ECF8E',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {isOutOfStock ? 'Hết hàng' : `Còn ${totalStock}`}
                </Text>
              </View>
            </View>

            {/* === SIZE SELECTION === */}
            {sizes.length > 0 ? (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#F0F0F5', fontSize: 15, fontWeight: '700' }}>Cỡ (EU)</Text>
                  <Pressable onPress={() => setShowSizeGuide((v) => !v)}>
                    <Text style={{ color: '#6C63FF', fontSize: 13, fontWeight: '600' }}>
                      {showSizeGuide ? 'Ẩn bảng' : 'Bảng size'}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sizes.map((sz) => {
                    const variantForSize = product.variants.find(
                      (v) => v.size === sz && (selectedColor == null || v.color === selectedColor)
                    );
                    const isAvailable = (variantForSize?.stock ?? 0) > 0;
                    const isSelected = selectedSize === sz;
                    return (
                      <Pressable
                        key={sz}
                        onPress={() => {
                          const next = product.variants.find(
                            (v) =>
                              v.size === sz &&
                              (selectedColor == null || v.color === selectedColor) &&
                              v.stock > 0
                          ) ?? product.variants.find((v) => v.size === sz && v.stock > 0);
                          setSelectedSize(sz);
                          if (next?.color) setSelectedColor(next.color);
                        }}
                        disabled={!isAvailable}
                        style={{
                          minWidth: 52,
                          alignItems: 'center',
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
                          backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.15)' : '#1C1C28',
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          opacity: isAvailable ? 1 : 0.4,
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#6C63FF' : '#F0F0F5' }}>
                          {sz}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {showSizeGuide ? (
                  <View style={{ marginTop: 16, backgroundColor: '#1C1C28', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A3A' }}>
                    <View style={{ flexDirection: 'row', paddingBottom: 8 }}>
                      <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#6C63FF', textTransform: 'uppercase' }}>EU</Text>
                      <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#6C63FF', textTransform: 'uppercase' }}>US</Text>
                      <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#6C63FF', textTransform: 'uppercase' }}>CM</Text>
                    </View>
                    {SHOE_SIZE_GUIDE.map((row) => (
                      <View key={row.eu} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                        <Text style={{ flex: 1, fontSize: 13, color: '#F0F0F5' }}>{row.eu}</Text>
                        <Text style={{ flex: 1, fontSize: 13, color: '#F0F0F5' }}>{row.us}</Text>
                        <Text style={{ flex: 1, fontSize: 13, color: '#F0F0F5' }}>{row.cm}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* === COLOR SELECTION === */}
            {colors.length > 0 ? (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#F0F0F5', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>Màu sắc</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {colors.map((c) => {
                    const variantForColor = product.variants.find(
                      (v) => v.color === c && (selectedSize == null || v.size === selectedSize)
                    );
                    const isAvailable = (variantForColor?.stock ?? 0) > 0;
                    const isSelected = selectedColor === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => {
                          const next = product.variants.find(
                            (v) =>
                              v.color === c &&
                              (selectedSize == null || v.size === selectedSize) &&
                              v.stock > 0
                          ) ?? product.variants.find((v) => v.color === c && v.stock > 0);
                          setSelectedColor(c);
                          if (next?.size) setSelectedSize(next.size);
                        }}
                        disabled={!isAvailable}
                        style={{
                          borderRadius: 9999,
                          borderWidth: 1,
                          borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
                          backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.15)' : '#1C1C28',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          opacity: isAvailable ? 1 : 0.4,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: isSelected ? '#6C63FF' : '#F0F0F5' }}>
                          {c}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* === QUANTITY SELECTOR === */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: '#8888A0', fontSize: 13, fontWeight: '600', marginRight: 'auto' }}>
                Số lượng
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1C1C28',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2A3A',
                  overflow: 'hidden',
                }}
              >
                <Pressable
                  onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                  style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                >
                  <Text style={{ color: '#F0F0F5', fontSize: 18, fontWeight: '700' }}>−</Text>
                </Pressable>
                <Text
                  style={{
                    color: '#F0F0F5',
                    fontSize: 16,
                    fontWeight: '700',
                    minWidth: 36,
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </Text>
                <Pressable
                  onPress={() =>
                    setQuantity((current) => Math.min(totalStock || current, current + 1))
                  }
                  disabled={isOutOfStock}
                  style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                >
                  <Text style={{ color: '#6C63FF', fontSize: 18, fontWeight: '700' }}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* === DESCRIPTION SECTION === */}
            <View style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View
                  style={{
                    width: 4,
                    height: 20,
                    backgroundColor: '#6C63FF',
                    borderRadius: 2,
                    marginRight: 10,
                  }}
                />
                <Text style={{ color: '#F0F0F5', fontSize: 16, fontWeight: '700' }}>
                  Mô tả
                </Text>
              </View>
              <Text style={{ color: '#8888A0', fontSize: 14, lineHeight: 22 }}>
                {product.description}
              </Text>
            </View>

            {/* === HIGHLIGHTS === */}
            {(product.usageType || product.season || product.upperMaterial || product.soleMaterial) ? (
              <View style={{ marginBottom: 28 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View
                    style={{
                      width: 4,
                      height: 20,
                      backgroundColor: '#6C63FF',
                      borderRadius: 2,
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ color: '#F0F0F5', fontSize: 16, fontWeight: '700' }}>
                    Đặc điểm
                  </Text>
                </View>
                <View style={{ gap: 6 }}>
                  {product.usageType ? (
                    <Text style={{ color: '#8888A0', fontSize: 13 }}>• Phù hợp: {product.usageType}</Text>
                  ) : null}
                  {product.season ? (
                    <Text style={{ color: '#8888A0', fontSize: 13 }}>• Mùa: {product.season}</Text>
                  ) : null}
                  {product.upperMaterial ? (
                    <Text style={{ color: '#8888A0', fontSize: 13 }}>
                      • Chất liệu thân: {product.upperMaterial}
                    </Text>
                  ) : null}
                  {product.soleMaterial ? (
                    <Text style={{ color: '#8888A0', fontSize: 13 }}>• Đế: {product.soleMaterial}</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* === ADD TO CART CTA BUTTON === */}
            <Pressable
              onPress={handleAddToCart}
              disabled={isOutOfStock || !selectedVariant}
              style={{
                backgroundColor: isOutOfStock ? '#444455' : '#6C63FF', // accent
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
                elevation: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 17,
                  fontWeight: '800',
                  letterSpacing: 0.5,
                }}
              >
                {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
              </Text>
            </Pressable>

            {/* === BUY NOW BUTTON === */}
            <Pressable
              onPress={handleBuyNow}
              disabled={isOutOfStock || !selectedVariant}
              style={{
                backgroundColor: 'transparent',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isOutOfStock ? '#444455' : '#6C63FF',
                paddingVertical: 18,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: isOutOfStock ? '#444455' : '#6C63FF',
                  fontSize: 17,
                  fontWeight: '800',
                  letterSpacing: 0.5,
                }}
              >
                {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}
