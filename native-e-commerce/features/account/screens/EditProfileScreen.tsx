import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from '~/components/ToastProvider';
import { fetchCurrentUser, updateUserProfile, uploadAvatar } from '~/lib/api/users';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import { getAccessToken } from '~/lib/api/token';

export default function EditProfileScreen() {
  const router = useRouter();
  const { addToast } = useToast();
  const locale = getAppLocale();
  const L = strings(locale);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setNeedLogin(false);
    
    try {
      const token = await getAccessToken();
      if (!token) {
        setNeedLogin(true);
        setLoading(false);
        return;
      }

      const user = await fetchCurrentUser();
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setTempAvatarUri(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setNeedLogin(true);
      } else {
        const msg = resolveApiError(e, locale);
        addToast('error', 'Lỗi', msg);
      }
    } finally {
      setLoading(false);
    }
  }, [locale, addToast]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Show optimistic UI
        setTempAvatarUri(imageUri);
        setUploadingAvatar(true);

        try {
          // Upload to backend
          const updatedUser = await uploadAvatar(imageUri);
          
          // Update with server URL
          setAvatar(updatedUser.avatar || '');
          setTempAvatarUri(null);
          
          addToast('success', 'Thành công', 'Ảnh đại diện đã được cập nhật');
        } catch (error) {
          // Revert optimistic update
          setTempAvatarUri(null);
          
          const errorMsg = error instanceof Error ? error.message : 'Không thể tải ảnh lên';
          addToast('error', 'Lỗi', errorMsg);
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      addToast('error', 'Lỗi', 'Không thể mở thư viện ảnh');
    }
  };

  const handleSave = async () => {
    // Validate name
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        // Don't update avatar here - it's handled by upload
      });
      
      addToast('success', 'Thành công', 'Hồ sơ đã được cập nhật');
      setTimeout(() => router.back(), 800);
    } catch (e) {
      const msg = resolveApiError(e, locale);
      addToast('error', 'Lỗi', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chỉnh sửa hồ sơ', headerShown: false }} />
        <View className="flex-1 bg-bg-primary items-center justify-center">
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text className="mt-3 text-sm text-text-secondary">{L.common.loading}</Text>
        </View>
      </>
    );
  }

  if (needLogin) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chỉnh sửa hồ sơ', headerShown: false }} />
        <View className="flex-1 bg-bg-primary items-center justify-center px-6">
          <Ionicons name="lock-closed-outline" size={64} color="#8888A0" />
          <Text className="mt-4 text-lg font-bold text-text-primary">Cần đăng nhập</Text>
          <Text className="mt-2 text-sm text-center text-text-secondary">
            Bạn cần đăng nhập để chỉnh sửa hồ sơ
          </Text>
          <Pressable
            className="mt-6 bg-accent rounded-xl px-6 py-3"
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text className="text-sm font-bold text-white">Đăng nhập</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const displayAvatar = tempAvatarUri || avatar;

  return (
    <>
      <Stack.Screen options={{ title: 'Chỉnh sửa hồ sơ', headerShown: false }} />
      <View className="flex-1 bg-bg-primary">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="p-5">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6 mt-2">
              <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                <Ionicons name="arrow-back" size={24} color="#F0F0F5" />
              </Pressable>
              <Text className="text-xl font-bold text-text-primary">Chỉnh sửa hồ sơ</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Avatar Section */}
            <View className="items-center mb-8">
              <View className="relative">
                {/* Avatar Container */}
                <View
                  className="w-32 h-32 rounded-full overflow-hidden bg-bg-elevated items-center justify-center border-4 border-semantic-border"
                  style={{
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator size="large" color="#6C63FF" />
                  ) : displayAvatar ? (
                    <Image
                      source={{ uri: displayAvatar }}
                      className="w-32 h-32"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={64} color="#8888A0" />
                  )}
                </View>

                {/* Edit Button Badge */}
                <Pressable
                  onPress={handlePickImage}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-accent items-center justify-center border-4 border-bg-primary"
                  style={{
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              <Text className="mt-4 text-sm text-text-secondary text-center">
                Nhấn vào biểu tượng máy ảnh để thay đổi
              </Text>
            </View>

            {/* Form Section */}
            <View className="bg-bg-surface border border-semantic-border rounded-2xl p-5 mb-4">
              {/* Name Field */}
              <View className="mb-5">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="person-outline" size={18} color="#6C63FF" />
                  <Text className="font-semibold text-text-primary">Tên hiển thị *</Text>
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="rounded-xl border border-semantic-border bg-bg-elevated px-4 py-3 text-text-primary"
                  placeholderTextColor="#5A5A70"
                  placeholder="Nhập tên của bạn"
                  editable={!saving}
                />
              </View>

              {/* Phone Field */}
              <View className="mb-5">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="call-outline" size={18} color="#6C63FF" />
                  <Text className="font-semibold text-text-primary">Số điện thoại</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  className="rounded-xl border border-semantic-border bg-bg-elevated px-4 py-3 text-text-primary"
                  placeholderTextColor="#5A5A70"
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  editable={!saving}
                />
              </View>

              {/* Bio Field */}
              <View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="document-text-outline" size={18} color="#6C63FF" />
                  <Text className="font-semibold text-text-primary">Giới thiệu</Text>
                </View>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  className="rounded-xl border border-semantic-border bg-bg-elevated px-4 py-3 text-text-primary"
                  placeholderTextColor="#5A5A70"
                  placeholder="Viết vài dòng về bạn"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              className={`items-center rounded-2xl py-4 ${saving ? 'bg-accent/50' : 'bg-accent'}`}
              onPress={handleSave}
              disabled={saving}
              style={{
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {saving ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="font-bold text-white text-base">Đang lưu...</Text>
                </View>
              ) : (
                <Text className="font-bold text-white text-base">Lưu thay đổi</Text>
              )}
            </Pressable>

            {/* Info Note */}
            <View className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-4">
              <View className="flex-row gap-3">
                <Ionicons name="information-circle-outline" size={20} color="#6C63FF" />
                <View className="flex-1">
                  <Text className="text-sm text-text-secondary leading-5">
                    Ảnh đại diện được tải lên và lưu tự động. Email không thể thay đổi.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
