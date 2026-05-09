import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '~/components/Button';
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
          headerShadowVisible: false,
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
              <Text className="mt-6 text-[15px] text-text-secondary">
                Chưa có địa chỉ nào. Mở sổ địa chỉ hoặc thêm mới bên dưới.
              </Text>
            ) : (
              <View className="mt-5 gap-3">
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;

                  return (
                    <Pressable
                      key={address.id}
                      onPress={() => setSelectedAddressId(address.id)}
                      className={`rounded-2xl border p-4 ${
                        isSelected ? 'border-accent bg-accent/10' : 'border-semantic-border bg-bg-surface'
                      }`}>
                      <View className="flex-row items-start gap-3">
                        <View
                          className={`mt-0.5 h-11 w-11 items-center justify-center rounded-full ${
                            isSelected ? 'bg-accent' : 'bg-bg-elevated'
                          }`}>
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#8888A0'}
                          />
                        </View>

                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className={`text-[15px] font-semibold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                              {address.name}
                            </Text>
                            {address.isDefault ? (
                              <View className="rounded-full bg-semantic-success/10 border border-semantic-success/25 px-2 py-1">
                                <Text className="text-[10px] font-semibold text-semantic-success">
                                  Mặc định
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          <Text className="mt-1 text-[13px] leading-[20px] text-text-secondary">
                            {address.address}
                          </Text>
                          <Text className="mt-1 text-[13px] text-text-secondary">
                            {address.city} • {address.phone}
                          </Text>
                        </View>

                        {isSelected && (
                          <View className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent items-center justify-center">
                            <Text className="text-white text-xs font-extrabold">✓</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View className="mt-5 rounded-2xl bg-bg-surface border border-semantic-border p-4">
              <Text className="text-[16px] font-semibold text-text-primary">Địa chỉ đã chọn</Text>
              <Text className="mt-3 text-[14px] font-semibold text-text-primary">
                {selectedAddress?.name ?? '—'}
              </Text>
              <Text className="mt-1 text-[13px] leading-[20px] text-text-secondary">
                {selectedAddress?.address ?? ''}
              </Text>
              <Text className="mt-1 text-[13px] text-text-secondary">
                {selectedAddress ? `${selectedAddress.city} • ${selectedAddress.phone}` : ''}
              </Text>
            </View>

            <View className="mt-5 gap-3">
              <Button title="Sử dụng địa chỉ này" onPress={handleUseAddress} />
              <Pressable
                className="items-center rounded-2xl border border-dashed border-accent py-4"
                onPress={() => router.push('/addresses/new')}>
                <Text className="text-[15px] font-semibold text-accent">Thêm địa chỉ mới</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
