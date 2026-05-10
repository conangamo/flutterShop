import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '~/components/Button';
import { useToast } from '~/components/ToastProvider';
import { AppInput } from '~/components/ui/AppInput';
import { AppCard } from '~/components/ui/AppCard';
import { LoadingBlock } from '~/components/ui/StateBlocks';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
import { adminGetOrder, adminUpdateOrderStatus } from '~/lib/api/admin';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { OrderDetail, OrderStatus } from '~/lib/types/orders';
import { formatCurrency, formatDate } from '~/lib/utils/formatters';

const NEXT_STATES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Hoàn tất',
  cancelled: 'Huỷ đơn',
};

export default function AdminOrderDetailScreen() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const { addToast } = useToast();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const o = await adminGetOrder(orderId);
      setOrder(o);
      setTracking(o.tracking ?? '');
    } catch (e) {
      addToast(
        'error',
        L.common.error,
        e instanceof ApiError ? resolveApiError(e, locale) : L.errors.orderLoadFailed
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, locale, L.common.error, L.errors.orderLoadFailed, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const onTransition = async (next: OrderStatus) => {
    if (!order) return;
    setSubmitting(true);
    try {
      const updated = await adminUpdateOrderStatus(order.id, {
        status: next,
        note: note || undefined,
        trackingNumber: tracking || undefined,
      });
      setOrder(updated);
      addToast('success', L.common.success, `Đã chuyển trạng thái → ${STATUS_LABEL[next]}`);
      setNote('');
    } catch (e) {
      addToast(
        'error',
        L.common.error,
        e instanceof ApiError ? resolveApiError(e, locale) : 'Không cập nhật được trạng thái'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !order) {
    return (
      <AdminScreenShell title="Chi tiết đơn" subtitle={orderId ? `#${orderId.slice(0, 8)}…` : ''}>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          <LoadingBlock label="Đang tải chi tiết đơn hàng..." />
        </View>
      </AdminScreenShell>
    );
  }

  const next = NEXT_STATES[order.status];

  return (
    <AdminScreenShell title={`Đơn #${order.code}`} subtitle={formatDate(order.date)}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <AppCard className="mb-3.5">
          <Text style={styles.k}>Mã đơn</Text>
          <Text style={styles.h1}>#{order.code}</Text>
          <Text style={styles.p}>{formatDate(order.date)}</Text>
          <Text style={[styles.p, { marginTop: 10 }]}>
            {order.shippingAddress.name} · {order.shippingAddress.phone}
          </Text>
          <Text style={styles.p}>
            {order.shippingAddress.address}, {order.shippingAddress.city}
          </Text>

          <View style={styles.statusBox}>
            <Text style={styles.k}>Trạng thái hiện tại</Text>
            <Text style={styles.statusTxt}>{STATUS_LABEL[order.status]}</Text>
          </View>
        </AppCard>

        <AppCard className="mb-3.5">
          <Text style={styles.section}>Sản phẩm</Text>
          <View style={{ marginTop: 10, gap: 12 }}>
            {order.items.map((item) => (
              <View key={item.id} className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.p}>
                    {item.size ? `Size ${item.size} · ` : ''}
                    {item.color ?? ''} · ×{item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>
          <View className="mt-4 flex-row items-center justify-between border-t border-[#2A2A3A] pt-4">
            <Text style={styles.p}>Tổng</Text>
            <Text style={styles.total}>{formatCurrency(order.total)}</Text>
          </View>
        </AppCard>

        <AppCard className="mb-8">
          <Text style={styles.section}>Cập nhật trạng thái</Text>

          <AppInput
            label="Mã vận đơn"
            value={tracking}
            onChangeText={setTracking}
            placeholder="VD: GHN-2026-99887"
            className="mt-2"
          />

          <AppInput
            label="Ghi chú"
            value={note}
            onChangeText={setNote}
            placeholder="VD: Đã giao GHN"
            className="mt-2"
          />

          {next.length === 0 ? (
            <Text style={[styles.p, { marginTop: 16 }]}>Đơn đã ở trạng thái cuối.</Text>
          ) : (
            <View style={{ marginTop: 16, gap: 10 }}>
              {next.map((nx) => (
                <Button
                  key={nx}
                  title={`Chuyển sang “${STATUS_LABEL[nx]}”`}
                  variant={nx === 'cancelled' ? 'danger' : 'primary'}
                  loading={submitting}
                  disabled={submitting}
                  onPress={() => onTransition(nx)}
                />
              ))}
            </View>
          )}

          <View style={{ marginTop: 16 }}>
            <Button title="Quay lại danh sách" variant="secondary" onPress={() => router.back()} />
          </View>
        </AppCard>
      </ScrollView>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  k: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: A.muted,
    textTransform: 'uppercase',
  },
  h1: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: A.text,
  },
  p: {
    marginTop: 6,
    fontSize: 13,
    color: A.muted,
    lineHeight: 18,
  },
  statusBox: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    backgroundColor: A.surfaceElevated,
    borderWidth: 1,
    borderColor: A.border,
  },
  statusTxt: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '800',
    color: A.accent,
    textTransform: 'capitalize',
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    color: A.text,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: A.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: A.text,
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: A.text,
  },
});
