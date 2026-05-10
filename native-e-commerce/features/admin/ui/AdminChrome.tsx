import { Ionicons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { adminTheme as A } from './theme';

const QUICK_LINKS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/admin', label: 'Menu', exact: true },
  { href: '/admin/dashboard', label: 'Báo cáo' },
  { href: '/admin/orders', label: 'Đơn' },
  { href: '/admin/inventory', label: 'Kho' },
  { href: '/admin/promos', label: 'KM' },
  { href: '/admin/users', label: 'User' },
  { href: '/admin/categories', label: 'DM' },
];

function pathNormalized(pathname: string): string {
  const p = pathname.replace(/\/$/, '');
  return p === '' ? '/' : p;
}

function linkActive(pathname: string, href: string, exact?: boolean): boolean {
  const p = pathNormalized(pathname);
  const h = pathNormalized(href);
  if (exact) return p === h;
  return p === h || p.startsWith(`${h}/`);
}

type ShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Thanh điều hướng nhanh giữa các module admin */
  showQuickNav?: boolean;
  /** Mặc định: có nút back khi không phải /admin */
  showBack?: boolean;
};

export function AdminScreenShell({
  title,
  subtitle,
  children,
  showQuickNav = true,
  showBack,
}: ShellProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const pn = pathNormalized(pathname);
  const back =
    showBack ?? (pn !== '/admin');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          {back ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/admin')}
              style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
              hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={A.text} />
            </Pressable>
          ) : (
            <View style={styles.logoMark}>
              <Ionicons name="flash-outline" size={18} color={A.accent} />
            </View>
          )}
          <View style={styles.headerText}>
            {!back ? (
              <Text style={styles.kicker}>ĐIỀU KHIỂN · ADMIN</Text>
            ) : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        {showQuickNav ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.navScrollOuter}
            contentContainerStyle={styles.navScrollInner}>
            {QUICK_LINKS.map((link) => {
              const active = linkActive(pathname, link.href, link.exact);
              return (
                <Pressable
                  key={link.href}
                  onPress={() => router.push(link.href as never)}
                  style={[styles.navPill, active && styles.navPillActive]}
                  accessibilityRole="button">
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{link.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: A.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  back: {
    marginTop: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: A.surfaceElevated,
    borderWidth: 1,
    borderColor: A.border,
  },
  logoMark: {
    marginTop: 4,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: A.accentSoft,
    borderWidth: 1,
    borderColor: A.border,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: A.muted,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: A.text,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: A.muted,
    lineHeight: 18,
  },
  navScrollOuter: {
    flexGrow: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: A.border,
    backgroundColor: A.surface,
  },
  navScrollInner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: A.surfaceElevated,
    borderWidth: 1,
    borderColor: A.border,
  },
  navPillActive: {
    backgroundColor: A.accentSoft,
    borderColor: A.accent,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: A.muted,
  },
  navLabelActive: {
    color: A.accent,
  },
  body: {
    flex: 1,
  },
});
