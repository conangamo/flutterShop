import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import addressStorage from '~/features/account/services/addressStorage';
import { Address } from '@/lib/types/models';

export default function AddressesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Address[]>([]);

  useEffect(() => {
    void refresh();
  }, []);

  // Refresh every time the screen gains focus (cover navigation back from the form)
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [])
  );

  async function refresh() {
    const list = await addressStorage.getAddresses();
    setItems(list);
  }

  function onDelete(id: string) {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await addressStorage.deleteAddress(id);
          void refresh();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-bg-primary p-4">
        <Pressable
          className="mb-4 items-center rounded-2xl bg-accent py-3.5"
          onPress={() => router.push('/addresses/new')}>
          <Text className="font-bold text-white text-[15px]">Thêm địa chỉ mới</Text>
        </Pressable>

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl border border-semantic-border bg-bg-surface p-4">
              <Text className="font-semibold text-text-primary">{item.name}</Text>
              <Text className="text-sm text-text-secondary">{item.phone}</Text>
              <Text className="mt-1 text-text-secondary">{item.address}</Text>
              <View className="mt-3 flex-row gap-3">
                <Pressable
                  className="rounded-xl bg-accent px-4 py-2"
                  onPress={() => router.push(`/addresses/${item.id}/edit`)}>
                  <Text className="text-white font-semibold">Sửa</Text>
                </Pressable>
                <Pressable
                  className="rounded-xl bg-accent-coral px-4 py-2"
                  onPress={() => onDelete(item.id)}>
                  <Text className="text-white font-semibold">Xóa</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}
