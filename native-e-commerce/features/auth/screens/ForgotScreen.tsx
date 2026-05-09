import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function ForgotScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSendLink = () => {
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      console.log('Send Link');
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      {/* Ambient background glow — decorative only */}
      <View
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          marginLeft: -180,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: 'rgba(108, 99, 255, 0.12)',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={{
              alignItems: 'center',
              marginBottom: 48,
            }}
          >
            <View 
              style={{ 
                height: 80, 
                width: 80, 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: 9999, 
                backgroundColor: 'rgba(108, 99, 255, 0.15)',
                marginBottom: 32,
                borderWidth: 2,
                borderColor: 'rgba(108, 99, 255, 0.3)',
              }}
            >
              <Ionicons name="lock-closed-outline" size={40} color="#6C63FF" />
            </View>
            <Text
              style={{
                color: '#F0F0F5',
                fontSize: 36,
                fontWeight: '900',
                letterSpacing: -1.2,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Quên mật khẩu?
            </Text>
            <Text style={{ color: '#8888A0', fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 }}>
              Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
            </Text>
          </Animated.View>

          {/* Form card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            style={{
              backgroundColor: '#13131A',
              borderRadius: 28,
              padding: 28,
              borderWidth: 1,
              borderColor: '#2A2A3A',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Email Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: '#8888A0',
                  fontSize: 13,
                  fontWeight: '700',
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1C1C28',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#2A2A3A',
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                }}
              >
                <FontAwesome5
                  name="envelope"
                  size={18}
                  color="#8888A0"
                  style={{ marginRight: 12, width: 22, textAlign: 'center' }}
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#F0F0F5',
                    fontWeight: '500',
                  }}
                  placeholder="Nhập địa chỉ email của bạn"
                  placeholderTextColor="#5A5A70"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Info Text */}
            <View style={{ flexDirection: 'row', marginBottom: 28, gap: 8 }}>
              <Ionicons name="information-circle" size={20} color="#6C63FF" style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: '#8888A0' }}>
                Chúng tôi sẽ gửi liên kết để thiết lập lại mật khẩu đến email của bạn
              </Text>
            </View>

            {/* Send Link Button */}
            <TouchableOpacity
              style={{
                backgroundColor: submitting ? '#444455' : '#6C63FF',
                borderRadius: 18,
                paddingVertical: 20,
                alignItems: 'center',
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: submitting ? 0.2 : 0.5,
                shadowRadius: 24,
                elevation: 12,
                marginBottom: 16,
              }}
              onPress={handleSendLink}
              disabled={submitting}
            >
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.8 }}>
                {submitting ? 'Đang gửi...' : 'Gửi liên kết'}
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity 
              style={{ alignItems: 'center', paddingVertical: 12 }}
              onPress={() => router.back()}
            >
              <Text style={{ fontSize: 15, color: '#8888A0', fontWeight: '600' }}>
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
