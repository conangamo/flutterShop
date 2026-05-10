import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useToast } from '~/components/ToastProvider';
import { AppCard } from '~/components/ui/AppCard';
import { EmptyBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
import { adminListOrders, type AdminOrderSummary } from '~/lib/api/admin';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { OrderStatus } from '~/lib/types/orders';
import { formatCurrency, formatDate } from '~/lib/utils/formatters';

const STATUS_FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipped', label: 'Đang giao' },
  { id: 'delivered', label: 'Hoàn tất' },
  { id: 'cancelled', label: 'Đã huỷ' },
];

function statusBadge(status: OrderStatus) {
  switch (status) {
    case 'delivered':
      return { bg: 'rgba(52,211,153,0.18)', fg: '#6EE7B7' };
    case 'shipped':
      return { bg: 'rgba(251,191,36,0.18)', fg: '#FCD34D' };
    case 'processing':
      return { bg: 'rgba(108,99,255,0.22)', fg: '#A5B4FC' };
    case 'cancelled':
      return { bg: 'rgba(248,113,113,0.18)', fg: '#FCA5A5' };
    case 'pending':
    default:
      return { bg: 'rgba(148,163,184,0.15)', fg: '#CBD5E1' };
  }
}

export default function AdminOrdersScreen() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const { addToast } = useToast();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      try {
        const data = await adminListOrders(filter === 'all' ? undefined : filter);
        setOrders(data);
      } catch (e) {
        const msg = e instanceof ApiError ? resolveApiError(e, locale) : L.errors.homeLoadFailed;
        addToast('error', L.common.error, msg);
        setOrders([]);
      } finally {
        if (mode === 'initial') setLoading(false);
        else setRefreshing(false);
      }
    },
    [filter, locale, L.errors.homeLoadFailed, L.common.error, addToast]
  );

  useEffect(() => {
    if (Platform.OS === 'web') void load('initial');
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') void load('initial');
    }, [load])
  );

  return (
    <AdminScreenShell title="Đơn hàng" subtitle="Lọc trạng thái · mở chi tiết để đổi workflow">
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterInner}>
          {STATUS_FILTERS.map((opt) => {
            const active = filter === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFilter(opt.id)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 56 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={A.accent} />
          }
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <LoadingBlock label="Đang tải đơn hàng..." />
          ) : orders.length === 0 ? (
            <EmptyBlock title="Không có đơn" hint="Đổi bộ lọc hoặc chờ đơn mới." />
          ) : (
            <View style={{ gap: 12 }}>
              {orders.map((o) => {
                const badge = statusBadge(o.status);
                return (
                  <AppCard key={o.id} className="p-0">
                    <Pressable
                      onPress={() => router.push(`/admin/orders/${encodeURIComponent(o.id)}` as never)}
                      style={{ padding: 18 }}>
                      <View className="flex-row items-start justify-between">
                        <View>
                          <Text style={styles.meta}>Mã đơn</Text>
                          <Text style={styles.code}>#{o.code}</Text>
                          <Text style={styles.sub}>
                            {formatDate(o.date)} · {o.shipName}
                          </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgeTxt, { color: badge.fg }]}>{o.status}</Text>
                        </View>
                      </View>
                      <View className="mt-4 flex-row items-center justify-between border-t border-[#2A2A3A] pt-3">
                        <Text style={styles.sub}>{o.itemCount} sản phẩm</Text>
                        <Text style={styles.total}>{formatCurrency(o.total)}</Text>
                      </View>
                    </Pressable>
                  </AppCard>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: A.border,
    backgroundColor: A.surface,
  },
  filterInner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: A.border,
    backgroundColor: A.surfaceElevated,
  },
  chipActive: {
    borderColor: A.accent,
    backgroundColor: A.accentSoft,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: A.muted,
  },
  chipLabelActive: {
    color: A.accent,
  },
  meta: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: A.muted,
    textTransform: 'uppercase',
  },
  code: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '800',
    color: A.text,
  },
  sub: {
    marginTop: 6,
    fontSize: 12,
    color: A.muted,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  total: {
    fontSize: 17,
    fontWeight: '800',
    color: A.text,
  },
});
