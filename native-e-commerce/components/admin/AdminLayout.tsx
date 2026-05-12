import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, usePathname } from 'expo-router';
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Bảng điều khiển', icon: 'stats-chart', path: '/admin/dashboard' },
  { id: 'orders', label: 'Đơn hàng', icon: 'cart', path: '/admin/orders' },
  { id: 'inventory', label: 'Kho hàng', icon: 'cube', path: '/admin/inventory' },
  { id: 'promos', label: 'Khuyến mãi', icon: 'pricetags', path: '/admin/promos' },
  { id: 'users', label: 'Người dùng', icon: 'people', path: '/admin/users' },
  { id: 'categories', label: 'Danh mục', icon: 'grid', path: '/admin/categories' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // For web, use fixed sidebar layout
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#0A0A0F', height: '100vh', overflow: 'hidden' }}>
        {/* Fixed Sidebar */}
        <View
          style={{
            width: 280,
            backgroundColor: '#13131A',
            borderRightWidth: 1,
            borderRightColor: '#2A2A3A',
            position: 'fixed' as any,
            left: 0,
            top: 0,
            bottom: 0,
            overflowY: 'auto' as any,
            zIndex: 100,
          }}>
          <AdminSidebar pathname={pathname} onNavigate={(path) => router.push(path as any)} />
        </View>

        {/* Main Content - Scrollable */}
        <View style={{ flex: 1, marginLeft: 280, overflowY: 'auto' as any, height: '100vh' }}>
          <View style={{ maxWidth: 1600, margin: '0 auto', padding: 32 }}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  // For mobile, use standard layout
  return <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>{children}</View>;
}

function AdminSidebar({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Logo/Brand */}
      <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: '#2A2A3A' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#F0F0F5', letterSpacing: -0.5 }}>
          Quản trị
        </Text>
        <Text style={{ fontSize: 12, color: '#8888A0', marginTop: 4 }}>
          Bảng điều khiển cao cấp
        </Text>
      </View>

      {/* Navigation Items */}
      <View style={{ padding: 12, paddingTop: 20 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Pressable
              key={item.id}
              onPress={() => onNavigate(item.path)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                marginBottom: 4,
                borderRadius: 12,
                backgroundColor: isActive
                  ? 'rgba(108, 99, 255, 0.1)'
                  : pressed
                    ? '#252532'
                    : 'transparent',
                transition: 'all 0.15s ease-in-out',
              })}>
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? '#6C63FF' : '#8888A0'}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isActive ? '#6C63FF' : '#8888A0',
                }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View style={{ padding: 24, marginTop: 'auto' }}>
        <View
          style={{
            padding: 16,
            backgroundColor: '#1C1C28',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#2A2A3A',
          }}>
          <Text style={{ fontSize: 11, color: '#8888A0', marginBottom: 4 }}>
            Trạng thái hệ thống
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#3ECF8E',
              }}
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#F0F0F5' }}>
              Hoạt động bình thường
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
