import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
};

export function Logo({ size = 'medium', showText = true }: LogoProps) {
  const dimensions = {
    small: { container: 32, icon: 18, text: 20 },
    medium: { container: 40, icon: 24, text: 28 },
    large: { container: 56, icon: 32, text: 36 },
  };

  const config = dimensions[size];

  return (
    <View className="flex-row items-center gap-3">
      {/* Shoe Icon Container */}
      <View
        style={{
          height: config.container,
          width: config.container,
        }}
        className="items-center justify-center rounded-xl bg-[#6C63FF] shadow-lg"
      >
        <MaterialCommunityIcons name="shoe-sneaker" size={config.icon} color="#FFFFFF" />
      </View>

      {/* ShoeStore Text */}
      {showText && (
        <Text
          style={{ fontSize: config.text }}
          className="font-bold text-[#F0F0F5]"
        >
          ShoeStore
        </Text>
      )}
    </View>
  );
}
