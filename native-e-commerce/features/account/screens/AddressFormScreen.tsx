import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import addressStorage from '~/features/account/services/addressStorage';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import { useToast } from '~/components/ToastProvider';

export default function AddressFormScreen() {
  const locale = getAppLocale();
  const L = strings(locale);
  const router = useRouter();
  const { addToast } = useToast();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const a = await addressStorage.getAddressById(id);
      if (a) {
        setName(a.name);
        setPhone(a.phone);
        setAddress(a.address);
        setCity(a.city ?? '');
      }
    })();
  }, [id]);

  async function save() {
    if (!name || !phone || !address) {
      addToast('warning', L.errors.addressMissingTitle, L.errors.addressMissingBody);
      return;
    }
    try {
      if (id) {
        await addressStorage.saveAddress({ id, name, phone, address, city, isDefault: false });
      } else {
        await addressStorage.createAddressPartial({ name, phone, address, city, isDefault: false });
      }
      addToast('success', L.common.success, 'Đã lưu địa chỉ');
      setTimeout(() => router.replace('/addresses'), 1200);
    } catch (e) {
      const msg = e instanceof ApiError ? resolveApiError(e, locale) : L.errors.addressSaveFailed;
      addToast('error', L.common.error, msg);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-bg-primary p-4">
        <Text className="mb-2 font-semibold text-text-secondary text-xs uppercase tracking-widest">Tên người nhận</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="mb-3 rounded-xl border border-semantic-border bg-bg-elevated p-3.5 text-text-primary"
          placeholderTextColor="#8888A0"
          placeholder="Nhập tên người nhận"
        />

        <Text className="mb-2 font-semibold text-text-secondary text-xs uppercase tracking-widest">Số điện thoại</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          className="mb-3 rounded-xl border border-semantic-border bg-bg-elevated p-3.5 text-text-primary"
          keyboardType="phone-pad"
          placeholderTextColor="#8888A0"
          placeholder="Nhập số điện thoại"
        />

        <Text className="mb-2 font-semibold text-text-secondary text-xs uppercase tracking-widest">Địa chỉ</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          className="mb-3 rounded-xl border border-semantic-border bg-bg-elevated p-3.5 text-text-primary"
          placeholderTextColor="#8888A0"
          placeholder="Nhập địa chỉ chi tiết"
        />

        <Text className="mb-2 font-semibold text-text-secondary text-xs uppercase tracking-widest">Thành phố</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          className="mb-3 rounded-xl border border-semantic-border bg-bg-elevated p-3.5 text-text-primary"
          placeholderTextColor="#8888A0"
          placeholder="Nhập thành phố"
        />

        <Pressable className="mt-4 items-center rounded-2xl bg-accent py-3.5" onPress={save}>
          <Text className="font-bold text-white text-[15px]">Lưu địa chỉ</Text>
        </Pressable>
      </View>
    </>
  );
}
