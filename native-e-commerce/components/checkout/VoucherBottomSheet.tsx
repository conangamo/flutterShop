import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { AvailableVoucher, VoucherValidationResult } from '~/lib/api/orders';
import { fetchAvailableVouchers, validateVoucher } from '~/lib/api/orders';
import { formatCurrency } from '~/lib/utils/formatters';

type VoucherBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (code: string, discountAmount: number) => void;
  currentSubtotal: number;
  appliedCode?: string;
};

export function VoucherBottomSheet({
  visible,
  onClose,
  onApply,
  currentSubtotal,
  appliedCode,
}: VoucherBottomSheetProps) {
  const [manualCode, setManualCode] = useState('');
  const [vouchers, setVouchers] = useState<AvailableVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void loadVouchers();
      setManualCode('');
      setValidationError(null);
    }
  }, [visible, loadVouchers]);

  const handleValidateAndApply = async (code: string) => {
    if (!code.trim()) return;

    setValidating(true);
    setValidationError(null);

    try {
      const result: VoucherValidationResult = await validateVoucher(code.trim().toUpperCase(), currentSubtotal);

      if (result.valid && result.discountAmount) {
        onApply(result.code, result.discountAmount);
        onClose();
      } else {
        setValidationError(result.errorMessage || 'Mã giảm giá không hợp lệ');
      }
    } catch (error: any) {
      setValidationError(error?.message || 'Không thể xác thực mã giảm giá');
    } finally {
      setValidating(false);
    }
  };

  const getVoucherDescription = (voucher: AvailableVoucher): string => {
    if (voucher.discountType === 'percent') {
      const maxText = voucher.maxDiscount ? ` (tối đa ${formatCurrency(voucher.maxDiscount)})` : '';
      return `Giảm ${voucher.discountValue}%${maxText}`;
    }
    return `Giảm ${formatCurrency(voucher.discountValue)}`;
  };

  const isVoucherApplicable = (voucher: AvailableVoucher): boolean => {
    return currentSubtotal >= voucher.minOrderTotal;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60"
        onPress={onClose}
      >
        <Pressable
          className="absolute bottom-0 left-0 right-0 max-h-[85%] rounded-t-[32px] bg-bg-surface"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-semantic-border px-6 py-5">
            <Text className="text-[20px] font-bold text-text-primary">Chọn mã giảm giá</Text>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center">
              <Ionicons name="close" size={28} color="#8888A0" />
            </Pressable>
          </View>

          {/* Manual Input Section */}
          <View className="border-b border-semantic-border px-6 py-5">
            <Text className="mb-3 text-[14px] font-semibold text-text-primary">
              Nhập mã giảm giá
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <TextInput
                  value={manualCode}
                  onChangeText={(text) => {
                    setManualCode(text);
                    setValidationError(null);
                  }}
                  placeholder="Nhập mã..."
                  placeholderTextColor="#8888A0"
                  autoCapitalize="characters"
                  className="rounded-[16px] border border-semantic-border bg-bg-elevated px-4 py-3.5 text-[15px] font-medium text-text-primary"
                />
              </View>
              <Pressable
                onPress={() => handleValidateAndApply(manualCode)}
                disabled={!manualCode.trim() || validating}
                className="rounded-[16px] bg-accent px-6 py-3.5"
                style={{
                  opacity: !manualCode.trim() || validating ? 0.5 : 1,
                }}
              >
                {validating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-[14px] font-bold text-white">Áp dụng</Text>
                )}
              </Pressable>
            </View>
            {validationError ? (
              <View className="mt-3 flex-row items-center gap-2 rounded-[12px] bg-semantic-error/10 px-3 py-2.5">
                <Ionicons name="alert-circle" size={18} color="#FF6584" />
                <Text className="flex-1 text-[13px] font-medium text-semantic-error">
                  {validationError}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Available Vouchers List */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="mb-4 text-[14px] font-semibold text-text-primary">
              Mã giảm giá khả dụng
            </Text>

            {loading ? (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color="#6C63FF" />
              </View>
            ) : vouchers.length === 0 ? (
              <View className="items-center rounded-[20px] bg-bg-elevated py-10">
                <Ionicons name="ticket-outline" size={48} color="#8888A0" />
                <Text className="mt-3 text-[14px] text-text-secondary">
                  Không có mã giảm giá khả dụng
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {vouchers.map((voucher) => {
                  const applicable = isVoucherApplicable(voucher);
                  const isApplied = appliedCode === voucher.code;

                  return (
                    <Pressable
                      key={voucher.id}
                      onPress={() => {
                        if (applicable) {
                          void handleValidateAndApply(voucher.code);
                        }
                      }}
                      disabled={!applicable || validating}
                      className="overflow-hidden rounded-[20px] border border-semantic-border bg-bg-elevated"
                      style={{
                        opacity: applicable ? 1 : 0.6,
                      }}
                    >
                      <View className="flex-row">
                        {/* Left Accent Bar */}
                        <View
                          className="w-2"
                          style={{
                            backgroundColor: isApplied ? '#3ECF8E' : applicable ? '#6C63FF' : '#8888A0',
                          }}
                        />

                        {/* Content */}
                        <View className="flex-1 p-4">
                          <View className="flex-row items-start justify-between">
                            <View className="flex-1">
                              {/* Code Badge */}
                              <View className="mb-2 self-start rounded-[10px] bg-accent/15 px-3 py-1.5">
                                <Text className="text-[13px] font-bold text-accent">
                                  {voucher.code}
                                </Text>
                              </View>

                              {/* Description */}
                              <Text className="mb-1 text-[16px] font-bold text-text-primary">
                                {getVoucherDescription(voucher)}
                              </Text>

                              {/* Min Order */}
                              <Text className="text-[13px] text-text-secondary">
                                Đơn tối thiểu: {formatCurrency(voucher.minOrderTotal)}
                              </Text>

                              {/* Expiry */}
                              {voucher.endsAt ? (
                                <Text className="mt-1 text-[12px] text-text-tertiary">
                                  HSD: {new Date(voucher.endsAt).toLocaleDateString('vi-VN')}
                                </Text>
                              ) : null}

                              {/* Not Applicable Message */}
                              {!applicable ? (
                                <View className="mt-2 flex-row items-center gap-1.5">
                                  <Ionicons name="information-circle" size={14} color="#FF6584" />
                                  <Text className="text-[12px] font-medium text-semantic-error">
                                    Chưa đủ điều kiện
                                  </Text>
                                </View>
                              ) : null}
                            </View>

                            {/* Status Icon */}
                            <View className="ml-3">
                              {isApplied ? (
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-semantic-success">
                                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                                </View>
                              ) : applicable ? (
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                                  <Ionicons name="arrow-forward" size={20} color="#6C63FF" />
                                </View>
                              ) : (
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-bg-surface">
                                  <Ionicons name="lock-closed" size={20} color="#8888A0" />
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
