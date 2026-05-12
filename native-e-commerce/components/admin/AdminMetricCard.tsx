import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, Platform } from 'react-native';

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  color?: string;
}

export function AdminMetricCard({
  label,
  value,
  icon,
  trend,
  color = '#6C63FF',
}: AdminMetricCardProps) {
  return (
    <View
      style={{
        background:
          Platform.OS === 'web'
            ? 'linear-gradient(135deg, #13131A 0%, #1C1C28 100%)'
            : '#13131A',
        borderWidth: 1,
        borderColor: '#2A2A3A',
        borderRadius: 16,
        padding: 24,
        minHeight: 140,
        ...(Platform.OS === 'web' && {
          transition: 'all 0.2s ease-in-out',
          cursor: 'default',
        }),
      }}
      className="admin-metric-card">
      {icon && (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${color}1A`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      )}

      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          color: '#444455',
          marginBottom: 8,
        }}>
        {label}
      </Text>

      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: '#F0F0F5',
          lineHeight: 38,
        }}>
        {value}
      </Text>

      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <Ionicons
            name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend.direction === 'up' ? '#3ECF8E' : '#EF4444'}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: trend.direction === 'up' ? '#3ECF8E' : '#EF4444',
            }}>
            {trend.value}
          </Text>
        </View>
      )}
    </View>
  );
}
