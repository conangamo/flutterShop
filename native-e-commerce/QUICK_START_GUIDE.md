# Quick Start Guide - Frontend Brand Integration

## 🎯 What Was Fixed

This update aligns the frontend with the actual backend API data structures and implements dynamic brand filtering.

## 🚀 Key Features

### 1. **Dynamic Brand Extraction**
Brands are now extracted from the actual products returned by the API:
```typescript
// Automatically extracts unique brands from products
const uniqueBrands = useMemo(() => {
  const brandSet = new Set<string>();
  homeProducts.forEach(p => {
    if (p.brand && p.brand.trim()) {
      brandSet.add(p.brand.trim());
    }
  });
  return Array.from(brandSet).sort();
}, [homeProducts]);
```

### 2. **Brand Filtering**
Click any brand icon to filter products:
- Active brand shows **purple border** and **bold text**
- Filter badge appears in the active filters section
- Product count updates to show filtered results
- Click again to deselect and show all products

### 3. **Image URL Resolution**
Product images now properly resolve relative and absolute URLs:
```typescript
// Handles both /uploads/image.jpg and https://example.com/image.jpg
const imageUrl = resolveImageUrl(product.image, API_BASE_URL);
```

### 4. **Brand Logo Mapping**
Major brands display their official logos:
- Nike, Adidas, Puma, Reebok, Converse, Vans, New Balance, Asics
- Unknown brands show a sneaker icon fallback

## 📱 User Experience

### Brand Selection Flow
1. **Browse Brands**: Scroll horizontally through brand icons
2. **Select Brand**: Tap a brand icon to filter
3. **View Results**: See only products from that brand
4. **Clear Filter**: Tap the brand again or use the filter badge (×)

### Visual Feedback
- **Inactive Brand**: White circle, gray text
- **Active Brand**: Purple border, purple bold text
- **Product Count**: "5 sản phẩm (Nike)"
- **Empty State**: "Không có sản phẩm của thương hiệu này"

## 🔧 Technical Details

### API Endpoints Used
```
GET /api/v1/products
GET /api/v1/categories
```

### Data Flow
```
Backend API → Products with brand field → Extract unique brands → Display brand icons → Filter products
```

### State Management
```typescript
const [activeBrand, setActiveBrand] = useState<string | null>(null);
const displayedProducts = useMemo(() => {
  if (!activeBrand) return homeProducts;
  return homeProducts.filter(p => p.brand?.trim() === activeBrand);
}, [homeProducts, activeBrand]);
```

## 🎨 Design System

### Colors
- **Primary Accent**: `#6C63FF` (Purple)
- **Success**: `#3ECF8E` (Green)
- **Warning**: `#FF6584` (Coral)
- **Background**: `#0A0A0F` (Dark)
- **Surface**: `#13131A` (Elevated)
- **Text Primary**: `#F0F0F5` (Light)
- **Text Secondary**: `#8888A0` (Muted)

### Typography
- **Brand Name**: 12px, weight 500/700
- **Product Title**: 15px, weight 700
- **Product Description**: 12px, weight 400
- **Price**: 16px, weight 700

## 🐛 Troubleshooting

### Images Not Loading
1. Check `EXPO_PUBLIC_API_URL` in `.env`
2. Verify backend is running on correct IP
3. Check if images are relative paths (should auto-resolve)
4. Fallback placeholder will show if image URL is invalid

### Brands Not Showing
1. Ensure products have `brand` field populated in database
2. Check API response includes brand data
3. Verify products are loading successfully

### Filter Not Working
1. Check `activeBrand` state is updating
2. Verify `displayedProducts` memo is recalculating
3. Ensure brand names match exactly (case-sensitive)

## 📝 Adding New Brand Logos

To add a logo for a new brand:

```typescript
// In native-e-commerce/app/(tabs)/index.tsx
const BRAND_LOGO_MAP: Record<string, string> = {
  'Nike': 'https://...',
  'YourBrand': 'https://your-logo-url.png', // Add here
};
```

## 🔮 Future Enhancements

1. **Backend Brand Endpoint**: Create `/api/brands` with metadata
2. **Server-Side Filtering**: Add `brand` parameter to products API
3. **Brand Pages**: Dedicated landing pages per brand
4. **Brand Search**: Autocomplete for brand selection
5. **Brand Analytics**: Track popular brands and conversions

## 📚 Related Files

- `native-e-commerce/app/(tabs)/index.tsx` - Main home screen
- `native-e-commerce/components/home/ProductCard.tsx` - Product display
- `native-e-commerce/lib/utils/formatters.ts` - Image URL utility
- `native-e-commerce/lib/types/products.ts` - Type definitions

## ✅ Testing Checklist

- [ ] Products load with correct images
- [ ] Brand icons display correctly
- [ ] Clicking brand filters products
- [ ] Active brand shows purple border
- [ ] Filter badge appears/disappears
- [ ] Product count updates correctly
- [ ] Empty state shows when no matches
- [ ] Banner image displays properly
- [ ] All filters work together
- [ ] Reset filter clears brand selection

## 🆘 Support

If you encounter issues:
1. Check the console for error messages
2. Verify API is returning expected data structure
3. Review `FE_ALIGNMENT_SUMMARY.md` for detailed changes
4. Check backend logs for API errors
