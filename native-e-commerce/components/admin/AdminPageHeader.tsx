import { View, Text } from 'react-native';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#F0F0F5', marginBottom: 8 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: '#8888A0' }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
