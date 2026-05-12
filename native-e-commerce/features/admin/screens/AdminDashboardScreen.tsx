import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { AdminLayout } from '~/components/admin/AdminLayout';
import { AdminMetricCard } from '~/components/admin/AdminMetricCard';
import { AppCard } from '~/components/ui/AppCard';
import { EmptyBlock, LoadingBlock } from '~/components/ui/StateBlocks';
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
  const [topProducts, setTopProducts] = useState<{ productId: string; name: string; quantity: number; revenue: number }[]>([]);

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
    <AdminLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0A0A0F' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} />}>
        <View style={{ paddingBottom: 40 }}>
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#F0F0F5', marginBottom: 8 }}>
              Bảng điều khiển
            </Text>
            <Text style={{ fontSize: 14, color: '#8888A0' }}>
              Thông tin thời gian thực về doanh thu, hiệu suất và tồn kho
            </Text>
          </View>
          {loading ? (
            <LoadingBlock label="Đang tải dữ liệu bảng điều khiển..." />
          ) : !summary ? (
            <EmptyBlock title="Không có dữ liệu" hint="Không thể tải số liệu bảng điều khiển." />
          ) : (
            <>
              <View style={{ 
                display: 'grid' as any, 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' as any,
                gap: 20,
                marginBottom: 32 
              }}>
                <AdminMetricCard 
                  label="Tổng đơn hàng" 
                  value={summary.totalOrders}
                  icon="cart"
                  color="#6C63FF"
                />
                <AdminMetricCard 
                  label="Doanh thu" 
                  value={formatCurrency(summary.revenue)}
                  icon="trending-up"
                  color="#3ECF8E"
                />
                <AdminMetricCard 
                  label="Sản phẩm đang bán" 
                  value={summary.activeProducts}
                  icon="cube"
                  color="#3B82F6"
                />
                <AdminMetricCard 
                  label="Biến thể sắp hết" 
                  value={summary.lowStockVariants}
                  icon="alert-circle"
                  color="#F59E0B"
                />
              </View>

              <View style={{ 
                backgroundColor: '#13131A', 
                borderWidth: 1, 
                borderColor: '#2A2A3A', 
                borderRadius: 16, 
                padding: 24,
                marginBottom: 24 
              }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#F0F0F5', marginBottom: 16 }}>
                  Xu hướng doanh thu 7 ngày
                </Text>
                <LineChart rows={revenueRows} />
                <View style={{ marginTop: 20, gap: 12 }}>
                  {revenueRows.map((row) => (
                    <View key={row.day} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ flex: 1, fontSize: 13, color: '#8888A0' }}>{row.day}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#F0F0F5' }}>
                        {formatCurrency(row.revenue)} · {row.orders} đơn
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ 
                backgroundColor: '#13131A', 
                borderWidth: 1, 
                borderColor: '#2A2A3A', 
                borderRadius: 16, 
                padding: 24 
              }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#F0F0F5', marginBottom: 16 }}>
                  Sản phẩm bán chạy
                </Text>
                <BarChart rows={topProducts} />
                <View style={{ marginTop: 20, gap: 12 }}>
                  {topProducts.map((row, idx) => (
                    <View key={row.productId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ flex: 1, fontSize: 14, color: '#F0F0F5' }}>
                        {idx + 1}. {row.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#8888A0' }}>
                        {row.quantity} · {formatCurrency(row.revenue)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
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
    <View style={{ height: 120, borderRadius: 12, backgroundColor: '#1C1C28', padding: 12, position: 'relative' }}>
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
              height: 3,
              backgroundColor: '#6C63FF',
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
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: 5,
            backgroundColor: '#6C63FF',
            borderWidth: 2,
            borderColor: '#13131A'
          }}
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
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, borderRadius: 12, backgroundColor: '#1C1C28', padding: 16, height: 120 }}>
      {rows.map((row) => {
        const h = Math.max(12, Math.round((row.revenue / max) * 80));
        return (
          <View key={row.productId} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{ 
                height: h, 
                width: '100%',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                background: 'linear-gradient(180deg, #6C63FF 0%, #5951E6 100%)' as any,
                backgroundColor: '#6C63FF'
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
