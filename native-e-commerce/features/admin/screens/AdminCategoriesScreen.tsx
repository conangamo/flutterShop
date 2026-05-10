import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AppInput } from '~/components/ui/AppInput';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '~/components/ui/StateBlocks';
import { AdminScreenShell } from '~/features/admin/ui/AdminChrome';
import { adminTheme as A } from '~/features/admin/ui/theme';
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  adminUpdateCategory,
  adminUploadMedia,
  type AdminCategoryRow,
} from '~/lib/api/admin';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminCategoriesScreen() {
  const locale = getAppLocale();
  const L = strings(locale);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminCategoryRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [parentId, setParentId] = useState('');

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      setRows(await adminListCategories());
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

  const resetForm = () => {
    setEditingId(null);
    setId('');
    setLabel('');
    setSlug('');
    setImage('');
    setParentId('');
  };

  const onPickAndUploadImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Bạn chưa cấp quyền thư viện ảnh.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      const uploaded = await adminUploadMedia(
        {
          uri: asset.uri,
          type: asset.mimeType ?? 'image/jpeg',
          name: asset.fileName ?? `category-${Date.now()}.jpg`,
        },
        'categories'
      );
      setImage(uploaded.url);
    } catch (e) {
      setError(e instanceof ApiError ? resolveApiError(e, locale) : 'Upload ảnh thất bại');
    }
  };

  const onSave = async () => {
    if (!label.trim()) return;
    const payload = {
      label: label.trim(),
      slug: (slug.trim() || toSlug(label)),
      image: image.trim() || undefined,
      parentId: parentId.trim() || undefined,
    };
    try {
      if (editingId) {
        await adminUpdateCategory(editingId, payload);
      } else {
        if (!id.trim()) return;
        await adminCreateCategory({ id: id.trim(), ...payload });
      }
      resetForm();
      await load('refresh');
    } catch (e) {
      setError(e instanceof ApiError ? resolveApiError(e, locale) : 'Không lưu được danh mục');
    }
  };

  const onEdit = (row: AdminCategoryRow) => {
    setEditingId(row.id);
    setId(row.id);
    setLabel(row.label);
    setSlug(row.slug);
    setImage(row.image ?? '');
    setParentId(row.parentId ?? '');
  };

  const onDelete = async (categoryId: string) => {
    try {
      await adminDeleteCategory(categoryId);
      if (editingId === categoryId) resetForm();
      await load('refresh');
    } catch (e) {
      setError(e instanceof ApiError ? resolveApiError(e, locale) : 'Không xoá được danh mục');
    }
  };

  return (
    <AdminScreenShell title="Danh mục" subtitle="Ảnh, slug và parent category">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh')}
            tintColor={A.accent}
          />
        }>
        <View className="px-4 pb-10 pt-2">
        <View className="rounded-[20px] border border-[#2A2D42] bg-[#12131C] p-4">
          <Text className="text-[15px] font-semibold text-text-primary">
            {editingId ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
          </Text>
            <View className="mt-3 gap-2">
              {!editingId ? <AppInput value={id} onChangeText={setId} label="ID" placeholder="vd: running" /> : null}
              <AppInput value={label} onChangeText={setLabel} label="Tên danh mục" />
              <AppInput
                value={slug}
                onChangeText={setSlug}
                label="Slug"
                placeholder="để trống sẽ tự sinh từ tên"
              />
              <AppInput value={image} onChangeText={setImage} label="Ảnh" placeholder="https://..." />
              <Pressable onPress={onPickAndUploadImage} className="rounded-button border border-accent py-2">
                <Text className="text-center text-[13px] font-semibold text-accent">Upload ảnh từ máy</Text>
              </Pressable>
              <AppInput value={parentId} onChangeText={setParentId} label="Parent ID (tuỳ chọn)" />
              <View className="flex-row gap-2">
                <Pressable onPress={onSave} className="flex-1 rounded-button bg-accent py-3">
                  <Text className="text-center text-[13px] font-semibold text-text-primary">
                    {editingId ? 'Lưu thay đổi' : 'Tạo danh mục'}
                  </Text>
                </Pressable>
                {editingId ? (
                  <Pressable onPress={resetForm} className="rounded-button border border-semantic-border px-4 py-3">
                    <Text className="text-[13px] font-semibold text-text-secondary">Huỷ</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          {loading ? (
            <LoadingBlock label="Đang tải danh mục..." />
          ) : error ? (
            <ErrorBlock message={error} onRetry={() => void load('refresh')} />
          ) : rows.length === 0 ? (
            <EmptyBlock title="Chưa có danh mục" hint="Tạo danh mục đầu tiên để gán sản phẩm." />
          ) : (
            <View className="mt-3 gap-3">
              {rows.map((r) => (
                <View key={r.id} className="rounded-[20px] border border-[#2A2D42] bg-[#12131C] p-4">
                  <Text className="text-[15px] font-bold text-text-primary">{r.label}</Text>
                  <Text className="mt-1 text-[12px] text-text-secondary">
                    id: {r.id} · slug: {r.slug}
                  </Text>
                  <Text className="mt-1 text-[12px] text-text-secondary">{r.image || '(no image)'}</Text>
                  <View className="mt-3 flex-row gap-2">
                    <Pressable onPress={() => onEdit(r)} className="rounded-chip border border-semantic-border px-4 py-2">
                      <Text className="text-[12px] font-semibold text-text-secondary">Sửa</Text>
                    </Pressable>
                    <Pressable onPress={() => void onDelete(r.id)} className="rounded-chip border border-red-900/30 px-4 py-2">
                      <Text className="text-[12px] font-semibold text-red-400">Xoá</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}
