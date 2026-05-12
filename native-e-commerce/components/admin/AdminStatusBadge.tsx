import { View, Text } from 'react-native';
import type { OrderStatus } from '~/lib/types/orders';

interface StatusConfig {
  bg: string;
  fg: string;
  border: string;
  label: string;
}

const STATUS_CONFIG: Record<OrderStatus | 'active' | 'inactive' | 'low' | 'out', StatusConfig> = {
  pending: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A', label: 'Pending' },
  processing: { bg: '#DBEAFE', fg: '#1E40AF', border: '#BFDBFE', label: 'Processing' },
  shipped: { bg: '#E0E7FF', fg: '#4338CA', border: '#C7D2FE', label: 'Shipped' },
  delivered: { bg: '#D1FAE5', fg: '#065F46', border: '#A7F3D0', label: 'Delivered' },
  cancelled: { bg: '#FEE2E2', fg: '#991B1B', border: '#FECACA', label: 'Cancelled' },
  active: { bg: '#D1FAE5', fg: '#065F46', border: '#A7F3D0', label: 'Active' },
  inactive: { bg: '#F3F4F6', fg: '#374151', border: '#E5E7EB', label: 'Inactive' },
  low: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A', label: 'Low Stock' },
  out: { bg: '#FEE2E2', fg: '#991B1B', border: '#FECACA', label: 'Out of Stock' },
};

interface AdminStatusBadgeProps {
  status: OrderStatus | 'active' | 'inactive' | 'low' | 'out';
  customLabel?: string;
}

export function AdminStatusBadge({ status, customLabel }: AdminStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 9999,
        backgroundColor: config.bg,
        borderWidth: 1,
        borderColor: config.border,
      }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: config.fg,
          marginRight: 6,
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: config.fg,
        }}>
        {customLabel || config.label}
      </Text>
    </View>
  );
}
