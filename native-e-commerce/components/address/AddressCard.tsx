import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import type { Address } from '~/lib/types/models';

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function AddressCard({
  address,
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}: AddressCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 20,
        borderWidth: isSelected ? 2.5 : 1.5,
        borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
        backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.08)' : '#1C1C28',
        padding: 18,
        shadowColor: isSelected ? '#6C63FF' : '#000',
        shadowOffset: { width: 0, height: isSelected ? 8 : 3 },
        shadowOpacity: isSelected ? 0.35 : 0.12,
        shadowRadius: isSelected ? 14 : 8,
        elevation: isSelected ? 8 : 3,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        {/* Location Icon */}
        <View
          style={{
            marginTop: 2,
            height: 52,
            width: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9999,
            backgroundColor: isSelected ? '#6C63FF' : '#13131A',
            borderWidth: 1.5,
            borderColor: isSelected ? '#6C63FF' : '#2A2A3A',
            shadowColor: isSelected ? '#6C63FF' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: isSelected ? 4 : 0,
          }}>
          <Ionicons
            name="location-sharp"
            size={26}
            color={isSelected ? '#FFFFFF' : '#8888A0'}
          />
        </View>

        {/* Address Details */}
        <View style={{ flex: 1 }}>
          {/* Name and Default Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: isSelected ? '#6C63FF' : '#F0F0F5',
                letterSpacing: 0.3,
              }}>
              {address.name}
            </Text>
            {address.isDefault && (
              <View
                style={{
                  borderRadius: 9999,
                  backgroundColor: 'rgba(62, 207, 142, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(62, 207, 142, 0.35)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: '#3ECF8E',
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                  }}>
                  Mặc định
                </Text>
              </View>
            )}
          </View>

          {/* Address Text with Location Pin */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#8888A0"
              style={{ marginTop: 2 }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: 22,
                color: '#C8C8D8',
                fontWeight: '500',
              }}>
              {address.address}
            </Text>
          </View>

          {/* City and Phone */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <Text
              style={{
                fontSize: 13,
                color: '#8888A0',
                fontWeight: '600',
              }}>
              {address.city}
            </Text>
            <View style={{ width: 3, height: 3, borderRadius: 9999, backgroundColor: '#8888A0' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="call-outline" size={14} color="#8888A0" />
              <Text
                style={{
                  fontSize: 13,
                  color: '#8888A0',
                  fontWeight: '600',
                }}>
                {address.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Selection Checkmark or Edit Button */}
        {isSelected && !showActions && (
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 28,
              height: 28,
              borderRadius: 9999,
              backgroundColor: '#6C63FF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: 5,
            }}>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
          {onEdit && (
            <Pressable
              onPress={onEdit}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 14,
                backgroundColor: '#6C63FF',
                paddingVertical: 12,
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}>
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Sửa</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              onPress={onDelete}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 14,
                backgroundColor: '#FF6584',
                paddingVertical: 12,
                shadowColor: '#FF6584',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}>
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Xóa</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
