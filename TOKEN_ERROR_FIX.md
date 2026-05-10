# Token Error Fix - "Invalid or expired token"

## Problem
The app was throwing an unhandled error: `ApiError: Invalid or expired token` when making API calls with an expired or invalid JWT token. This error was bubbling up as an uncaught promise rejection.

## Root Cause
1. **Authentication by default**: All API calls were sending the JWT token by default (unless `skipAuth: true` was explicitly set)
2. **No token refresh**: The app had no mechanism to refresh expired tokens
3. **No automatic logout**: When a 401 error occurred, the invalid token remained in storage, causing repeated failures
4. **Public endpoints requiring auth**: Product browsing endpoints (categories, products) were requiring authentication even though they should be publicly accessible

## Solution

### 1. Automatic Token Clearing on 401 Errors
Updated `native-e-commerce/lib/api/client.ts` to automatically clear invalid tokens when a 401 error is received:

```typescript
// Handle 401 Unauthorized - clear invalid token
if (res.status === 401 && !skipAuth) {
  // Clear the invalid token to prevent repeated failed requests
  await setAccessToken(null);
  // Note: We don't redirect here to avoid circular dependencies
  // The UI should handle this by checking auth state
}
```

### 2. Skip Authentication for Public Endpoints
Updated `native-e-commerce/lib/api/catalog.ts` to skip authentication for public product browsing:

```typescript
export async function fetchCategories(): Promise<Category[]> {
  return apiGet<Category[]>('categories', { skipAuth: true });
}

export async function fetchProducts(filter?: ProductFilter): Promise<ProductListPage> {
  const q = buildProductsQuery(filter);
  return apiGet<ProductListPage>(`products${q}`, { skipAuth: true });
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  return apiGet<ProductDetail>(`products/${encodeURIComponent(id)}`, { skipAuth: true });
}
```

## Benefits
1. **No more unhandled errors**: Invalid tokens are automatically cleared
2. **Better UX**: Users can browse products without authentication
3. **Graceful degradation**: When a token expires, it's cleared automatically and the user can continue browsing public content
4. **Prevents error loops**: Clearing the token prevents repeated failed requests with the same invalid token

## Testing
To test the fix:
1. Start the app with an expired or invalid token in storage
2. Navigate to the home screen or product detail screen
3. The app should load products successfully without authentication errors
4. If you try to access authenticated endpoints (cart, orders, profile), you'll be prompted to log in

## Future Improvements
Consider implementing:
1. **Token refresh mechanism**: Automatically refresh tokens before they expire
2. **Auth state management**: Use a global auth context to track authentication state
3. **Automatic redirect**: Redirect to login when authentication is required
4. **Token expiry checking**: Check token expiry before making requests
