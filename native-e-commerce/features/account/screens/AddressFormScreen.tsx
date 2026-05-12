import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
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
  const [loadingLocation, setLoadingLocation] = useState(false);

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

  async function useCurrentLocation() {
    setLoadingLocation(true);
    try {
      // Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        addToast('error', 'Quyền truy cập', 'Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng này');
        setLoadingLocation(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocoded && geocoded.length > 0) {
        const place = geocoded[0];
        
        // Build address string from components
        const streetParts = [
          place.streetNumber,
          place.street,
        ].filter(Boolean);
        
        const fullAddress = [
          streetParts.join(' '),
          place.district,
          place.subregion,
        ].filter(Boolean).join(', ');

        // Populate form fields
        setAddress(fullAddress || place.name || `${location.coords.latitude}, ${location.coords.longitude}`);
        setCity(place.city || place.region || 'Việt Nam');
        
        addToast('success', 'Thành công', 'Đã lấy vị trí hiện tại của bạn');
      } else {
        addToast('warning', 'Không tìm thấy', 'Không thể xác định địa chỉ từ vị trí hiện tại');
      }
    } catch (error) {
      console.error('Location error:', error);
      addToast('error', 'Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại');
    } finally {
      setLoadingLocation(false);
    }
  }

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
        {/* GPS Location Button */}
        <Pressable
          onPress={useCurrentLocation}
          disabled={loadingLocation}
          style={{
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: '#6C63FF',
            backgroundColor: 'rgba(108, 99, 255, 0.08)',
            paddingVertical: 16,
            shadowColor: '#6C63FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
          }}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#6C63FF" />
          ) : (
            <Ionicons name="navigate-circle" size={26} color="#6C63FF" />
          )}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#6C63FF',
              letterSpacing: 0.3,
            }}>
            {loadingLocation ? 'Đang lấy vị trí...' : 'Sử dụng vị trí hiện tại'}
          </Text>
        </Pressable>

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
          multiline
          numberOfLines={2}
        />

        <Text className="mb-2 font-semibold text-text-secondary text-xs uppercase tracking-widest">Thành phố</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          className="mb-3 rounded-xl border border-semantic-border bg-bg-elevated p-3.5 text-text-primary"
          placeholderTextColor="#8888A0"
          placeholder="Nhập thành phố"
        />

        <Pressable
          className="mt-4 items-center rounded-2xl bg-accent py-4"
          style={{
            shadowColor: '#6C63FF',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={save}>
          <Text className="font-bold text-white text-[16px]">Lưu địa chỉ</Text>
        </Pressable>
      </View>
    </>
  );
}
