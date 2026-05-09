import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { setOnboardingSeen } from '~/lib/onboardingStorage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('~/assets/splash.png'),
    title: 'Chọn sản phẩm',
    subtitle: 'Tìm những món đồ trang sức đẹp nhất phù hợp với phong cách và ngân sách của bạn.',
  },
  {
    id: '2',
    image: require('~/assets/splash.png'),
    title: 'Thanh toán',
    subtitle: 'Thanh toán trong vài giây với quy trình bảo mật và phương thức ưa thích của bạn.',
  },
  {
    id: '3',
    image: require('~/assets/splash.png'),
    title: 'Nhận đơn hàng',
    subtitle: 'Theo dõi vận chuyển và nhận đơn hàng ngay tại nhà bạn.',
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
    <View className="flex-1 bg-bg-primary">
      <View className="px-6 pt-14">
        <TouchableOpacity className="self-end" onPress={finishOnboarding}>
          <Text className="text-base font-semibold text-text-secondary">Bỏ qua</Text>
        </TouchableOpacity>
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
          <View style={{ width }} className="items-center px-8 pt-4">
            <Image source={item.image} className="h-[280px] w-[280px]" resizeMode="contain" />
            <Text className="mt-8 text-center text-[34px] font-bold text-text-primary">
              {item.title}
            </Text>
            <Text className="mt-4 text-center text-base leading-6 text-text-secondary">
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View className="px-8 pb-10 pt-6">
        <View className="mb-8 flex-row items-center justify-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${currentIndex === index ? 'w-7 bg-accent' : 'w-2 bg-bg-elevated'}`}
            />
          ))}
        </View>

        <TouchableOpacity
          className="items-center rounded-full bg-accent py-4 shadow-lg"
          onPress={nextSlide}>
          <Text className="text-lg font-semibold text-white">
            {isLastSlide ? 'Bắt đầu' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
