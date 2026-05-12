import type { OrderDetail, OrderSummary } from '~/lib/types/orders';

import { apiFetch, apiGet, apiPost } from '~/lib/api/client';

export type PlaceOrderPayload = {
  items: { productId: string; variantId: string | null; quantity: number }[];
  shippingAddressId: string;
  paymentMethod: string;
  paymentMethodType: 'CREDIT_CARD' | 'COD' | 'E_WALLET';
  shippingFee?: number;
  discountTotal?: number;
  note?: string;
  promoCode?: string;
};

export async function fetchOrderSummaries(status?: string): Promise<OrderSummary[]> {
  let path = 'orders/';
  if (status && status !== 'all') path += `?status=${encodeURIComponent(status)}`;
  return apiGet<OrderSummary[]>(path);
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  return apiGet<OrderDetail>(`orders/${encodeURIComponent(orderId)}`);
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<OrderDetail> {
  return apiPost<OrderDetail>('orders/', {
    items: payload.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    shippingAddressId: payload.shippingAddressId,
    paymentMethod: payload.paymentMethod,
    paymentMethodType: payload.paymentMethodType,
    note: payload.note,
    promoCode: payload.promoCode,
  });
}

export async function cancelOrder(orderId: string, note?: string): Promise<OrderDetail> {
  console.log('[cancelOrder] Cancelling order:', { orderId, note });
  
  if (note) {
    // Send full OrderStatusUpdateIn schema with status and note
    const body = { status: 'cancelled', note };
    console.log('[cancelOrder] Request payload with note:', body);
    return apiPost<OrderDetail>(`orders/${encodeURIComponent(orderId)}/cancel`, body);
  }
  
  // Send POST with no body (backend accepts null)
  console.log('[cancelOrder] Request with no body');
  return apiFetch<OrderDetail>(`orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
  });
}

export type VoucherValidationResult = {
  valid: boolean;
  code: string;
  discountType?: 'fixed' | 'percent';
  discountValue?: number;
  discountAmount?: number;
  maxDiscount?: number;
  minOrderTotal?: number;
  errorMessage?: string;
};

export type AvailableVoucher = {
  id: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscount?: number;
  minOrderTotal: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
};

export async function validateVoucher(code: string, subtotal: number): Promise<VoucherValidationResult> {
  return apiPost<VoucherValidationResult>('orders/validate-voucher', {
    code,
    subtotal,
  });
}

export async function fetchAvailableVouchers(): Promise<AvailableVoucher[]> {
  return apiGet<AvailableVoucher[]>('orders/available-vouchers');
}
