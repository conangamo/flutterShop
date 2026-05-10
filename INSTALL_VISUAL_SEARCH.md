# Visual Search - Installation & Testing Guide

## 📦 Installation

### Step 1: Install Dependencies
```bash
cd native-e-commerce
npm install
```

This will install the newly added `expo-image-picker` package.

### Step 2: Rebuild the App (if needed)
If you're running on a physical device or emulator, you may need to rebuild:

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android

# For Expo Go (development)
npx expo start
```

---

## 🧪 Testing the Visual Search

### Test 1: Camera Permission
1. Open the app
2. Tap the **camera icon** (pink/coral) in the search bar
3. Choose **"Chụp ảnh"** (Take Photo)
4. Grant camera permission when prompted
5. Take a photo of a shoe
6. Crop/edit the image (1:1 aspect ratio)
7. Confirm selection
8. Wait for AI processing (loading skeleton)
9. View similar products

### Test 2: Gallery Selection
1. Tap the **camera icon** in the search bar
2. Choose **"Chọn từ thư viện"** (Choose from Gallery)
3. Grant media library permission when prompted
4. Select a shoe image from your gallery
5. Crop/edit the image
6. Confirm selection
7. Wait for AI processing
8. View similar products

### Test 3: Visual Search Badge
1. After a successful visual search
2. Notice the **"🔍 Tìm kiếm bằng hình ảnh"** badge
3. Tap the **X** on the badge to clear
4. Products should return to normal catalog view

### Test 4: Error Handling
1. Turn off WiFi/mobile data
2. Try visual search
3. Should see error alert: "Không thể xử lý tìm kiếm hình ảnh"
4. Turn network back on
5. Retry - should work

---

## 🎯 Expected Behavior

### Success Case
- ✅ Image picker opens smoothly
- ✅ Image can be cropped to 1:1 ratio
- ✅ Loading skeleton appears during AI processing
- ✅ Similar products appear (up to 20 results)
- ✅ Visual search badge shows at top
- ✅ Other filters are cleared automatically

### No Results Case
- ✅ Alert shows: "Không tìm thấy sản phẩm tương tự"
- ✅ User can try again with different image
- ✅ Badge still shows (can be cleared)

### Error Case
- ✅ Alert shows error message
- ✅ User can retry
- ✅ No crash or freeze

---

## 🔍 Backend Verification

### Check Backend is Running
```bash
# The backend should be running on port 8000
curl http://localhost:8000/api/v1/health
```

### Test Visual Search Endpoint Directly
```bash
# Convert an image to base64 (example)
base64 -i shoe.jpg -o shoe.txt

# Test the endpoint
curl -X POST http://localhost:8000/api/v1/products/search-by-image \
  -H "Content-Type: application/json" \
  -H "X-Store-Id: 2" \
  -d '{
    "image_base64": "YOUR_BASE64_STRING_HERE",
    "top_k": 10
  }'
```

Expected response:
```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "brand": "...",
      "price": 1000000,
      "image": "...",
      ...
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "expo-image-picker not found"
**Solution:**
```bash
cd native-e-commerce
npm install
# Then restart the dev server
npx expo start --clear
```

### Issue: Permissions not working
**Solution:**
- **iOS:** Check `Info.plist` has camera/photo library usage descriptions
- **Android:** Check `AndroidManifest.xml` has camera/storage permissions
- **Expo Go:** Permissions should work automatically

### Issue: "Network timeout"
**Solution:**
- Check backend is running: `http://localhost:8000`
- Check `.env` file has correct `API_BASE_URL`
- Increase timeout in `visual-search.ts` if needed

### Issue: "No similar products found"
**Solution:**
- Make sure database has shoe products seeded
- Try with a clearer shoe image
- Check backend AI model is loaded correctly

### Issue: Image picker crashes
**Solution:**
- Update expo-image-picker: `npx expo install expo-image-picker@latest`
- Clear cache: `npx expo start --clear`
- Rebuild app: `npx expo run:ios` or `npx expo run:android`

---

## 📱 Platform-Specific Notes

### iOS
- Uses **ActionSheet** for image source selection
- Requires `NSCameraUsageDescription` in Info.plist
- Requires `NSPhotoLibraryUsageDescription` in Info.plist
- Expo handles these automatically

### Android
- Uses **Alert** for image source selection
- Requires `CAMERA` permission in AndroidManifest.xml
- Requires `READ_EXTERNAL_STORAGE` permission
- Expo handles these automatically

### Web (Expo Web)
- Camera may not work on web
- Gallery picker should work
- Use mobile device for full testing

---

## ✅ Verification Checklist

Before marking as complete, verify:

- [ ] `npm install` completed successfully
- [ ] App starts without errors
- [ ] Camera icon visible in search bar
- [ ] Tapping camera icon shows options
- [ ] "Chụp ảnh" opens camera
- [ ] "Chọn từ thư viện" opens gallery
- [ ] Image can be cropped/edited
- [ ] Loading state shows during AI processing
- [ ] Similar products appear after processing
- [ ] Visual search badge appears
- [ ] Badge can be cleared
- [ ] Error handling works (no network)
- [ ] Permissions are requested properly
- [ ] Works on both iOS and Android

---

## 🎉 Success!

Once all tests pass, the visual search feature is fully operational and ready for production use!

**The AI backend is already trained and operational - this frontend implementation completes the full visual search experience.** 🚀
