import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AppInput } from '~/components/ui/AppInput';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
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

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
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
    },
    [locale, L.errors.homeLoadFailed],
  );

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
    <AdminScreenShell title="Khuyến mãi" subtitle="Tạo và kiểm soát promo code">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={A.accent} />
        }>
        <View className="px-4 pb-10 pt-2">
          <View className="rounded-[20px] border border-[#2A2D42] bg-[#12131C] p-4">
            <Text className="text-[15px] font-semibold text-[#F0F0F5]">Tạo promo code nhanh</Text>
            <View className="mt-3 gap-2">
              <AppInput value={code} onChangeText={setCode} label="Code" placeholder="VD: SALE50K" />
              <AppInput
                value={discountValue}
                onChangeText={(v) => setDiscountValue(v.replace(/[^0-9]/g, ''))}
                label="Giảm cố định (VND)"
                keyboardType="numeric"
              />
              <Pressable onPress={createPromo} className="rounded-[14px] bg-[#6C63FF] py-3">
                <Text className="text-center text-[13px] font-semibold text-white">Tạo promo</Text>
              </Pressable>
            </View>
          </View>
          {loading ? (
            <LoadingBlock label="Đang tải promo..." />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void load('refresh')} />
          ) : promos.length === 0 ? (
            <EmptyBlock title="Chưa có promo" hint="Tạo promo đầu tiên để dùng cho checkout." />
          ) : (
            <View className="mt-3 gap-3">
              {promos.map((p) => (
                <View key={p.id} className="rounded-[20px] border border-[#2A2D42] bg-[#12131C] p-4">
                  <Text className="text-[15px] font-bold text-[#F0F0F5]">{p.code}</Text>
                  <Text className="mt-1 text-[12px] text-[#9CA3AF]">
                    {p.discountType} · {formatCurrency(p.discountValue)} · used {p.usedCount}/
                    {p.usageLimit ?? '∞'}
                  </Text>
                  <Text className="mt-1 text-[12px] text-[#9CA3AF]">
                    min order {formatCurrency(p.minOrderTotal)} · {p.isActive ? 'active' : 'inactive'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}
