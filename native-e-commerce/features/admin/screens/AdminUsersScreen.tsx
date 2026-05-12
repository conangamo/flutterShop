import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AdminLayout } from '~/components/admin/AdminLayout';
import { AppInput } from '~/components/ui/AppInput';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { adminListUsers, adminSetUserRole, adminSetUserStatus, type AdminUserRow } from '~/lib/api/admin';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';

export default function AdminUsersScreen() {
  const locale = getAppLocale();
  const L = strings(locale);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    action: () => Promise<void>;
  } | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const rows = await adminListUsers({ q: q || undefined, limit: 100 });
      setUsers(rows);
    } catch (e) {
      setError(e instanceof ApiError ? resolveApiError(e, locale) : L.errors.homeLoadFailed);
    } finally {
      if (mode === 'initial') setLoading(false);
      else setRefreshing(false);
    }
  }, [q, locale, L.errors.homeLoadFailed]);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const toggleActive = async (row: AdminUserRow) => {
    setConfirm({
      title: row.is_active ? 'Khoá tài khoản này?' : 'Mở lại tài khoản này?',
      body: `${row.name} (${row.email})`,
      action: async () => {
        await adminSetUserStatus(row.id, !row.is_active);
        await load('refresh');
      },
    });
  };
  const cycleRole = async (row: AdminUserRow) => {
    const next = row.role === 'user' ? 'staff' : row.role === 'staff' ? 'admin' : 'user';
    setConfirm({
      title: 'Đổi role người dùng?',
      body: `${row.name}: ${row.role} -> ${next}`,
      action: async () => {
        await adminSetUserRole(row.id, next);
        await load('refresh');
      },
    });
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
              Quản lý người dùng
            </Text>
            <Text style={{ fontSize: 14, color: '#8888A0' }}>
              Tìm kiếm, quản lý vai trò và khóa/mở khóa tài khoản người dùng
            </Text>
          </View>
          <AppInput
            label="Tìm theo tên hoặc email"
            value={q}
            onChangeText={setQ}
            placeholder="Nhập từ khóa..."
            onSubmitEditing={() => void load('refresh')}
          />
          {loading ? (
            <LoadingBlock label="Đang tải người dùng..." />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void load('refresh')} />
          ) : users.length === 0 ? (
            <EmptyBlock title="Không có người dùng" hint="Không có người dùng phù hợp với tìm kiếm của bạn." />
          ) : (
            <View style={{ marginTop: 24, gap: 16 }}>
              {users.map((u) => (
                <View key={u.id} style={{ backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 16, padding: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#F0F0F5' }} numberOfLines={1}>
                    {u.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8888A0', marginTop: 4 }} numberOfLines={1}>
                    {u.email}
                  </Text>
                  <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: '#8888A0' }}>
                      role: <Text style={{ fontWeight: '600', color: '#F0F0F5' }}>{u.role}</Text> ·{' '}
                      {u.is_active ? 'hoạt động' : 'tạm ngưng'}
                    </Text>
                  </View>
                  <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    <Pressable onPress={() => cycleRole(u)} style={{ borderRadius: 9999, backgroundColor: 'rgba(108, 99, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#6C63FF' }}>Đổi vai trò</Text>
                    </Pressable>
                    <Pressable onPress={() => toggleActive(u)} style={{ borderRadius: 9999, backgroundColor: '#1C1C28', paddingHorizontal: 16, paddingVertical: 10 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#F0F0F5' }}>
                        {u.is_active ? 'Khóa' : 'Mở khóa'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <ConfirmModal
        visible={confirm != null}
        title={confirm?.title ?? ''}
        body={confirm?.body ?? ''}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return;
          await confirm.action();
          setConfirm(null);
        }}
      />
    </AdminLayout>
  );
}

function ConfirmModal({
  visible,
  title,
  body,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="max-h-[80%] w-full max-w-[440px] rounded-[22px] bg-white p-4">
          <Text className="text-[16px] font-semibold text-[#111827]">{title}</Text>
          <ScrollView className="mt-2 max-h-[220px]" showsVerticalScrollIndicator={false}>
            <Text className="text-[13px] text-[#6B7280]">{body}</Text>
          </ScrollView>
          <View className="mt-4 flex-row justify-end gap-2">
            <Pressable onPress={onClose} className="rounded-full bg-[#F3F4F6] px-4 py-2">
              <Text className="font-semibold text-[#374151]">Huỷ</Text>
            </Pressable>
            <Pressable
              disabled={saving}
              onPress={async () => {
                setSaving(true);
                try {
                  await onConfirm();
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-full bg-[#DC2626] px-4 py-2">
              <Text className="font-semibold text-white">{saving ? '...' : 'Xác nhận'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
