import { apiGet, apiPatch } from '~/lib/api/client';
import { API_BASE_URL, STORE_ID } from '~/lib/config/env';
import { getAccessToken } from '~/lib/api/token';
import type { CurrentUser } from '~/lib/types/user';

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return apiGet<CurrentUser>('users/me');
}

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
};

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<CurrentUser> {
  return apiPatch<CurrentUser>('users/me', payload);
}

export async function uploadAvatar(imageUri: string): Promise<CurrentUser> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // Create form data
  const formData = new FormData();
  
  // Extract filename from URI
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  
  // Determine mime type from filename
  let mimeType = 'image/jpeg';
  if (filename.toLowerCase().endsWith('.png')) {
    mimeType = 'image/png';
  } else if (filename.toLowerCase().endsWith('.webp')) {
    mimeType = 'image/webp';
  }

  // Append the file to form data
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as any);

  // Make the upload request with proper headers
  const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Store-Id': STORE_ID,
      // Don't set Content-Type - let the browser set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Upload failed: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
