import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AdminLayout } from '~/components/admin/AdminLayout';
import { AppInput } from '~/components/ui/AppInput';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { adminCreatePromo, adminListPromos, type PromoRow } from '~/lib/api/admin';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import { formatCurrency } from '~/lib/utils/formatters';

export default function AdminPromosScreen() {
  const locale = getAppLocale();
  const L = strings(locale);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [discountValue, setDiscountValue] = useState('50000');
  const [promos, setPromos] = useState<PromoRow[]>([]);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const rows = await adminListPromos();
      setPromos(rows);
    } catch (e) {
      setError(e instanceof ApiError ? resolveApiError(e, locale) : L.errors.homeLoadFailed);
    } finally {
      if (mode === 'initial') setLoading(false);
      else setRefreshing(false);
    }
  }, [locale, L.errors.homeLoadFailed]);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const createPromo = async () => {
    if (!code.trim()) return;
    try {
      await adminCreatePromo({
        code: code.trim().toUpperCase(),
        discountType: 'fixed',
        discountValue: Number(discountValue || '0'),
        minOrderTotal: 300000,
        usageLimit: 100,
        isActive: true,
      });
      setCode('');
      await load('refresh');
    } catch (e) {
      setError(e instanceof ApiError ? resolveApiError(e, locale) : 'Không tạo được promo');
    }
  };

  return (
    <AdminLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0A0A0F' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} />}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 20 }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#F0F0F5', marginBottom: 8 }}>
              Quản lý khuyến mãi
            </Text>
            <Text style={{ fontSize: 14, color: '#8888A0' }}>
              Tạo và quản lý mã khuyến mãi cho các chiến dịch bán hàng
            </Text>
          </View>
          <View style={{ backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#F0F0F5', marginBottom: 16 }}>
              Tạo mã khuyến mãi
            </Text>
            <View style={{ gap: 16 }}>
              <AppInput value={code} onChangeText={setCode} label="Mã" placeholder="VD: SALE50K" />
              <AppInput
                value={discountValue}
                onChangeText={(v) => setDiscountValue(v.replace(/[^0-9]/g, ''))}
                label="Giảm giá cố định (VND)"
                keyboardType="numeric"
              />
              <Pressable onPress={createPromo} style={{ borderRadius: 12, backgroundColor: '#6C63FF', paddingVertical: 14 }}>
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>Tạo khuyến mãi</Text>
              </Pressable>
            </View>
          </View>
          {loading ? (
            <LoadingBlock label="Đang tải khuyến mãi..." />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void load('refresh')} />
          ) : promos.length === 0 ? (
            <EmptyBlock title="Chưa có khuyến mãi" hint="Tạo mã khuyến mãi đầu tiên cho thanh toán." />
          ) : (
            <View style={{ gap: 16 }}>
              {promos.map((p) => (
                <View key={p.id} style={{ backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 16, padding: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#F0F0F5' }}>{p.code}</Text>
                  <Text style={{ marginTop: 8, fontSize: 13, color: '#8888A0' }}>
                    {p.discountType} · {formatCurrency(p.discountValue)} · used {p.usedCount}/
                    {p.usageLimit ?? '∞'}
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 13, color: '#8888A0' }}>
                    đơn tối thiểu {formatCurrency(p.minOrderTotal)} · {p.isActive ? 'hoạt động' : 'tạm ngưng'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
}
