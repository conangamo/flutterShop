import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { fetchCurrentUser } from '~/lib/api/users';
import { ApiError } from '~/lib/api/errors';
import { logoutSession } from '~/lib/auth/session';
import { getAccessToken } from '~/lib/api/token';
import { getAppLocale, resolveApiError, roleLabel, strings } from '~/lib/i18n';
import type { CurrentUser } from '~/lib/types/user';
import { useToast } from '~/components/ToastProvider';

// Inline MenuItem component — purely presentational
const MenuItem = ({
  icon,
  label,
  onPress,
  isDanger,
  rightSlot,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
  rightSlot?: React.ReactNode;
}) => (
  <Pressable onPress={onPress} className="flex-row items-center px-4 py-4 gap-3.5 active:bg-bg-elevated">
    {/* Icon container pill */}
    <View
      className={`w-9 h-9 rounded-xl items-center justify-center border ${
        isDanger
          ? 'bg-accent-coral/10 border-accent-coral/20'
          : 'bg-bg-elevated border-semantic-border'
      }`}
    >
      {icon}
    </View>

    {/* Label */}
    <Text className={`flex-1 text-[15px] font-medium ${isDanger ? 'text-accent-coral' : 'text-text-primary'}`}>
      {label}
    </Text>

    {/* Right slot — chevron by default, or pass custom element */}
    {rightSlot ?? <Text className="text-text-muted text-lg">›</Text>}
  </Pressable>
);

