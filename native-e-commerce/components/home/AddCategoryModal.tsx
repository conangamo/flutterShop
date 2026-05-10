import { FontAwesome } from '@expo/vector-icons';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddCategoryModalProps {
  visible: boolean;
  value: string;
  loading: boolean;
  onChangeText: (text: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export function AddCategoryModal({
  visible,
  value,
  loading,
  onChangeText,
  onAdd,
  onCancel,
}: AddCategoryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text className="text-lg font-bold text-text-primary">Thêm danh mục mới</Text>
            <TouchableOpacity onPress={onCancel} disabled={loading}>
              <FontAwesome name="close" size={22} color="#F0F0F5" />
            </TouchableOpacity>
          </View>

          <TextInput
            className="border border-semantic-border bg-bg-elevated rounded-button px-4 py-3 mb-4 text-text-primary"
            placeholder="Nhập tên danh mục"
            placeholderTextColor="#8888A0"
            value={value}
            onChangeText={onChangeText}
            editable={!loading}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              className="flex-1 bg-bg-elevated rounded-button py-3 items-center"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="font-semibold text-text-secondary">Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-button py-3 items-center ${loading ? 'bg-accent/60' : 'bg-accent'}`}
              onPress={onAdd}
              disabled={loading}
            >
              <Text className="font-semibold text-white">
                {loading ? 'Đang thêm...' : 'Thêm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#13131A',
    borderRadius: 16,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    columnGap: 12,
  },
});
