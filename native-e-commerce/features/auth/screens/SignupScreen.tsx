import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { register } from '~/lib/api/auth';
import { afterAuthLogin } from '~/lib/auth/session';
import { getAppLocale, resolveSignupError, strings } from '~/lib/i18n';
import { useToast } from '~/components/ToastProvider';

export default function SignupScreen() {
  const locale = getAppLocale();
  const L = strings(locale);
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      addToast('warning', L.errors.missingFields, L.errors.signupMissingName);
      return;
    }
    if (!email.trim()) {
      addToast('warning', L.errors.missingFields, L.errors.signupMissingEmail);
      return;
    }
    if (password.length < 6) {
      addToast('warning', L.errors.missingFields, L.errors.signupBadPassword);
      return;
    }
    if (password !== confirmPassword) {
      addToast('warning', L.errors.missingFields, L.errors.signupPasswordMismatch);
      return;
    }
    setSubmitting(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      await afterAuthLogin(res.access_token);
      addToast('success', L.errors.signupSuccessTitle, L.errors.signupSuccessBody);
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (e) {
      addToast('error', L.errors.signupFailed, resolveSignupError(e, locale));
    } finally {
      setSubmitting(false);
    }
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
          {/* App Logo / Title */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={{
              alignItems: 'center',
              marginBottom: 48,
            }}
          >
            <View 
              style={{ 
                height: 64, 
                width: 64, 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: 9999, 
                backgroundColor: '#6C63FF',
                marginBottom: 24,
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View style={{ height: 36, width: 36, borderRadius: 9999, borderWidth: 4, borderColor: 'rgba(108, 99, 255, 0.3)' }} />
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
              Tạo tài khoản
            </Text>
            <Text style={{ color: '#8888A0', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
              Tham gia cùng chúng tôi ngay hôm nay
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
            {/* Name Input */}
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
                Họ và tên
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
                <FontAwesome
                  name="user"
                  size={20}
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
                  placeholder="Họ và tên"
                  placeholderTextColor="#5A5A70"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

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
                <FontAwesome
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
                  placeholder="Email"
                  placeholderTextColor="#5A5A70"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
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
                Mật khẩu
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
                  name="lock"
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
                  placeholder="Mật khẩu"
                  placeholderTextColor="#5A5A70"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#8888A0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 20 }}>
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
                Xác nhận mật khẩu
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
                  name="lock"
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
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#5A5A70"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#8888A0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Text */}
            <Text style={{ fontSize: 14, lineHeight: 22, color: '#8888A0', marginBottom: 28, textAlign: 'center' }}>
              Bằng cách nhấp vào <Text style={{ color: '#6C63FF', fontWeight: '700' }}>Đăng ký</Text>, bạn đồng ý với điều khoản sử dụng
            </Text>

            {/* Create Account Button */}
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
              }}
              onPress={handleSignup}
              disabled={submitting}
            >
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 0.8 }}>
                {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Social Login */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            style={{ marginTop: 40, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#8888A0', marginBottom: 24, letterSpacing: 1 }}>
              HOẶC TIẾP TỤC VỚI
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                style={{
                  width: 64,
                  height: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#2A2A3A',
                  backgroundColor: '#1C1C28',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <FontAwesome name="google" size={28} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 64,
                  height: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#2A2A3A',
                  backgroundColor: '#1C1C28',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <FontAwesome name="apple" size={28} color="#F0F0F5" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 64,
                  height: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#2A2A3A',
                  backgroundColor: '#1C1C28',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <FontAwesome name="facebook" size={28} color="#3b5998" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Login Link */}
          <View style={{ marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: '#8888A0', fontWeight: '500' }}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#6C63FF', letterSpacing: 0.3 }}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
