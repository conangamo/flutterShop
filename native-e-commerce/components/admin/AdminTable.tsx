import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  width?: number | string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowPress?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

export function AdminTable<T>({
  columns,
  data,
  onRowPress,
  keyExtractor,
}: AdminTableProps<T>) {
  if (Platform.OS !== 'web') {
    // Mobile fallback - use card layout
    return (
      <ScrollView>
        {data.map((item) => (
          <Pressable
            key={keyExtractor(item)}
            onPress={() => onRowPress?.(item)}
            style={{
              backgroundColor: '#13131A',
              borderWidth: 1,
              borderColor: '#2A2A3A',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}>
            {columns.map((col) => (
              <View key={col.key} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: '#8888A0', marginBottom: 4 }}>
                  {col.label}
                </Text>
                <Text style={{ fontSize: 14, color: '#F0F0F5' }}>
                  {col.render ? col.render(item) : String((item as any)[col.key])}
                </Text>
              </View>
            ))}
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  // Web - use proper table
  return (
    <View
      style={{
        backgroundColor: '#13131A',
        borderWidth: 1,
        borderColor: '#2A2A3A',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>
          {/* Table Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#1C1C28',
              borderBottomWidth: 1,
              borderBottomColor: '#2A2A3A',
              position: 'sticky' as any,
              top: 0,
              zIndex: 10,
            }}>
            {columns.map((col) => (
              <View
                key={col.key}
                style={{
                  flex: col.width ? undefined : 1,
                  width: col.width,
                  padding: 16,
                  paddingHorizontal: 20,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: '#444455',
                    textAlign: col.align || 'left',
                  }}>
                  {col.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Table Body */}
          {data.map((item, index) => (
            <Pressable
              key={keyExtractor(item)}
              onPress={() => onRowPress?.(item)}
              style={({ hovered }: any) => ({
                flexDirection: 'row',
                backgroundColor: hovered ? '#252532' : 'transparent',
                borderBottomWidth: index < data.length - 1 ? 1 : 0,
                borderBottomColor: '#1F1F2D',
                transition: 'all 0.15s ease-in-out',
                cursor: onRowPress ? 'pointer' : 'default',
              })}>
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={{
                    flex: col.width ? undefined : 1,
                    width: col.width,
                    padding: 20,
                    justifyContent: 'center',
                  }}>
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#8888A0',
                        textAlign: col.align || 'left',
                      }}>
                      {String((item as any)[col.key])}
                    </Text>
                  )}
                </View>
              ))}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
