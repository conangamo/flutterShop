import { Pressable, Text, ActivityIndicator, Platform } from 'react-native';

interface AdminButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES = {
  primary: {
    bg: '#6C63FF',
    bgHover: '#5951E6',
    text: '#FFFFFF',
  },
  secondary: {
    bg: '#1C1C28',
    bgHover: '#252532',
    text: '#F0F0F5',
  },
  danger: {
    bg: '#EF4444',
    bgHover: '#DC2626',
    text: '#FFFFFF',
  },
  success: {
    bg: '#3ECF8E',
    bgHover: '#2BB77A',
    text: '#FFFFFF',
  },
};

export function AdminButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: AdminButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered }: any) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: pressed || hovered ? styles.bgHover : styles.bg,
        opacity: disabled ? 0.5 : 1,
        ...(Platform.OS === 'web' && {
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease-in-out',
        }),
        ...(pressed && Platform.OS === 'web' && {
          transform: [{ translateY: -1 }],
        }),
      })}>
      {loading ? (
        <ActivityIndicator size="small" color={styles.text} />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: styles.text,
            }}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
