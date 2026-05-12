import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '~/components/Button';
import { AddressCard } from '~/components/address/AddressCard';
import { getAddresses } from '~/features/account/services/addressStorage';
import type { Address } from '~/lib/types/models';
import { useToast } from '~/components/ToastProvider';

export default function AddressScreen() {
  const router = useRouter();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const refresh = useCallback(async () => {
    try {
      const list = await getAddresses();
      setAddresses(list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      setSelectedAddressId((prev) => {
        if (prev && list.some((a) => a.id === prev)) return prev;
        return def?.id ?? '';
      });
    } catch {
      addToast('error', 'Lỗi địa chỉ', 'Không tải được địa chỉ — kiểm tra đăng nhập và API.');
      setAddresses([]);
    }
  }, [addToast]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? addresses[0];

  const handleUseAddress = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Địa chỉ giao hàng',
          headerShown: false,
        }}
      />

      <View className="flex-1 bg-bg-primary">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 pb-8 pt-3">
            <Text className="text-[13px] uppercase tracking-[3px] text-accent">
              Chi tiết giao hàng
            </Text>
            <Text className="mt-2 text-[30px] font-bold text-text-primary">Sổ địa chỉ</Text>
            <Text className="mt-2 text-[14px] leading-[22px] text-text-secondary">
              Chọn địa chỉ bạn muốn nhận hàng.
            </Text>

            {addresses.length === 0 ? (
              <View className="mt-6 rounded-2xl bg-bg-surface border border-semantic-border p-6">
                <Text className="text-center text-[15px] text-text-secondary">
                  Chưa có địa chỉ nào. Mở sổ địa chỉ hoặc thêm mới bên dưới.
                </Text>
              </View>
            ) : (
              <View className="mt-5" style={{ gap: 14 }}>
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={address.id === selectedAddressId}
                    onPress={() => setSelectedAddressId(address.id)}
                  />
                ))}
              </View>
            )}

            <View className="mt-5 rounded-[24px] bg-bg-surface border border-semantic-border p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="checkmark-circle" size={22} color="#6C63FF" />
                <Text className="text-[17px] font-bold text-text-primary">Địa chỉ đã chọn</Text>
              </View>
              {selectedAddress ? (
                <View className="rounded-[18px] bg-bg-elevated border border-semantic-border p-4">
                  <Text className="text-[15px] font-bold text-text-primary mb-2">
                    {selectedAddress.name}
                  </Text>
                  <View className="flex-row items-start gap-2 mb-1">
                    <Ionicons name="location-outline" size={16} color="#8888A0" style={{ marginTop: 2 }} />
                    <Text className="flex-1 text-[14px] leading-[21px] text-text-secondary">
                      {selectedAddress.address}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="call-outline" size={14} color="#8888A0" />
                    <Text className="text-[13px] text-text-secondary">
                      {selectedAddress.city} • {selectedAddress.phone}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-[14px] text-text-secondary text-center py-3">
                  Chưa chọn địa chỉ
                </Text>
              )}
            </View>

            <View className="mt-5 gap-3">
              <Button title="Sử dụng địa chỉ này" onPress={handleUseAddress} />
              <Pressable
                className="items-center rounded-2xl border-2 border-dashed border-accent/50 py-4"
                style={{
                  backgroundColor: 'rgba(108, 99, 255, 0.05)',
                }}
                onPress={() => router.push('/addresses/new')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="add-circle-outline" size={20} color="#6C63FF" />
                  <Text className="text-[15px] font-bold text-accent">Thêm địa chỉ mới</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
