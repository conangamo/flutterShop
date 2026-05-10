import { API_BASE_URL, STORE_ID } from '~/lib/config/env';
import { ApiError } from '~/lib/api/errors';
import { getAccessToken } from '~/lib/api/token';
import type { ProductSummary } from '~/lib/types/products';

const API_TIMEOUT_MS = 30000; // 30 seconds for image processing

/**
 * Convert image URI to base64 string
 */
async function imageUriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
      const base64 = base64data.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Search products by image using AI backend
 * @param imageUri - Local URI of the selected/captured image
 * @param topK - Number of similar products to return (default: 10)
 */
export async function searchProductsByImage(
  imageUri: string,
  topK: number = 10
): Promise<ProductSummary[]> {
  try {
    console.log('[Visual Search] Starting image search with URI:', imageUri);
    
    // Convert image to base64
    const imageBase64 = await imageUriToBase64(imageUri);
    console.log('[Visual Search] Image converted to base64, length:', imageBase64.length);

    // Prepare request
    const url = `${API_BASE_URL}/products/search-by-image`;
    const token = await getAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Store-Id': STORE_ID,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('[Visual Search] Request URL:', url);
    console.log('[Visual Search] Headers:', headers);
    console.log('[Visual Search] Payload:', { top_k: topK, image_base64_length: imageBase64.length });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image_base64: imageBase64,
          top_k: topK,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('network_timeout', 'Visual search timed out. Please try again.', 0);
      }
      throw new ApiError('network_error', 'Unable to reach visual search service', 0);
    } finally {
      clearTimeout(timeout);
    }

    console.log('[Visual Search] Response status:', response.status);

    // Parse response
    const data = await response.json();
    console.log('[Visual Search] Response data:', JSON.stringify(data).substring(0, 200));

    if (!response.ok) {
      const errorMessage = data?.error?.message || `HTTP ${response.status}`;
      const errorCode = data?.error?.code || `http_${response.status}`;
      console.error('[Visual Search] Error:', errorCode, errorMessage);
      throw new ApiError(errorCode, errorMessage, response.status, data?.error?.details);
    }

    console.log('[Visual Search] Success! Found', data.items?.length || 0, 'products');
    
    // Return the items array
    return data.items || [];
  } catch (error) {
    console.error('[Visual Search] Exception:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'visual_search_error',
      error instanceof Error ? error.message : 'Failed to process image search',
      0
    );
  }
}
