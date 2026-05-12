import { View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function AdminCard({ children, style }: AdminCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#13131A',
        borderWidth: 1,
        borderColor: '#2A2A3A',
        borderRadius: 16,
        padding: 24,
        ...style,
      }}>
      {children}
    </View>
  );
}
