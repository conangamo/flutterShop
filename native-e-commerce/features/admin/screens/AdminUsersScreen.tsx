import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AppInput } from '~/components/ui/AppInput';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
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

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
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
    },
    [q, locale, L.errors.homeLoadFailed],
  );

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
    <>
      <AdminScreenShell title="Người dùng" subtitle="Tìm kiếm · role · khóa tài khoản">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={A.accent} />
          }>
          <View className="px-4 pb-10 pt-2">
            <AppInput
              label="Tìm theo tên hoặc email"
              value={q}
              onChangeText={setQ}
              placeholder="Nhập từ khoá..."
              onSubmitEditing={() => void load('refresh')}
            />
            {loading ? (
              <LoadingBlock label="Đang tải danh sách người dùng..." />
            ) : error ? (
              <ErrorBlock message={error} onRetry={() => void load('refresh')} />
            ) : users.length === 0 ? (
              <EmptyBlock title="Không có user" hint="Chưa có người dùng phù hợp." />
            ) : (
              <View className="mt-3 gap-3">
                {users.map((u) => (
                  <View key={u.id} className="rounded-[20px] border border-[#2A2D42] bg-[#12131C] p-4">
                    <Text className="text-[15px] font-semibold text-[#F0F0F5]" numberOfLines={1}>
                      {u.name}
                    </Text>
                    <Text className="text-[12px] text-[#9CA3AF]" numberOfLines={1}>
                      {u.email}
                    </Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className="text-[12px] text-[#9CA3AF]">
                        role: <Text className="font-semibold text-[#F0F0F5]">{u.role}</Text> ·{' '}
                        {u.is_active ? 'active' : 'inactive'}
                      </Text>
                    </View>
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      <Pressable
                        onPress={() => cycleRole(u)}
                        className="rounded-full border border-[#6C63FF] bg-[rgba(108,99,255,0.14)] px-3 py-2">
                        <Text className="text-[12px] font-semibold text-[#6C63FF]">Đổi role</Text>
                      </Pressable>
                      <Pressable onPress={() => toggleActive(u)} className="rounded-full bg-[#1C1D2E] px-3 py-2">
                        <Text className="text-[12px] font-semibold text-[#D4D4DE]">
                          {u.is_active ? 'Khoá' : 'Mở'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </AdminScreenShell>
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
    </>
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
        <View className="max-h-[80%] w-full max-w-[440px] rounded-[22px] border border-[#2A2D42] bg-[#12131C] p-4">
          <Text className="text-[16px] font-semibold text-[#F0F0F5]">{title}</Text>
          <ScrollView className="mt-2 max-h-[220px]" showsVerticalScrollIndicator={false}>
            <Text className="text-[13px] text-[#9CA3AF]">{body}</Text>
          </ScrollView>
          <View className="mt-4 flex-row justify-end gap-2">
            <Pressable onPress={onClose} className="rounded-full bg-[#1C1D2E] px-4 py-2">
              <Text className="font-semibold text-[#D4D4DE]">Huỷ</Text>
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
