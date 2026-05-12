import { View, Text, TextInput, TextInputProps, Platform } from 'react-native';

interface AdminInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function AdminInput({ label, error, style, ...props }: AdminInputProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#8888A0',
            marginBottom: 8,
          }}>
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        style={[
          {
            width: '100%',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#1C1C28',
            borderWidth: 1,
            borderColor: error ? '#EF4444' : '#2A2A3A',
            borderRadius: 12,
            color: '#F0F0F5',
            fontSize: 14,
            ...(Platform.OS === 'web' && {
              outlineStyle: 'none',
              transition: 'all 0.15s ease-in-out',
            }),
          },
          style,
        ]}
        placeholderTextColor="#444455"
      />
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: '#EF4444',
            marginTop: 6,
          }}>
          {error}
        </Text>
      )}
    </View>
  );
}
