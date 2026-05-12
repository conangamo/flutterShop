import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import addressStorage from '~/features/account/services/addressStorage';
import { Address } from '@/lib/types/models';
import { AddressCard } from '~/components/address/AddressCard';

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
          className="mb-5 items-center rounded-2xl bg-accent py-4"
          style={{
            shadowColor: '#6C63FF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={() => router.push('/addresses/new')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
            <Text className="font-bold text-white text-[16px]">Thêm địa chỉ mới</Text>
          </View>
        </Pressable>

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ gap: 14 }}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              showActions
              onEdit={() => router.push(`/addresses/${item.id}/edit`)}
              onDelete={() => onDelete(item.id)}
            />
          )}
        />
      </View>
    </>
  );
}