export default function AccountScreen() {
  const { addToast } = useToast();
  const router = useRouter();
  const locale = getAppLocale();
  const L = strings(locale);

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedLogin(false);
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      setNeedLogin(true);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch (e) {
      setUser(null);
      if (e instanceof ApiError && e.status === 401) {
        setNeedLogin(true);
      } else {
        setError(resolveApiError(e, locale));
      }
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirmed = () => {
    setShowLogoutConfirm(false);
    void (async () => {
      setLoggingOut(true);
      try {
        await logoutSession();
        addToast('success', L.common.success, L.account.logout);
        router.replace('/(auth)/login');
      } catch {
        addToast('error', L.errors.logoutFailedTitle, L.errors.logoutFailedBody);
        router.replace('/(auth)/login');
      } finally {
        setLoggingOut(false);
      }
    })();
  };

  return (
    <>
      <Stack.Screen options={{ title: L.account.screenTitle, headerShown: false }} />

      <View className="flex-1 bg-bg-primary">
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View className="flex-1 items-center justify-center py-24">
              <ActivityIndicator size="large" color="#6C63FF" />
              <Text className="mt-3 text-sm text-text-secondary">{L.common.loading}</Text>
            </View>
          ) : needLogin ? (
            <Animated.View entering={FadeInDown.duration(400)} className="mx-4 mt-6">
              <View className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
                <Text className="text-lg font-bold text-text-primary">{L.account.loginTitle}</Text>
                <Text className="mt-2 text-sm leading-5 text-text-secondary">{L.account.loginSubtitle}</Text>
                <Pressable
                  className="mt-4 self-start bg-accent rounded-xl px-5 py-2.5"
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text className="text-sm font-bold text-white">{L.account.loginCta}</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : error ? (
            <Animated.View entering={FadeInDown.duration(400)} className="mx-4 mt-6">
              <View className="bg-bg-surface border border-semantic-border rounded-2xl p-5">
                <Text className="text-base text-accent-coral">{error}</Text>
                <Pressable
                  className="mt-4 self-start border border-accent rounded-xl px-4 py-2"
                  onPress={() => void load()}
                >
                  <Text className="text-sm font-semibold text-accent">{L.common.retry}</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : user ? (
            <>
              {/* === AVATAR HEADER ZONE === */}
              <Animated.View entering={FadeInDown.duration(450)} className="items-center pt-10 pb-8 px-5">
                {/* ── GRADIENT RING AROUND AVATAR ── */}
                <View
                  className="p-[3px] rounded-full mb-4"
                  style={{
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                    elevation: 12,
                  }}
                >
                  {/* Simulated gradient using overlapping views */}
                  <View className="relative rounded-full">
                    <View className="absolute inset-0 rounded-full bg-accent" />
                    <View className="absolute top-0 right-0 w-1/2 h-full rounded-full bg-accent-coral opacity-70" />

                    {/* Inner dark gap layer */}
                    <View className="p-[2px] rounded-full bg-bg-primary">
                      {/* Avatar container */}
                      <View className="w-24 h-24 rounded-full overflow-hidden bg-bg-elevated items-center justify-center">
                        {user.avatar ? (
                          <Image source={{ uri: user.avatar }} className="w-24 h-24" resizeMode="cover" />
                        ) : (
                          <Ionicons name="person" size={48} color="#8888A0" />
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {/* User name */}
                <Text className="text-text-primary text-2xl font-extrabold tracking-tight mb-1">
                  {user.name}
                </Text>

                {/* User email */}
                <Text className="text-text-secondary text-sm">{user.email}</Text>

                {/* Status badge */}
                {!user.is_active ? (
                  <View className="mt-3 bg-accent-coral/15 rounded-full px-3 py-1.5">
                    <Text className="text-center text-xs font-semibold text-accent-coral">
                      {L.account.inactiveBanner}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>

              {/* === MENU SECTIONS === */}
              <View className="pb-8">
                {/* Section 1: Account */}
                <View className="px-4 mb-2 mt-6">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-1 h-5 rounded-full bg-accent" />
                    <Text className="text-text-primary text-base font-bold">Tài khoản</Text>
                  </View>
                </View>

                <Animated.View
                  entering={FadeInDown.duration(400).delay(200)}
                  className="mx-4 rounded-2xl bg-bg-surface border border-semantic-border overflow-hidden mb-2"
                >
                  <MenuItem
                    icon={<Ionicons name="person-outline" size={20} color="#6C63FF" />}
                    label={L.account.rowName}
                    onPress={() => router.push('/account/edit')}
                    rightSlot={
                      <View className="flex-row items-center gap-2">
                        <Text className="text-text-secondary text-sm mr-1" numberOfLines={1}>
                          {user.name}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#8888A0" />
                      </View>
                    }
                  />
                  <View className="h-px bg-semantic-border mx-4" />
                  <MenuItem
                    icon={<Ionicons name="mail-outline" size={20} color="#6C63FF" />}
                    label={L.account.rowEmail}
                    onPress={() => {}}
                    rightSlot={
                      <Text className="text-text-secondary text-sm mr-2" numberOfLines={1}>
                        {user.email}
                      </Text>
                    }
                  />
                  <View className="h-px bg-semantic-border mx-4" />
                  <MenuItem
                    icon={<Ionicons name="call-outline" size={20} color="#6C63FF" />}
                    label={L.account.rowPhone}
                    onPress={() => router.push('/account/edit')}
                    rightSlot={
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-sm mr-1 ${user.phone ? 'text-text-secondary' : 'text-text-muted'}`}>
                          {user.phone ?? '—'}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#8888A0" />
                      </View>
                    }
                  />
                </Animated.View>

                {/* Section 2: Settings */}
                <View className="px-4 mb-2 mt-6">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-1 h-5 rounded-full bg-accent" />
                    <Text className="text-text-primary text-base font-bold">Cài đặt</Text>
                  </View>
                </View>

                <Animated.View
                  entering={FadeInDown.duration(400).delay(250)}
                  className="mx-4 rounded-2xl bg-bg-surface border border-semantic-border overflow-hidden mb-2"
                >
                  <MenuItem
                    icon={<Ionicons name="location-outline" size={20} color="#6C63FF" />}
                    label="Sổ địa chỉ"
                    onPress={() => router.push('/addresses')}
                  />
                  <View className="h-px bg-semantic-border mx-4" />
                  <MenuItem
                    icon={<Ionicons name="receipt-outline" size={20} color="#6C63FF" />}
                    label="Đơn hàng"
                    onPress={() => router.push('/(tabs)/order')}
                  />
                  <View className="h-px bg-semantic-border mx-4" />
                  <MenuItem
                    icon={<Ionicons name="settings-outline" size={20} color="#6C63FF" />}
                    label="Cài đặt"
                    onPress={() => router.push('/(tabs)/settings')}
                  />
                </Animated.View>

                {/* Admin section if applicable */}
                {user.role === 'admin' ? (
                  <>
                    <View className="px-4 mb-2 mt-6">
                      <View className="flex-row items-center gap-2.5">
                        <View className="w-1 h-5 rounded-full bg-accent" />
                        <Text className="text-text-primary text-base font-bold">Quản trị</Text>
                      </View>
                    </View>

                    <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mx-4 mb-2">
                      <Pressable
                        className="rounded-2xl border border-accent/30 bg-accent/10 py-4"
                        onPress={() => router.push('/admin' as never)}
                      >
                        <View className="flex-row items-center justify-center gap-2">
                          <Ionicons name="shield-checkmark-outline" size={18} color="#6C63FF" />
                          <Text className="text-center text-base font-bold text-accent">
                            Vào trang quản trị
                          </Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                  </>
                ) : null}

                {/* Logout/Danger Zone */}
                <View className="px-4 mb-2 mt-6">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-1 h-5 rounded-full bg-accent-coral" />
                    <Text className="text-text-primary text-base font-bold">Vùng nguy hiểm</Text>
                  </View>
                </View>

                <Animated.View
                  entering={FadeInDown.duration(400).delay(350)}
                  className="mx-4 mt-2 mb-8 rounded-2xl bg-accent-coral/5 border border-accent-coral/20 overflow-hidden"
                >
                  <MenuItem
                    icon={<Ionicons name="log-out-outline" size={20} color="#FF6584" />}
                    label={loggingOut ? L.common.loading : L.account.logout}
                    onPress={confirmLogout}
                    isDanger
                    rightSlot={null}
                  />
                </Animated.View>
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* Logout confirmation modal */}
        {showLogoutConfirm ? (
          <View className="absolute inset-0 z-50 items-center justify-center bg-black/70 px-6">
            <View className="w-full max-w-[420px] border border-semantic-border bg-bg-surface p-5 rounded-2xl">
              <Text className="text-[19px] font-bold text-text-primary">{L.account.logoutConfirmTitle}</Text>
              <Text className="mt-2 text-[14px] leading-[21px] text-text-secondary">
                {L.account.logoutConfirmBody}
              </Text>
              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={() => setShowLogoutConfirm(false)}
                  className="flex-1 items-center rounded-2xl border border-semantic-border bg-bg-elevated py-3"
                >
                  <Text className="text-[14px] font-bold text-text-primary">{L.common.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={handleLogoutConfirmed}
                  className="flex-1 items-center rounded-2xl border border-accent-coral/30 bg-accent-coral/15 py-3"
                >
                  <Text className="text-[14px] font-bold text-accent-coral">{L.account.logout}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </>
  );
}
