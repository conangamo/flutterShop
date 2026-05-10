import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { setOnboardingSeen } from '~/lib/onboardingStorage';
import { Logo } from '~/components/Logo';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    title: 'Khám phá xu hướng mới',
    subtitle: 'Cập nhật những mẫu giày hot nhất thị trường.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80',
    title: 'Chất lượng tuyệt đối',
    subtitle: 'Cam kết giày chính hãng, kiểm định nghiêm ngặt.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80',
    title: 'Trải nghiệm mua sắm tối ưu',
    subtitle: 'Giao hàng thần tốc và đổi trả dễ dàng.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = useMemo(() => currentIndex === slides.length - 1, [currentIndex]);

  const finishOnboarding = async () => {
    await setOnboardingSeen(true);
    router.replace('/(tabs)');
  };

  const nextSlide = () => {
    if (isLastSlide) {
      void finishOnboarding();
      return;
    }

    const nextIndex = Math.min(currentIndex + 1, slides.length - 1);

    // Use offset-based scrolling to avoid FlatList scrollToIndex measurement failures.
    flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
    setCurrentIndex(nextIndex);
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      {/* Header with Logo and Skip Button */}
      <View className="px-6 pt-14 flex-row items-center justify-between">
        <Logo size="medium" showText={true} />
        <TouchableOpacity onPress={finishOnboarding}>
          <Text className="text-base font-semibold text-[#8888A0]">Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <View className="px-6 pt-2 pb-4">
        <Text className="text-sm font-medium text-[#6C63FF]">Bộ sưu tập giày cao cấp</Text>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        renderItem={({ item }) => (
          <View style={{ width }} className="items-center px-6 pt-8">
            {/* Image with Dark Overlay */}
            <View className="relative h-[340px] w-full overflow-hidden rounded-3xl border border-[#2A2A3A]">
              <ImageBackground
                source={{ uri: item.image }}
                className="h-full w-full"
                resizeMode="cover"
              >
                {/* Dark Overlay for Refined Dark Look */}
                <View className="absolute inset-0 bg-black/40" />
              </ImageBackground>
            </View>

            {/* Text Content */}
            <Text className="mt-10 text-center text-[32px] font-bold leading-tight text-[#F0F0F5]">
              {item.title}
            </Text>
            <Text className="mt-4 px-4 text-center text-base leading-6 text-[#8888A0]">
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View className="px-8 pb-10 pt-6">
        {/* Pagination Dots */}
        <View className="mb-8 flex-row items-center justify-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${currentIndex === index ? 'w-8 bg-[#6C63FF]' : 'w-2 bg-[#2A2A3A]'}`}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          className="items-center rounded-2xl bg-[#6C63FF] py-4 shadow-lg"
          onPress={nextSlide}
          activeOpacity={0.8}
        >
          <Text className="text-lg font-bold text-white">
            {isLastSlide ? 'Bắt đầu ngay' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
