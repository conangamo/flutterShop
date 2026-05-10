import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Image, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { formatCurrency, resolveImageUrl } from '~/lib/utils/formatters';
import { API_BASE_URL } from '~/lib/config/env';
import type { ProductSummary } from '~/lib/types/products';

type Props = {
  product: ProductSummary;
  cardWidth?: number;
};

function ProductCardBase({ product, cardWidth }: Props) {
  const router = useRouter();
  const bestStock = (product.variants || []).reduce((max, v) => Math.max(max, v.stock || 0), 0);
  
  // Resolve the image URL properly
  const imageUrl = resolveImageUrl(product.image, API_BASE_URL);
  
  // --- Press animation for premium interaction feedback ---
  const scaleValue = useSharedValue(1);
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));
  
  return (
    <Animated.View
      style={[animatedCardStyle]}
      className="w-[48%] bg-[#13131A] rounded-2xl border border-[#2A2A3A] overflow-hidden shadow-lg"
    >
      <Pressable
        onPress={() => router.push(`/product/${encodeURIComponent(product.id)}`)}
        onPressIn={() => { scaleValue.value = withSpring(0.97); }}
        onPressOut={() => { scaleValue.value = withSpring(1.0); }}
      >
        {/* === PRODUCT IMAGE SECTION === */}
        <View className="w-full aspect-[4/3] bg-[#0A0A0F] overflow-hidden rounded-b-2xl">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          {/* Discount Badge - Top Left */}
          {product.discount && (
            <View className="absolute top-2 left-2 bg-[#FF6584]/20 rounded-full px-2 py-1">
              <Text className="text-[#FF6584] text-[9px] font-bold">
                {product.discount}
              </Text>
            </View>
          )}
          
          {/* Stock Badge - Top Right */}
          <View className="absolute top-2 right-2 rounded-full px-2 py-1 bg-[#13131A]/90 border border-[#2A2A3A]/80">
            {bestStock > 0 ? (
              <Text className="text-[#3ECF8E] text-[9px] font-bold">
                Còn hàng
              </Text>
            ) : (
              <Text className="text-[#FF6584] text-[9px] font-bold">
                Hết hàng
              </Text>
            )}
          </View>
        </View>
        
        {/* === PRODUCT INFO SECTION === */}
        <View className="p-3 flex-col flex-1" style={{ minHeight: 100 }}>
          {/* Product Title - BULLETPROOF with fallback */}
          <Text
            numberOfLines={1}
            className="text-[#F0F0F5] text-[15px] font-bold mb-1 leading-tight"
          >
            {product.name || 'Giày Thể Thao Cao Cấp'}
          </Text>
          
          {/* Product Description - BULLETPROOF with fallback */}
          <Text
            numberOfLines={1}
            className="text-[#8888A0] text-[12px] mb-2"
          >
            {product.description || 'Sản phẩm chất lượng cao'}
          </Text>
          
          {/* Price & Rating - Bottom Aligned */}
          <View className="mt-auto">
            {/* Price - BULLETPROOF with fallback */}
            <Text className="text-[#6C63FF] text-[16px] font-bold mb-1">
              {product.price ? formatCurrency(product.price) : 'Đang cập nhật'}
            </Text>
            
            {/* Rating Row - Minimalist Shopee Style */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text className="text-[#8888A0] text-[11px] font-medium">
                {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.reviews || 0})
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const ProductCard = memo(ProductCardBase);
