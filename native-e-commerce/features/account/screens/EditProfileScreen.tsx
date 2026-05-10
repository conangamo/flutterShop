import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import { useToast } from '~/components/ToastProvider';

export default function EditProfileScreen() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState('Võ Tấn Đức');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  function save() {
    addToast('success', 'Đã lưu', 'Hồ sơ đã được cập nhật');
    setTimeout(() => router.back(), 1200);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-bg-primary p-4">
        <Text className="mb-2 font-semibold text-text-primary">Tên</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="mb-3 rounded-button border border-semantic-border bg-bg-elevated p-3 text-text-primary"
          placeholderTextColor="#8888A0"
        />

        <Text className="mb-2 font-semibold text-text-primary">Giới thiệu</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          className="mb-3 rounded-button border border-semantic-border bg-bg-elevated p-3 text-text-primary"
          placeholderTextColor="#8888A0"
        />

        <Text className="mb-2 font-semibold text-text-primary">URL ảnh đại diện</Text>
        <TextInput
          value={avatar}
          onChangeText={setAvatar}
          className="mb-3 rounded-button border border-semantic-border bg-bg-elevated p-3 text-text-primary"
          placeholderTextColor="#8888A0"
        />

        <Pressable className="mt-4 items-center rounded-button bg-accent py-3" onPress={save}>
          <Text className="font-semibold text-white">Lưu</Text>
        </Pressable>
      </View>
    </>
  );
}
