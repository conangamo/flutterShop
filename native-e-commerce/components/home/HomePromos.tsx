import { Feather, Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export function HeroPromoBanner() {
  return (
    <>
      <View className="mt-4 overflow-hidden rounded-2xl bg-accent-coral pl-4 pt-5">
        <View className="flex-row items-end justify-between">
          <View className="pb-6">
            <Text className="text-[18px] font-bold text-white">GIẢM 50-40%</Text>
            <Text className="mt-1 text-[14px] text-white/90">Áp dụng cho sản phẩm</Text>
            <Text className="mt-1 text-[14px] text-white/90">Tất cả màu sắc</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              className="mt-3 flex-row items-center gap-2 rounded-xl border border-white px-3 py-[7px]">
              <Text className="text-[14px] font-semibold text-white">Mua ngay</Text>
              <Feather name="arrow-right" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=60',
            }}
            className="h-[185px] w-[165px]"
            resizeMode="cover"
          />
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-center gap-[6px]">
        <View className="h-[8px] w-[8px] rounded-full bg-accent-coral/40" />
        <View className="h-[10px] w-[10px] rounded-full bg-accent-coral" />
        <View className="h-[8px] w-[8px] rounded-full bg-text-muted" />
      </View>
    </>
  );
}

export function SpecialOffersCard() {
  return (
    <View className="mt-5 flex-row items-center gap-4 rounded-2xl bg-bg-surface border border-semantic-border p-4">
      <View className="h-[60px] w-[70px] items-center justify-center rounded-xl bg-accent-coral/10">
        <Ionicons name="pricetag" size={26} color="#FF6584" />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-text-primary">Ưu đãi đặc biệt</Text>
        <Text className="mt-1 text-[12px] leading-[16px] text-text-secondary">
          Chúng tôi đảm bảo bạn nhận được ưu đãi tốt nhất với giá cả hợp lý
        </Text>
      </View>
    </View>
  );
}

export function FlatAndHeelsCard() {
  return (
    <View className="mt-4 flex-row items-center gap-4 rounded-2xl bg-bg-surface border border-semantic-border p-3">
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=60',
        }}
        className="h-[90px] w-[90px] rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-[17px] font-semibold text-text-primary">Giày bệt & cao gót</Text>
        <Text className="mt-1 text-[12px] text-text-secondary">Cơ hội nhận thưởng hấp dẫn</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-2 self-start rounded-xl bg-accent-coral px-3 py-[7px]">
          <Text className="text-[12px] font-semibold text-white">Xem ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function MidSeasonBanner() {
  return (
    <Image
      source={{
        uri: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1100&q=60',
      }}
      className="mt-5 h-[160px] w-full rounded-2xl"
      resizeMode="cover"
    />
  );
}

export function NewArrivalsCard() {
  return (
    <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-bg-surface border border-semantic-border px-4 py-4">
      <View>
        <Text className="text-[16px] font-semibold text-text-primary">Hàng mới về</Text>
        <Text className="text-[12px] text-text-secondary">Bộ sưu tập Hè &apos;25</Text>
      </View>
      <TouchableOpacity activeOpacity={0.85} className="rounded-xl bg-accent-coral px-3 py-[7px]">
        <Text className="text-[12px] font-semibold text-white">Xem tất cả</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SponsoredCard() {
  return (
    <View className="mt-5">
      <Text className="text-[16px] font-semibold text-text-primary">Tài trợ</Text>
      <View className="mt-3 overflow-hidden rounded-2xl bg-bg-surface border border-semantic-border">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=1200&q=60',
          }}
          className="h-[260px] w-full"
          resizeMode="cover"
        />
        <View className="flex-row items-center justify-between bg-bg-elevated px-4 py-3">
          <Text className="text-[16px] font-semibold text-text-primary">Giảm đến 50%</Text>
          <Feather name="chevron-right" size={18} color="#F0F0F5" />
        </View>
      </View>
    </View>
  );
}
