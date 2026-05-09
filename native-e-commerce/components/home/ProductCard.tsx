import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Image, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { formatCurrency } from '~/lib/utils/formatters';
import type { ProductSummary } from '~/lib/types/products';

type Props = {
  product: ProductSummary;
  cardWidth?: number;
};

function ProductCardBase({ product, cardWidth }: Props) {
  const router = useRouter();
  const bestStock = product.variants.reduce((max, v) => Math.max(max, v.stock), 0);
  
  // --- Press animation (purely visual feedback) ---
  const scaleValue = useSharedValue(1);
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));
  
  return (
    // Outer Animated wrapper — handles the scale spring animation
    <Animated.View
      style={[
        animatedCardStyle,
        {
          width: cardWidth || undefined,
          borderRadius: 24, // rounded-3xl for premium feel
          // Elegant shadow — soft, deep, floating effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.45,
          shadowRadius: 20,
          elevation: 16, // Android shadow
          marginBottom: 20,
        },
      ]}
    >
      {/* Pressable wraps the entire card */}
      <Pressable
        onPress={() => router.push(`/product/${encodeURIComponent(product.id)}`)}
        onPressIn={() => { scaleValue.value = withSpring(0.96); }}
        onPressOut={() => { scaleValue.value = withSpring(1.0); }}
        style={{
          backgroundColor: '#13131A', // bg-surface
          borderRadius: 24, // rounded-3xl
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#2A2A3A', // semantic-border
        }}
      >
        {/* === IMAGE ZONE: 65% of the card's visual height === */}
        <View style={{ aspectRatio: 0.85, width: '100%' }}>
          <Image
            source={{ uri: product.image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          
          {/* CONDITIONAL discount badge — render only if discount exists */}
          {product.discount && (
            <View
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: '#FF6584', // accent-coral
                borderRadius: 9999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                shadowColor: '#FF6584',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}
              >
                {product.discount}
              </Text>
            </View>
          )}
          
          {/* Stock badge — TOP RIGHT */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(19, 19, 26, 0.85)', // bg-surface with opacity
              borderRadius: 9999,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(42, 42, 58, 0.6)',
            }}
          >
            {bestStock > 0 ? (
              <Text style={{ color: '#3ECF8E', fontSize: 11, fontWeight: '700', letterSpacing: 0.2 }}>
                Còn hàng
              </Text>
            ) : (
              <Text style={{ color: '#FF6584', fontSize: 11, fontWeight: '700', letterSpacing: 0.2 }}>
                Hết hàng
              </Text>
            )}
          </View>
        </View>
        
        {/* === INFO ZONE: Product name, price, rating === */}
        <View style={{ padding: 16, gap: 8 }}>
          {/* Product Name — single line, ellipsis overflow */}
          <Text
            numberOfLines={1}
            style={{
              color: '#F0F0F5', // text-primary
              fontSize: 16,
              fontWeight: '700',
              letterSpacing: 0.2,
            }}
          >
            {product.name}
          </Text>
          
          {/* Description — single line */}
          <Text
            numberOfLines={1}
            style={{
              color: '#8888A0', // text-secondary
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {product.description}
          </Text>
          
          {/* Price Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text
              style={{
                color: '#6C63FF', // accent
                fontSize: 19,
                fontWeight: '800',
                letterSpacing: 0.3,
              }}
            >
              {formatCurrency(product.price)}
            </Text>
          </View>
          
          {/* Rating Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Ionicons name="star" size={15} color="#FFC107" />
            <Ionicons name="star" size={15} color="#FFC107" />
            <Ionicons name="star" size={15} color="#FFC107" />
            <Ionicons name="star" size={15} color="#FFC107" />
            <Text style={{ color: '#8888A0', fontSize: 13, marginLeft: 4, fontWeight: '500' }}>
              {product.rating.toFixed(1)} ({product.reviews})
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const ProductCard = memo(ProductCardBase);
