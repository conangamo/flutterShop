import { Text, TextInput, type TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function AppInput({ label, error, className = '', ...props }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text 
          style={{ 
            fontSize: 13, 
            fontWeight: '600', 
            color: '#8888A0', // text-secondary
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        {...props}
        placeholderTextColor="#5A5A70"
        style={{
          backgroundColor: error ? 'rgba(255, 101, 132, 0.08)' : '#1C1C28', // bg-elevated
          borderWidth: 1,
          borderColor: error ? '#FF6584' : '#2A2A3A', // semantic-border
          borderRadius: 16, // rounded-xl
          paddingHorizontal: 16,
          paddingVertical: 16,
          fontSize: 15,
          color: '#F0F0F5', // text-primary
          fontWeight: '500',
          letterSpacing: 0.2,
        }}
        className={className}
      />
      {error ? (
        <Text 
          style={{ 
            fontSize: 12, 
            color: '#FF6584', 
            fontWeight: '500',
            letterSpacing: 0.2,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
