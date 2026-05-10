import { Feather } from '@expo/vector-icons';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../Logo';

type Props = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSubmitSearch?: () => void;
};

export function HomeHeader({ searchValue, onSearchChange, onSubmitSearch }: Props) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ paddingTop: insets.top + 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Logo size="medium" showText={true} />

        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=60',
          }}
          style={{ 
            height: 44, 
            width: 44, 
            borderRadius: 9999,
            borderWidth: 2,
            borderColor: '#2A2A3A',
          }}
        />
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
        }}
      >
        <Feather name="search" size={20} color="#8888A0" />
        <TextInput
          style={{ 
            marginLeft: 12, 
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
