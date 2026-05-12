import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AdminLayout } from '~/components/admin/AdminLayout';
import { AppInput } from '~/components/ui/AppInput';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '~/components/ui/StateBlocks';
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
    <AdminLayout>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0A0A0F' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} />}>
        <View style={{ padding: 20 }}>
          <View style={{ backgroundColor: '#13131A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A3A' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#F0F0F5', marginBottom: 16 }}>
              {editingId ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
            </Text>
            <View style={{ gap: 12 }}>
              {!editingId ? <AppInput value={id} onChangeText={setId} label="ID" placeholder="vd: running" /> : null}
              <AppInput value={label} onChangeText={setLabel} label="Tên danh mục" />
              <AppInput
                value={slug}
                onChangeText={setSlug}
                label="Slug"
                placeholder="để trống sẽ tự sinh từ tên"
              />
              <AppInput value={image} onChangeText={setImage} label="Ảnh" placeholder="https://..." />
              <Pressable 
                onPress={onPickAndUploadImage} 
                style={{ 
                  borderRadius: 9999, 
                  borderWidth: 1, 
                  borderColor: '#6C63FF', 
                  backgroundColor: 'rgba(108, 99, 255, 0.1)', 
                  paddingVertical: 12, 
                  paddingHorizontal: 16 
                }}>
                <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#6C63FF' }}>
                  Upload ảnh từ máy
                </Text>
              </Pressable>
              <AppInput value={parentId} onChangeText={setParentId} label="Parent ID (tuỳ chọn)" />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Pressable 
                  onPress={onSave} 
                  style={{ 
                    flex: 1, 
                    borderRadius: 9999, 
                    backgroundColor: '#6C63FF', 
                    paddingVertical: 14 
                  }}>
                  <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>
                    {editingId ? 'Lưu thay đổi' : 'Tạo danh mục'}
                  </Text>
                </Pressable>
                {editingId ? (
                  <Pressable 
                    onPress={resetForm} 
                    style={{ 
                      borderRadius: 9999, 
                      borderWidth: 1, 
                      borderColor: '#2A2A3A', 
                      backgroundColor: '#1C1C28', 
                      paddingHorizontal: 20, 
                      paddingVertical: 14 
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#8888A0' }}>Huỷ</Text>
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
            <View style={{ marginTop: 16, gap: 12 }}>
              {rows.map((r) => (
                <View 
                  key={r.id} 
                  style={{ 
                    backgroundColor: '#13131A', 
                    borderRadius: 16, 
                    padding: 16, 
                    borderWidth: 1, 
                    borderColor: '#2A2A3A' 
                  }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#F0F0F5' }}>{r.label}</Text>
                  <Text style={{ marginTop: 6, fontSize: 12, color: '#8888A0' }}>
                    id: {r.id} · slug: {r.slug}
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#8888A0' }}>
                    {r.image || '(không có ảnh)'}
                  </Text>
                  <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                    <Pressable 
                      onPress={() => onEdit(r)} 
                      style={{ 
                        borderRadius: 9999, 
                        borderWidth: 1, 
                        borderColor: '#2A2A3A', 
                        backgroundColor: '#1C1C28', 
                        paddingHorizontal: 16, 
                        paddingVertical: 10 
                      }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#8888A0' }}>Sửa</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => void onDelete(r.id)} 
                      style={{ 
                        borderRadius: 9999, 
                        borderWidth: 1, 
                        borderColor: 'rgba(239, 68, 68, 0.3)', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        paddingHorizontal: 16, 
                        paddingVertical: 10 
                      }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444' }}>Xoá</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </AdminLayout>
  );
}
