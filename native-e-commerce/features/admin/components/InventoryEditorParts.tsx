import { type Dispatch, type ReactNode, type SetStateAction, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { AppInput } from '~/components/ui/AppInput';
import { type AdminProductDetail, type AdminProductRow } from '~/lib/api/admin';
import { formatCurrency } from '~/lib/utils/formatters';

export type ProductFormState = {
  id: string;
  name: string;
  slug: string;
  description: string;
  defaultImage: string;
  basePrice: string;
  brand: string;
};

export type EditProductFormState = {
  name: string;
  slug: string;
  description: string;
  defaultImage: string;
  basePrice: string;
  brand: string;
};

export type VariantFormState = {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
  image: string;
};

export type VariantFormsMap = Record<
  string,
  { sku: string; size: string; color: string; price: string; stock: string; image: string }
>;

export function InventoryToolbar({
  activeFilter,
  onCreate,
  onFilterChange,
}: {
  activeFilter: 'all' | 'low' | 'out';
  onCreate: () => void;
  onFilterChange: (v: 'all' | 'low' | 'out') => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ borderBottomWidth: 1, borderBottomColor: '#2A2A3A', backgroundColor: '#13131A', paddingHorizontal: 16, paddingVertical: 14 }}
      contentContainerStyle={{ paddingRight: 8 }}>
      <View className="flex-row gap-2">
        <Pressable
          onPress={onCreate}
          style={{ borderRadius: 9999, borderWidth: 1, borderColor: '#6C63FF', backgroundColor: 'rgba(108, 99, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#6C63FF' }}>+ Tạo sản phẩm</Text>
        </Pressable>
        {(
          [
            { id: 'all', label: 'Tất cả' },
            { id: 'low', label: 'Sắp hết (≤5)' },
            { id: 'out', label: 'Hết hàng' },
          ] as const
        ).map((opt) => {
          const active = activeFilter === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onFilterChange(opt.id)}
              style={{
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: active ? '#6C63FF' : '#2A2A3A',
                backgroundColor: active ? 'rgba(108, 99, 255, 0.1)' : '#13131A',
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#6C63FF' : '#8888A0' }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function CreateProductModal({
  visible,
  form,
  onClose,
  onChange,
  onSubmit,
}: {
  visible: boolean;
  form: ProductFormState;
  onClose: () => void;
  onChange: Dispatch<SetStateAction<ProductFormState>>;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="max-h-[85%] w-full max-w-[520px] rounded-[24px] bg-white p-5">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-[20px] font-semibold text-[#1F2937]">Tạo sản phẩm mới</Text>
            <Text className="mt-1 text-[13px] text-[#6B7280]">
              Điền thông tin cơ bản để khởi tạo sản phẩm trong catalog.
            </Text>
            <View className="mt-4 gap-2">
              <AppInput label="ID sản phẩm" value={form.id} onChangeText={(v) => onChange((prev) => ({ ...prev, id: v }))} />
              <AppInput label="Tên sản phẩm" value={form.name} onChangeText={(v) => onChange((prev) => ({ ...prev, name: v }))} />
              <AppInput label="Đường dẫn (Slug)" value={form.slug} onChangeText={(v) => onChange((prev) => ({ ...prev, slug: v }))} />
              <AppInput label="Giá cơ bản" keyboardType="numeric" value={form.basePrice} onChangeText={(v) => onChange((prev) => ({ ...prev, basePrice: v.replace(/[^0-9]/g, '') }))} />
              <AppInput label="Mô tả" value={form.description} onChangeText={(v) => onChange((prev) => ({ ...prev, description: v }))} />
            </View>
            <View className="mt-5 flex-row flex-wrap justify-end gap-2">
              <Pressable onPress={onClose} className="rounded-full bg-[#F3F4F6] px-4 py-2.5">
                <Text className="text-[12px] font-semibold text-[#374151]">Hủy</Text>
              </Pressable>
              <Pressable onPress={onSubmit} className="rounded-full bg-[#F97316] px-4 py-2.5">
                <Text className="text-[12px] font-semibold text-white">Tạo</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ActionRow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <View className="mt-1 flex-row flex-wrap gap-2">
      {children}
    </View>
  );
}

export function ProductCard({
  product,
  isActive,
  variants,
  selected,
  savingVariantId,
  variantForms,
  editProductForm,
  newVariantForm,
  onToggleSelect,
  onVariantStockChange,
  onSaveVariant,
  onEditFormChange,
  onSaveProduct,
  onToggleActive,
  onDeleteProduct,
  onNewVariantFormChange,
  onCreateVariant,
}: {
  product: AdminProductRow;
  isActive: boolean;
  variants: AdminProductDetail['variants'];
  selected: boolean;
  savingVariantId: string | null;
  variantForms: VariantFormsMap;
  editProductForm: EditProductFormState;
  newVariantForm: VariantFormState;
  onToggleSelect: () => void;
  onVariantStockChange: (variantId: string, stock: string) => void;
  onSaveVariant: (variant: AdminProductDetail['variants'][number]) => Promise<void>;
  onEditFormChange: Dispatch<SetStateAction<EditProductFormState>>;
  onSaveProduct: () => void;
  onToggleActive: () => void;
  onDeleteProduct: () => void;
  onNewVariantFormChange: Dispatch<SetStateAction<VariantFormState>>;
  onCreateVariant: () => void;
}) {
  return (
    <View style={{ backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#F0F0F5' }} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: '#8888A0' }}>
            {formatCurrency(product.basePrice)} · Tồn kho: {product.totalStock ?? '—'}
          </Text>
        </View>
        <Pressable onPress={onToggleSelect} style={{ borderRadius: 9999, backgroundColor: '#1C1C28', paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#F0F0F5' }}>Sửa</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16, gap: 12 }}>
        {variants.map((v) => (
          <VariantRow
            key={v.id}
            variant={v}
            stockValue={variantForms[v.id]?.stock ?? String(v.stock)}
            canSave={variantForms[v.id] != null && savingVariantId !== v.id}
            saving={savingVariantId === v.id}
            onStockChange={(val) => onVariantStockChange(v.id, val)}
            onSave={() => void onSaveVariant(v)}
          />
        ))}
      </View>

      {selected ? (
        <ProductEditorPanel
          isActive={isActive}
          editProductForm={editProductForm}
          newVariantForm={newVariantForm}
          onEditFormChange={onEditFormChange}
          onSaveProduct={onSaveProduct}
          onToggleActive={onToggleActive}
          onDeleteProduct={onDeleteProduct}
          onNewVariantFormChange={onNewVariantFormChange}
          onCreateVariant={onCreateVariant}
        />
      ) : null}
    </View>
  );
}

function VariantRow({
  variant,
  stockValue,
  canSave,
  saving,
  onStockChange,
  onSave,
}: {
  variant: AdminProductDetail['variants'][number];
  stockValue: string;
  canSave: boolean;
  saving: boolean;
  onStockChange: (val: string) => void;
  onSave: () => void;
}) {
  const lowStock = variant.stock <= 5;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, backgroundColor: '#1C1C28', padding: 14 }}>
      <View className="flex-1">
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#F0F0F5' }}>
          {variant.size ? `Size ${variant.size}` : 'Mặc định'}
          {variant.color ? ` · ${variant.color}` : ''}
        </Text>
        <Text style={{ fontSize: 12, color: '#8888A0', marginTop: 2 }}>SKU: {variant.sku}</Text>
      </View>
      <AppInput
        value={stockValue}
        onChangeText={(t) => onStockChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        className={`h-9 w-16 px-2 py-0 text-center text-[13px] font-semibold ${
          lowStock ? 'border-[#FCA5A5] text-[#B91C1C]' : 'border-[#E5E7EB] text-[#1F2937]'
        }`}
      />
      <Pressable
        disabled={!canSave}
        onPress={onSave}
        style={{
          borderRadius: 9999,
          backgroundColor: canSave ? '#6C63FF' : '#444455',
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
          {saving ? '...' : 'Lưu'}
        </Text>
      </Pressable>
    </View>
  );
}

function ProductEditorPanel({
  isActive,
  editProductForm,
  newVariantForm,
  onEditFormChange,
  onSaveProduct,
  onToggleActive,
  onDeleteProduct,
  onNewVariantFormChange,
  onCreateVariant,
}: {
  isActive: boolean;
  editProductForm: EditProductFormState;
  newVariantForm: VariantFormState;
  onEditFormChange: Dispatch<SetStateAction<EditProductFormState>>;
  onSaveProduct: () => void;
  onToggleActive: () => void;
  onDeleteProduct: () => void;
  onNewVariantFormChange: Dispatch<SetStateAction<VariantFormState>>;
  onCreateVariant: () => void;
}) {
  return (
    <View className="mt-4 rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <Text className="mb-3 text-[14px] font-semibold text-[#1F2937]">Thông tin sản phẩm</Text>
      <View className="gap-2">
        <AppInput label="Tên" value={editProductForm.name} onChangeText={(v) => onEditFormChange((prev) => ({ ...prev, name: v }))} />
        <AppInput label="Đường dẫn (Slug)" value={editProductForm.slug} onChangeText={(v) => onEditFormChange((prev) => ({ ...prev, slug: v }))} />
        <AppInput label="Giá cơ bản" value={editProductForm.basePrice} keyboardType="numeric" onChangeText={(v) => onEditFormChange((prev) => ({ ...prev, basePrice: v.replace(/[^0-9]/g, '') }))} />
        <AppInput label="Thương hiệu" value={editProductForm.brand} onChangeText={(v) => onEditFormChange((prev) => ({ ...prev, brand: v }))} />
        <AppInput label="Ảnh mặc định URL" value={editProductForm.defaultImage} onChangeText={(v) => onEditFormChange((prev) => ({ ...prev, defaultImage: v }))} />
        <AppInput label="Mô tả" value={editProductForm.description} onChangeText={(v) => onEditFormChange((prev) => ({ ...prev, description: v }))} />
        <ActionRow>
          <Pressable onPress={onSaveProduct} className="rounded-full bg-[#F97316] px-3 py-2">
            <Text className="text-[12px] font-semibold text-white">Lưu sản phẩm</Text>
          </Pressable>
          <Pressable onPress={onToggleActive} className="rounded-full bg-[#F3F4F6] px-3 py-2">
            <Text className="text-[12px] font-semibold text-[#374151]">{isActive ? 'Tạm ngưng' : 'Bật bán'}</Text>
          </Pressable>
          <Pressable onPress={onDeleteProduct} className="rounded-full bg-[#FEE2E2] px-3 py-2">
            <Text className="text-[12px] font-semibold text-[#B91C1C]">Xóa</Text>
          </Pressable>
        </ActionRow>
      </View>

      <Text className="mb-3 mt-5 text-[14px] font-semibold text-[#1F2937]">Thêm biến thể mới</Text>
      <View className="gap-2">
        <AppInput label="ID biến thể" value={newVariantForm.id} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, id: v }))} />
        <AppInput label="Mã SKU" value={newVariantForm.sku} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, sku: v }))} />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppInput label="Kích cỡ" value={newVariantForm.size} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, size: v }))} />
          </View>
          <View className="flex-1">
            <AppInput label="Màu sắc" value={newVariantForm.color} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, color: v }))} />
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppInput label="Giá" keyboardType="numeric" value={newVariantForm.price} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, price: v.replace(/[^0-9]/g, '') }))} />
          </View>
          <View className="flex-1">
            <AppInput label="Tồn kho" keyboardType="numeric" value={newVariantForm.stock} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, stock: v.replace(/[^0-9]/g, '') }))} />
          </View>
        </View>
        <AppInput label="URL hình ảnh" value={newVariantForm.image} onChangeText={(v) => onNewVariantFormChange((prev) => ({ ...prev, image: v }))} />
        <Pressable onPress={onCreateVariant} className="rounded-full bg-[#111827] px-3 py-2">
          <Text className="text-center text-[12px] font-semibold text-white">Tạo biến thể</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ConfirmModal({
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
  const [submitting, setSubmitting] = useState(false);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="max-h-[80%] w-full max-w-[460px] rounded-[22px] bg-white p-5">
          <Text className="text-[20px] font-semibold text-[#111827]">{title}</Text>
          <Text className="mt-1 text-[13px] text-[#6B7280]">Thao tác này ảnh hưởng dữ liệu đang hiển thị.</Text>
          <ScrollView className="mt-3 max-h-[220px]" showsVerticalScrollIndicator={false}>
            <Text className="text-[13px] text-[#6B7280]">{body}</Text>
          </ScrollView>
          <View className="mt-5 flex-row flex-wrap justify-end gap-2">
            <Pressable onPress={onClose} className="rounded-full bg-[#F3F4F6] px-4 py-2.5">
              <Text className="text-[12px] font-semibold text-[#374151]">Huỷ</Text>
            </Pressable>
            <Pressable
              disabled={submitting}
              onPress={async () => {
                setSubmitting(true);
                try {
                  await onConfirm();
                } finally {
                  setSubmitting(false);
                }
              }}
              className="rounded-full bg-[#DC2626] px-4 py-2.5">
              <Text className="text-[12px] font-semibold text-white">{submitting ? '...' : 'Xác nhận'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
