import { Feather, Ionicons } from '@expo/vector-icons';
import { Alert, Image, TextInput, TouchableOpacity, View, ActionSheetIOS, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { fetchCurrentUser } from '~/lib/api/users';
import { getAccessToken } from '~/lib/api/token';

type Props = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSubmitSearch?: () => void;
  onVisualSearch?: (imageUri: string) => void;
};

export function HomeHeader({ searchValue, onSearchChange, onSubmitSearch, onVisualSearch }: Props) {
  const insets = useSafeAreaInsets();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const user = await fetchCurrentUser();
          setUserAvatar(user.avatar);
        }
      } catch (error) {
        // Silently fail - user might not be logged in
        console.log('Could not load user avatar:', error);
      } finally {
        setAvatarLoading(false);
      }
    };
    void loadUserAvatar();
  }, []);
  
  const handleVisualSearch = async () => {
    // Request permissions first
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Show options to user
    const showOptions = () => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Hủy', 'Chụp ảnh', 'Chọn từ thư viện'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await launchCamera();
            } else if (buttonIndex === 2) {
              await launchLibrary();
            }
          }
        );
      } else {
        Alert.alert(
          'Tìm kiếm bằng hình ảnh',
          'Chọn nguồn hình ảnh',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Chụp ảnh', onPress: launchCamera },
            { text: 'Chọn từ thư viện', onPress: launchLibrary },
          ]
        );
      }
    };

    const launchCamera = async () => {
      if (cameraStatus !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && onVisualSearch) {
        onVisualSearch(result.assets[0].uri);
      }
    };

    const launchLibrary = async () => {
      if (libraryStatus !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn hình.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && onVisualSearch) {
        onVisualSearch(result.assets[0].uri);
      }
    };

    showOptions();
  };
  
  return (
    <View style={{ paddingTop: insets.top + 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Logo size="medium" showText={true} />

        <View
          style={{ 
            height: 44, 
            width: 44, 
            borderRadius: 9999,
            borderWidth: 2,
            borderColor: '#2A2A3A',
            backgroundColor: '#1C1C28',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {avatarLoading ? (
            <ActivityIndicator size="small" color="#6C63FF" />
          ) : userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={{ 
                height: 44, 
                width: 44,
              }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="#8888A0" />
          )}
        </View>
      </View>

      <View 
        style={{ 
          height: 52, 
          flexDirection: 'row', 
          alignItems: 'center', 
          borderRadius: 16, 
          backgroundColor: '#1C1C28', 
          borderWidth: 1, 
          borderColor: '#2A2A3A', 
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 4,
          gap: 8,
        }}
      >
        <Feather name="search" size={20} color="#8888A0" />
        <TextInput
          style={{ 
            marginLeft: 4, 
            flex: 1, 
            fontSize: 15, 
            color: '#F0F0F5',
            fontWeight: '500',
          }}
          placeholder="Tìm giày sneaker, boot, sandal..."
          placeholderTextColor="#5A5A70"
          value={searchValue}
          onChangeText={onSearchChange}
          onSubmitEditing={onSubmitSearch}
          returnKeyType="search"
        />
        
        {/* Camera Icon for Visual Search */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={handleVisualSearch}
          style={{ 
            height: 32, 
            width: 32, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 101, 132, 0.1)',
          }}
        >
          <Ionicons name="camera-outline" size={18} color="#FF6584" />
        </TouchableOpacity>
        
        {/* Microphone Icon for Voice Search */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={{ 
            height: 32, 
            width: 32, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: 'rgba(108, 99, 255, 0.1)',
          }}
        >
          <Feather name="mic" size={18} color="#6C63FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
