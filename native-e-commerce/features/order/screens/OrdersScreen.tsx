import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ApiError } from '~/lib/api/errors';
import { fetchOrderSummaries } from '~/lib/api/orders';
import { getAppLocale, strings } from '~/lib/i18n';
import type { OrderStatus, OrderSummary } from '~/lib/types/orders';
import { formatCurrency, formatDate } from '~/lib/utils/formatters';

type OrderFilter = 'all' | OrderStatus;

function statusBadge(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xử lý', bg: '#FFF4E6', border: '#FFB84D', text: '#CC7A00' };
    case 'processing':
      return { label: 'Đang xử lý', bg: '#E6E6FF', border: '#9999FF', text: '#4D4DCC' };
    case 'shipped':
      return { label: 'Đang giao', bg: '#FFF9E6', border: '#FFD966', text: '#CC9900' };
    case 'delivered':
      return { label: 'Đã giao', bg: '#E6F7ED', border: '#66CC8A', text: '#00994D' };
    case 'cancelled':
      return { label: 'Đã hủy', bg: '#F5F5F5', border: '#CCCCCC', text: '#666666' };
    default:
      return { label: status, bg: '#F5F5F5', border: '#CCCCCC', text: '#999999' };
  }
}

export default function OrdersScreen() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const statusFilters = useMemo((): { label: string; value: OrderFilter }[] => {
    const o = L.orders; // Đã tối ưu đoạn này dùng L có sẵn
    return [
      { label: o.filterAll, value: 'all' },
      { label: o.filterPending, value: 'pending' },
      { label: o.filterProcessing, value: 'processing' },
      { label: o.filterShipped, value: 'shipped' },
      { label: o.filterDelivered, value: 'delivered' },
      { label: o.filterCancelled, value: 'cancelled' },
    ];
  }, [L]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [needLogin, setNeedLogin] = useState(false);

  // 1. ĐÃ SỬA: Đưa logic gọi API vào useEffect và dùng isMounted
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setNeedLogin(false);
      try {
        const data = await fetchOrderSummaries(activeFilter === 'all' ? undefined : activeFilter);
        if (isMounted) setOrders(data);
      } catch (e) {
        if (isMounted) {
          setOrders([]);
          if (e instanceof ApiError && e.status === 401) setNeedLogin(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  const filteredOrders = useMemo(() => orders, [orders]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="flex-1 bg-bg-primary">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 pb-7 pt-2">
            <Text className="text-[13px] uppercase tracking-[2.5px] text-accent">Lịch sử</Text>
            <Text className="mt-2 text-[30px] font-bold text-text-primary">Đơn hàng của tôi</Text>

            {needLogin && (
              <View className="mt-4 rounded-[20px] bg-accent/10 border border-accent/20 p-4">
                <Text className="text-[14px] text-text-primary">{L.orders.loginBanner}</Text>
                <Pressable
                  className="mt-3 self-start rounded-full bg-accent px-4 py-2"
                  onPress={() => router.push('/(auth)/login')}>
                  <Text className="text-[13px] font-semibold text-white">{L.orders.loginCta}</Text>
                </Pressable>
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-grow-0"
              contentContainerStyle={{ paddingHorizontal: 0, gap: 8, paddingVertical: 14 }}>
              <View className="flex-row gap-2">
                {statusFilters.map((filter) => {
                  const active = filter.value === activeFilter;
                  return (
                    <Pressable
                      key={filter.value}
                      onPress={() => setActiveFilter(filter.value)}
                      className={`rounded-full border px-5 py-2 ${
                        active ? 'border-accent bg-accent' : 'border-semantic-border bg-bg-elevated'
                      }`}>
                      <Text
                        className={`text-[13px] font-semibold ${
                          active ? 'text-white' : 'text-text-secondary'
                        }`}>
                        {filter.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* 2. ĐÃ SỬA: Tách các trường hợp Render thành các khối riêng biệt (bỏ ba ngôi lồng nhau) */}

            {/* Trường hợp 1: Đang tải dữ liệu */}
            {isLoading && (
              <View className="mt-5 gap-3">
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}

            {/* Trường hợp 2: Tải xong nhưng không có dữ liệu */}
            {!isLoading && filteredOrders.length === 0 && (
              <View className="mt-5 items-center rounded-[24px] bg-bg-surface border border-semantic-border px-6 py-10">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-bg-elevated border border-semantic-border mb-6">
                  <Ionicons name="file-tray-outline" size={32} color="#6C63FF" />
                </View>
                <Text className="text-[20px] font-bold text-text-primary mb-2 text-center">
                  {L.empty.ordersTitle}
                </Text>
                <Text className="text-center text-[14px] leading-[20px] text-text-secondary mb-8">
                  {L.empty.ordersHint}
                </Text>
                <Pressable
                  className="rounded-2xl bg-accent px-8 py-3.5"
                  onPress={() => router.push('/(tabs)')}>
                  <Text className="text-[15px] font-bold text-white">
                    {L.empty.ordersBackShop}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Trường hợp 3: Tải xong và có dữ liệu */}
            {!isLoading && filteredOrders.length > 0 && (
              <View className="mt-5 gap-3">
                {filteredOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    onPress={() => router.push(`/order/${encodeURIComponent(order.id)}`)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function OrderCard({ order, index, onPress }: { order: OrderSummary; index: number; onPress: () => void }) {
  const badge = statusBadge(order.status);

  return (
    <Animated.View
      entering={FadeInDown.duration(380).delay(index * 60)}
      className="mb-3 rounded-2xl bg-bg-surface border border-semantic-border overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Pressable onPress={onPress} className="px-5 py-4">
        {/* ── ROW 1: Order ID + Status Badge ── */}
        <View className="flex-row items-center justify-between mb-3" style={{ gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-0.5">
              Đơn hàng
            </Text>
            <Text className="text-text-primary text-[15px] font-bold" numberOfLines={1}>
              #{order.code}
            </Text>
          </View>
          <View 
            style={{
              alignSelf: 'flex-start',
              backgroundColor: badge.bg,
              borderColor: badge.border,
              borderWidth: 1,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: badge.text }}>
              {badge.label}
            </Text>
          </View>
        </View>

        {/* ── DIVIDER ── */}
        <View className="h-px bg-semantic-border mb-3" />

        {/* ── ROW 2: Date + Item Count + Total ── */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View>
              <Text className="text-text-secondary text-xs mb-0.5">Ngày</Text>
              <Text className="text-text-primary text-sm font-semibold">
                {formatDate(order.date)}
              </Text>
            </View>
            <View>
              <Text className="text-text-secondary text-xs mb-0.5">Sản phẩm</Text>
              <Text className="text-text-primary text-sm font-semibold">
                {order.itemCount}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-text-secondary text-xs mb-0.5">Tổng</Text>
            <Text className="text-accent text-base font-extrabold">
              {formatCurrency(order.total)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function SkeletonCard() {
  return (
    <View className="mx-4 rounded-2xl bg-bg-surface border border-semantic-border p-4">
      <View className="h-4 w-[120px] rounded bg-bg-elevated" />
      <View className="mt-3 h-3 w-[90px] rounded bg-bg-elevated" />
      <View className="mt-4 h-px bg-semantic-border" />
      <View className="mt-4 h-3 w-[140px] rounded bg-bg-elevated" />
    </View>
  );
}
