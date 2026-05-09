import type { ReactNode } from 'react';
import { View } from 'react-native';

export function AppCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <View 
      style={{
        borderRadius: 24, // rounded-3xl for premium feel
        backgroundColor: '#13131A', // bg-surface
        borderWidth: 1,
        borderColor: '#2A2A3A', // semantic-border
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      }}
      className={className}
    >
      {children}
    </View>
  );
}
