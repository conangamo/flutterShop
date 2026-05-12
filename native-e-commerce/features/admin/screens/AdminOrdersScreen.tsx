import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AdminLayout } from '~/components/admin/AdminLayout';
import { AdminTable } from '~/components/admin/AdminTable';
import { AdminStatusBadge } from '~/components/admin/AdminStatusBadge';
import { useToast } from '~/components/ToastProvider';
import { AppCard } from '~/components/ui/AppCard';
import { EmptyBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { adminListOrders, type AdminOrderSummary } from '~/lib/api/admin';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { OrderStatus } from '~/lib/types/orders';
import { formatCurrency, formatDate } from '~/lib/utils/formatters';

const STATUS_FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Tất cả đơn' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipped', label: 'Đang giao' },
  { id: 'delivered', label: 'Đã giao' },
  { id: 'cancelled', label: 'Đã hủy' },
];

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

  useFocusEffect(
    useCallback(() => {
      void load('initial');
    }, [load])
  );

  return (
    <AdminLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#F0F0F5', marginBottom: 8 }}>
            Quản lý đơn hàng
          </Text>
          <Text style={{ fontSize: 14, color: '#8888A0' }}>
            Theo dõi và cập nhật trạng thái đơn hàng, vận chuyển và hoàn tất
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((opt) => {
            const active = filter === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFilter(opt.id)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: active ? '#6C63FF' : '#2A2A3A',
                  backgroundColor: active ? 'rgba(108, 99, 255, 0.1)' : '#13131A',
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: active ? '#6C63FF' : '#8888A0',
                  }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load('refresh')}
              tintColor="#6C63FF"
            />
          }>
          {loading ? (
            <LoadingBlock label="Đang tải đơn hàng..." />
          ) : orders.length === 0 ? (
            <EmptyBlock title="Không có đơn hàng" hint="Không có đơn hàng phù hợp với bộ lọc đã chọn." />
          ) : (
            <AdminTable
              columns={[
                {
                  key: 'code',
                  label: 'Mã đơn',
                  width: 140,
                  render: (o) => (
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#F0F0F5' }}>
                      #{o.code}
                    </Text>
                  ),
                },
                {
                  key: 'date',
                  label: 'Ngày',
                  width: 120,
                  render: (o) => (
                    <Text style={{ fontSize: 13, color: '#8888A0' }}>
                      {formatDate(o.date)}
                    </Text>
                  ),
                },
                {
                  key: 'shipName',
                  label: 'Khách hàng',
                  render: (o) => (
                    <Text style={{ fontSize: 14, color: '#F0F0F5' }}>
                      {o.shipName}
                    </Text>
                  ),
                },
                {
                  key: 'itemCount',
                  label: 'Số lượng',
                  width: 80,
                  align: 'center',
                  render: (o) => (
                    <Text style={{ fontSize: 14, color: '#8888A0' }}>
                      {o.itemCount}
                    </Text>
                  ),
                },
                {
                  key: 'total',
                  label: 'Tổng tiền',
                  width: 140,
                  align: 'right',
                  render: (o) => (
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#F0F0F5' }}>
                      {formatCurrency(o.total)}
                    </Text>
                  ),
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  width: 140,
                  render: (o) => <AdminStatusBadge status={o.status} />,
                },
              ]}
              data={orders}
              keyExtractor={(o) => o.id}
              onRowPress={(o) =>
                router.push(`/admin/orders/${encodeURIComponent(o.id)}` as never)
              }
            />
          )}
        </ScrollView>
      </View>
    </AdminLayout>
  );
}
