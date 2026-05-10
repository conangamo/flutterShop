import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useToast } from '~/components/ToastProvider';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
import { fetchCurrentUser } from '~/lib/api/users';
import { ApiError } from '~/lib/api/errors';
import { getAccessToken } from '~/lib/api/token';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { CurrentUser } from '~/lib/types/user';

const TILES: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  href: '/admin/dashboard' | '/admin/orders' | '/admin/inventory' | '/admin/promos' | '/admin/users' | '/admin/categories';
}[] = [
  {
    icon: 'stats-chart-outline',
    title: 'Dashboard báo cáo',
    subtitle: 'Doanh thu, top SKU, cảnh báo tồn',
    href: '/admin/dashboard',
  },
  {
    icon: 'receipt-outline',
    title: 'Đơn hàng',
    subtitle: 'Trạng thái · tracking · giao vận',
    href: '/admin/orders',
  },
  {
    icon: 'cube-outline',
    title: 'Kho & biến thể',
    subtitle: 'Tồn theo size, bulk stock',
    href: '/admin/inventory',
  },
  {
    icon: 'pricetags-outline',
    title: 'Khuyến mãi',
    subtitle: 'Mã giảm · quota · min đơn',
    href: '/admin/promos',
  },
  {
    icon: 'people-outline',
    title: 'Người dùng',
    subtitle: 'Role · khóa tài khoản',
    href: '/admin/users',
  },
  {
    icon: 'grid-outline',
    title: 'Danh mục',
    subtitle: 'Ảnh, slug, cấu trúc shop',
    href: '/admin/categories',
  },
];

export default function AdminHomeScreen() {
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);
  const { addToast } = useToast();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    const token = await getAccessToken();
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }
    try {
      const me = await fetchCurrentUser();
      if (me.role !== 'admin' && me.role !== 'staff') {
        setForbidden(true);
        setUser(null);
        return;
      }
      setUser(me);
    } catch (e) {
      addToast(
        'error',
        L.common.error,
        e instanceof ApiError ? resolveApiError(e, locale) : L.errors.homeLoadFailed
      );
    } finally {
      setLoading(false);
    }
  }, [router, addToast, locale, L.common.error, L.errors.homeLoadFailed]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading) {
    return (
      <AdminScreenShell title="Đang kiểm tra quyền..." showQuickNav={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={A.accent} />
          <Text style={styles.loadHint}>Xác thực phiên làm việc…</Text>
        </View>
      </AdminScreenShell>
    );
  }

  if (forbidden) {
    return (
      <AdminScreenShell title="Không có quyền" subtitle="Tài khoản này không thuộc nhóm admin/staff." showQuickNav={false}>
        <View style={styles.center}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed-outline" size={36} color={A.muted} />
          </View>
          <Pressable onPress={() => router.back()} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnLabel}>Quay lại</Text>
          </Pressable>
        </View>
      </AdminScreenShell>
    );
  }

  return (
    <AdminScreenShell title="Trung tâm điều khiển" subtitle={user ? `${user.name} · ${user.email}` : ''}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollPad}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroRole}>{user?.role?.toUpperCase() ?? 'STAFF'}</Text>
          <Text style={styles.heroName}>{user?.name}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
        </View>

        <Text style={styles.sectionLabel}>MODULE</Text>
        <View style={styles.tileGrid}>
          {TILES.map((t) => (
            <Pressable
              key={t.href}
              onPress={() => router.push(t.href as never)}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.92 }]}>
              <View style={styles.tileIcon}>
                <Ionicons name={t.icon} size={22} color={A.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>{t.title}</Text>
                <Text style={styles.tileSub}>{t.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={A.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  loadHint: {
    marginTop: 12,
    fontSize: 13,
    color: A.muted,
  },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: A.surfaceElevated,
    borderWidth: 1,
    borderColor: A.border,
    marginBottom: 8,
  },
  primaryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: A.accent,
  },
  primaryBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollPad: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 8,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    backgroundColor: A.surface,
    borderWidth: 1,
    borderColor: A.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroRole: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: A.accent,
    marginBottom: 8,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: A.text,
  },
  heroEmail: {
    marginTop: 6,
    fontSize: 13,
    color: A.muted,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: A.muted,
    marginBottom: 10,
    marginLeft: 4,
  },
  tileGrid: {
    gap: 10,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: A.surfaceElevated,
    borderWidth: 1,
    borderColor: A.border,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: A.accentSoft,
    borderWidth: 1,
    borderColor: A.border,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: A.text,
  },
  tileSub: {
    marginTop: 4,
    fontSize: 12,
    color: A.muted,
    lineHeight: 16,
  },
});
