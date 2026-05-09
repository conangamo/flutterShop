import type { ReactNode } from 'react';
import { TouchableOpacity, Text } from 'react-native';

type Props = {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
};

export function PillButton({ label, icon, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 9999, // fully rounded pill
        backgroundColor: '#1C1C28', // bg-elevated
        borderWidth: 1,
        borderColor: '#2A2A3A', // semantic-border
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Text 
        style={{ 
          fontSize: 13, 
          lineHeight: 18, 
          color: '#F0F0F5', // text-primary
          fontWeight: '600',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      {icon}
    </TouchableOpacity>
  );
}
