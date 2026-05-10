import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '~/components/Button';

export function LoadingBlock({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <View className="mt-8 items-center rounded-[24px] border border-semantic-border bg-bg-surface px-6 py-10">
      <ActivityIndicator size="large" color="#6C63FF" />
      <Text className="mt-3 text-[14px] text-text-secondary">{label}</Text>
    </View>
  );
}

export function EmptyBlock({
  title,
  hint,
  cta,
  onPress,
}: {
  title: string;
  hint: string;
  cta?: string;
  onPress?: () => void;
}) {
  return (
    <View className="mt-8 items-center rounded-[24px] border border-semantic-border bg-bg-surface px-6 py-10">
      <Ionicons name="search-outline" size={28} color="#8888A0" />
      <Text className="mt-3 text-[16px] font-semibold text-text-primary">{title}</Text>
      <Text className="mt-1 text-center text-[13px] leading-[20px] text-text-secondary">{hint}</Text>
      {cta && onPress ? (
        <Pressable onPress={onPress} className="mt-4">
          <Button title={cta} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View className="mt-8 rounded-[24px] border border-accent-coral/25 bg-accent-coral/10 px-6 py-8">
      <Text className="text-center text-[15px] font-semibold text-accent-coral">Có lỗi xảy ra</Text>
      <Text className="mt-2 text-center text-[13px] text-text-primary">{message}</Text>
      {onRetry ? (
        <View className="mt-4">
          <Button title="Thử lại" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
