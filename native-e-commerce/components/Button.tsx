import { forwardRef } from 'react';
import { Text, TouchableOpacityProps, View, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type ButtonProps = {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', loading = false, disabled, ...touchableProps }, ref) => {
    const isDisabled = disabled || loading;
    
    // --- Press animation (purely visual feedback) ---
    const scaleValue = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));
    
    // Determine styles based on variant
    const getVariantStyles = () => {
      switch (variant) {
        case 'secondary':
          return {
            container: {
              backgroundColor: '#1C1C28', // bg-elevated
              borderWidth: 1,
              borderColor: '#2A2A3A', // semantic-border
              borderRadius: 16, // rounded-xl for modern feel
              paddingVertical: 16,
              paddingHorizontal: 28,
            },
            text: {
              color: '#F0F0F5', // text-primary
              fontSize: 16,
              fontWeight: '700' as const,
              letterSpacing: 0.6,
            },
            shadow: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            },
          };
        case 'ghost':
          return {
            container: {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: 'rgba(108, 99, 255, 0.40)',
              borderRadius: 16, // rounded-xl
              paddingVertical: 16,
              paddingHorizontal: 28,
            },
            text: {
              color: '#6C63FF', // accent
              fontSize: 16,
              fontWeight: '700' as const,
              letterSpacing: 0.6,
            },
            shadow: {},
          };
        case 'danger':
          return {
            container: {
              backgroundColor: '#B91C1C',
              borderRadius: 16, // rounded-xl
              paddingVertical: 18,
              paddingHorizontal: 28,
            },
            text: {
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: '800' as const,
              letterSpacing: 0.8,
            },
            shadow: {
              shadowColor: '#B91C1C',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 10,
            },
          };
        case 'primary':
        default:
          return {
            container: {
              backgroundColor: '#6C63FF', // accent
              borderRadius: 16, // rounded-xl for chunky, modern feel
              paddingVertical: 18,
              paddingHorizontal: 28,
            },
            text: {
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: '800' as const,
              letterSpacing: 0.8,
            },
            shadow: {
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 10,
            },
          };
      }
    };
    
    const variantStyles = getVariantStyles();
    
    return (
      <Animated.View
        style={[
          animatedStyle,
          variantStyles.shadow,
          { opacity: isDisabled ? 0.6 : 1 },
        ]}
      >
        <Pressable
          ref={ref}
          {...touchableProps}
          disabled={isDisabled}
          onPressIn={() => { scaleValue.value = withSpring(0.97); }}
          onPressOut={() => { scaleValue.value = withSpring(1.0); }}
          style={[
            variantStyles.container,
            { alignItems: 'center', justifyContent: 'center', minHeight: 56 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[variantStyles.text, { textAlign: 'center' }]}>
              {title}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';
