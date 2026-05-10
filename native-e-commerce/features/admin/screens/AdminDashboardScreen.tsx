import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '~/components/ui/AppCard';
import { EmptyBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
import {
  adminDashboardRevenue,
  adminDashboardSummary,
  adminDashboardTopProducts,
} from '~/lib/api/admin';
import { formatCurrency } from '~/lib/utils/formatters';

type Summary = {
  totalOrders: number;
  revenue: number;
  activeProducts: number;
  lowStockVariants: number;
};

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [revenueRows, setRevenueRows] = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<
    { productId: string; name: string; quantity: number; revenue: number }[]
  >([]);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    try {
      const [s, r, t] = await Promise.all([
        adminDashboardSummary(),
        adminDashboardRevenue(7),
        adminDashboardTopProducts(5),
      ]);
      setSummary(s);
      setRevenueRows(r);
      setTopProducts(t);
    } finally {
      if (mode === 'initial') setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  return (
    <AdminScreenShell title="Dashboard vận hành" subtitle="Doanh thu · đơn · top SKU · tồn kho">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.pad}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={A.accent} />
        }
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <LoadingBlock label="Đang tải báo cáo..." />
        ) : !summary ? (
          <EmptyBlock title="Không có dữ liệu" hint="Không thể tải dashboard." />
        ) : (
          <>
            <View style={styles.metricRow}>
              <MetricCard label="Tổng đơn" value={String(summary.totalOrders)} />
              <MetricCard label="Doanh thu" value={formatCurrency(summary.revenue)} />
            </View>
            <View style={styles.metricRow}>
              <MetricCard label="SKU đang bán" value={String(summary.activeProducts)} />
              <MetricCard label="Variant sắp hết" value={String(summary.lowStockVariants)} />
            </View>

            <AppCard className="mb-3">
              <Text style={styles.cardTitle}>Doanh thu 7 ngày</Text>
              <LineChart rows={revenueRows} />
              <View className="mt-3 gap-2">
                {revenueRows.map((row) => (
                  <View key={row.day} className="flex-row items-center justify-between gap-3">
                    <Text style={styles.rowMuted}>{row.day}</Text>
                    <Text style={styles.rowStrong}>
                      {formatCurrency(row.revenue)} · {row.orders} đơn
                    </Text>
                  </View>
                ))}
              </View>
            </AppCard>

            <AppCard>
              <Text style={styles.cardTitle}>Top sản phẩm</Text>
              <BarChart rows={topProducts} />
              <View className="mt-3 gap-2">
                {topProducts.map((row, idx) => (
                  <View key={row.productId} className="flex-row items-center justify-between gap-3">
                    <Text style={styles.rowName} numberOfLines={1}>
                      {idx + 1}. {row.name}
                    </Text>
                    <Text style={styles.rowMuted}>
                      {row.quantity} · {formatCurrency(row.revenue)}
                    </Text>
                  </View>
                ))}
              </View>
            </AppCard>
          </>
        )}
      </ScrollView>
    </AdminScreenShell>
  );
}

function LineChart({ rows }: { rows: { day: string; revenue: number; orders: number }[] }) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  const points = rows.map((r, i) => ({
    x: (i / Math.max(1, rows.length - 1)) * 100,
    y: 100 - (r.revenue / max) * 100,
  }));
  return (
    <View style={styles.chartBg}>
      {points.slice(0, -1).map((p, idx) => {
        const n = points[idx + 1];
        const dx = n.x - p.x;
        const dy = n.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={`seg-${idx}`}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${len}%`,
              height: 2,
              backgroundColor: A.accent,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
      {points.map((p, idx) => (
        <View
          key={`dot-${rows[idx]?.day ?? idx}`}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          className="h-2.5 w-2.5 -translate-x-1 -translate-y-1 rounded-full bg-[#6C63FF]"
        />
      ))}
    </View>
  );
}

function BarChart({
  rows,
}: {
  rows: { productId: string; name: string; quantity: number; revenue: number }[];
}) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  return (
    <View style={styles.barWrap}>
      {rows.map((row) => {
        const h = Math.max(8, Math.round((row.revenue / max) * 90));
        return (
          <View key={row.productId} className="flex-1 items-center">
            <View style={{ height: h }} className="w-full rounded-t-[8px] bg-[#6C63FF]" />
            <Text numberOfLines={1} style={styles.barLabel}>
              {row.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: A.surfaceElevated,
    borderWidth: 1,
    borderColor: A.border,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: A.muted,
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '800',
    color: A.text,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: A.text,
  },
  rowMuted: {
    flex: 1,
    fontSize: 13,
    color: A.muted,
  },
  rowStrong: {
    fontSize: 13,
    fontWeight: '700',
    color: A.text,
    textAlign: 'right',
  },
  rowName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: A.text,
  },
  chartBg: {
    marginTop: 12,
    height: 112,
    borderRadius: 14,
    backgroundColor: '#1C1C28',
    padding: 8,
    overflow: 'hidden',
  },
  barWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#1C1C28',
    padding: 12,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: A.muted,
    textAlign: 'center',
  },
});
