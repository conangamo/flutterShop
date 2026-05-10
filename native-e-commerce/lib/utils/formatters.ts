export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN');
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Resolves image URL from API response
 * If the URL is relative (starts with /), prepends the API base URL
 * Otherwise returns the URL as-is (for absolute URLs)
 */
export const resolveImageUrl = (imageUrl: string | null | undefined, apiBaseUrl: string): string => {
  if (!imageUrl || !imageUrl.trim()) {
    // Return a placeholder image if no image URL is provided
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80';
  }
  
  const trimmed = imageUrl.trim();
  
  // If it's a relative path (starts with /), prepend the API base URL
  if (trimmed.startsWith('/')) {
    // Remove trailing slash from base URL if present
    const base = apiBaseUrl.replace(/\/$/, '');
    return `${base}${trimmed}`;
  }
  
  // If it's already an absolute URL (http:// or https://), return as-is
  return trimmed;
};
