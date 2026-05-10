import { Stack } from 'expo-router';
import { FlatList, ScrollView, Text, TouchableOpacity, View, Pressable, Alert, Image } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { FilterSheet, type FilterSheetState } from '../../components/home/FilterSheet';
import { HomeHeader } from '../../components/home/HomeHeader';
import { PillButton } from '../../components/home/PillButton';
import { ProductCard } from '../../components/home/ProductCard';
import { EmptyBlock, ErrorBlock } from '~/components/ui/StateBlocks';
import { CATALOG_PAGE_SIZE, fetchCategories, fetchProducts } from '~/lib/api/catalog';
import { searchProductsByImage } from '~/lib/api/visual-search';
import { ApiError } from '~/lib/api/errors';
import { getAppLocale, resolveApiError, strings } from '~/lib/i18n';
import type { Category } from '../../lib/types/models';
import type { ProductFilter, ProductSummary } from '../../lib/types/products';

const CATEGORY_PLACEHOLDER =
  'https://images.unsplash.com/photo-1515562140497-ee584338969a?auto=format&fit=crop&w=160&q=60';

const DEFAULT_FILTER: FilterSheetState = {
  size: null,
  color: null,
  inStock: false,
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

// Brand logo mapping - maps brand names from BE to their logos
// Using reliable PNG URLs that work consistently
const BRAND_LOGO_MAP: Record<string, string> = {
  'Nike': 'https://pngimg.com/uploads/nike/nike_PNG11.png',
  'Adidas': 'https://pngimg.com/uploads/adidas/adidas_PNG8.png',
  'Puma': 'https://purepng.com/public/uploads/large/purepng.com-puma-logopumabrand-logoiconssymbols-puma-681522783020s3ofl.png',
  'Reebok': 'https://pngimg.com/uploads/reebok/reebok_PNG12.png',
  'Converse': 'https://pngimg.com/uploads/converse/converse_PNG26.png',
  'Vans': 'https://pngimg.com/uploads/vans/vans_PNG6.png',
  'New Balance': 'https://logos-world.net/wp-content/uploads/2020/09/New-Balance-Logo.png',
  'Asics': 'https://logos-world.net/wp-content/uploads/2020/09/ASICS-Logo.png',
  'Under Armour': 'https://logos-world.net/wp-content/uploads/2020/09/Under-Armour-Logo.png',
  'Skechers': 'https://logos-world.net/wp-content/uploads/2020/11/Skechers-Logo.png',
  'Fila': 'https://logos-world.net/wp-content/uploads/2020/09/Fila-Logo.png',
  'Jordan': 'https://logos-world.net/wp-content/uploads/2020/09/Jordan-Logo.png',
};

// Helper function to get brand logo URL with fuzzy matching
function getBrandLogoUrl(brandName: string | null | undefined): string | null {
  if (!brandName) return null;
  
  const normalized = brandName.toLowerCase().trim();
  
  // Check for exact match first (case-insensitive)
  for (const [key, url] of Object.entries(BRAND_LOGO_MAP)) {
    if (key.toLowerCase() === normalized) {
      return url;
    }
  }
  
  // Check for partial match (contains)
  if (normalized.includes('nike')) return BRAND_LOGO_MAP['Nike'];
  if (normalized.includes('adidas')) return BRAND_LOGO_MAP['Adidas'];
  if (normalized.includes('puma')) return BRAND_LOGO_MAP['Puma'];
  if (normalized.includes('reebok')) return BRAND_LOGO_MAP['Reebok'];
  if (normalized.includes('converse')) return BRAND_LOGO_MAP['Converse'];
  if (normalized.includes('vans')) return BRAND_LOGO_MAP['Vans'];
  if (normalized.includes('new balance')) return BRAND_LOGO_MAP['New Balance'];
  if (normalized.includes('asics')) return BRAND_LOGO_MAP['Asics'];
  if (normalized.includes('under armour')) return BRAND_LOGO_MAP['Under Armour'];
  if (normalized.includes('skechers')) return BRAND_LOGO_MAP['Skechers'];
  if (normalized.includes('fila')) return BRAND_LOGO_MAP['Fila'];
  if (normalized.includes('jordan')) return BRAND_LOGO_MAP['Jordan'];
  
  return null;
}

export default function HomeScreen() {
  const locale = getAppLocale();
  const L = strings(locale);

  const [homeCategories, setHomeCategories] = useState<Category[]>([]);
  const [homeProducts, setHomeProducts] = useState<ProductSummary[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<FilterSheetState>(DEFAULT_FILTER);
  const [showFilter, setShowFilter] = useState(false);
  const [visualSearchActive, setVisualSearchActive] = useState(false);
  const [visualSearchLoading, setVisualSearchLoading] = useState(false);

  // --- Shimmer animation for loading skeleton ---
  const shimmerValue = useSharedValue(0);
  if (loading) {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 900 }),
      -1, // infinite repeat
      true // reverse direction (ping-pong)
    );
  }
  const shimmerAnimStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmerValue.value * 0.5,
  }));

  // Skeleton placeholder shown while products are loading
  const SkeletonCard = () => (
    <Animated.View
      style={[
        shimmerAnimStyle,
        {
          backgroundColor: '#1C1C28', // bg-elevated
          borderRadius: 24, // rounded-3xl to match ProductCard
          height: 280,
          flex: 1,
          margin: 6,
          borderWidth: 1,
          borderColor: '#2A2A3A',
        },
      ]}
    />
  );

  const filterPayload: ProductFilter = useMemo(
    () => ({
      categoryId: activeCategory ?? undefined,
      search: activeSearch || undefined,
      size: filterState?.size ?? undefined,
      color: filterState?.color ?? undefined,
      inStock: filterState?.inStock || undefined,
      sort: filterState?.sort ?? 'newest',
      minPrice: filterState?.minPrice ? Number(filterState.minPrice) : undefined,
      maxPrice: filterState?.maxPrice ? Number(filterState.maxPrice) : undefined,
    }),
    [activeCategory, activeSearch, filterState]
  );

  // Extract unique brands from products and filter by activeBrand
  const uniqueBrands = useMemo(() => {
    if (!homeProducts || !Array.isArray(homeProducts)) return [];
    const brandSet = new Set<string>();
    homeProducts.forEach(p => {
      if (p?.brand && p.brand.trim()) {
        brandSet.add(p.brand.trim());
      }
    });
    return Array.from(brandSet).sort();
  }, [homeProducts]);

  // Client-side brand filtering (since BE doesn't have brand filter endpoint)
  const displayedProducts = useMemo(() => {
    if (!homeProducts || !Array.isArray(homeProducts)) return [];
    if (!activeBrand) return homeProducts;
    return homeProducts.filter(p => p?.brand?.trim() === activeBrand);
  }, [homeProducts, activeBrand]);

  const filterKey = useMemo(() => JSON.stringify(filterPayload), [filterPayload]);
  const prevFilterKeyRef = useRef<string | null>(null);
  const firstFetchDoneRef = useRef(false);

  const loadPage = useCallback(
    async (pageNum: number) => {
      if (!firstFetchDoneRef.current) setLoading(true);
      else setProductsLoading(true);
      setError(null);
      try {
        const [cats, prodPage] = await Promise.all([
          fetchCategories(),
          fetchProducts({
            ...filterPayload,
            limit: CATALOG_PAGE_SIZE,
            offset: (pageNum - 1) * CATALOG_PAGE_SIZE,
          }),
        ]);
        setHomeCategories(
          Array.isArray(cats) ? cats.map((c) => ({
            ...c,
            image: c.image && c.image.length > 0 ? c.image : CATEGORY_PLACEHOLDER,
          })) : []
        );
        setHomeProducts(Array.isArray(prodPage?.items) ? prodPage.items : []);
        setTotalProducts(prodPage?.total ?? 0);
        const pages = Math.max(1, Math.ceil((prodPage?.total ?? 0) / CATALOG_PAGE_SIZE));
        if (pageNum > pages) {
          setPage(pages);
        }
      } catch (e) {
        const msg = e instanceof ApiError ? resolveApiError(e, locale) : L.errors.homeLoadFailed;
        setError(msg);
        setHomeCategories([]);
        setHomeProducts([]);
        setTotalProducts(0);
      } finally {
        firstFetchDoneRef.current = true;
        setLoading(false);
        setProductsLoading(false);
      }
    },
    [filterPayload, locale, L.errors.homeLoadFailed]
  );

  useEffect(() => {
    // Skip normal loading if visual search is active
    if (visualSearchActive) return;
    
    const filterChanged =
      prevFilterKeyRef.current !== null && prevFilterKeyRef.current !== filterKey;
    prevFilterKeyRef.current = filterKey;

    if (filterChanged && page !== 1) {
      setPage(1);
      return;
    }

    void loadPage(page);
  }, [page, filterKey, loadPage, visualSearchActive]);

  const totalPages =
    totalProducts > 0 ? Math.max(1, Math.ceil(totalProducts / CATALOG_PAGE_SIZE)) : 1;
  const pageNumbers = useMemo(
    () => buildPaginationPages(page, totalPages),
    [page, totalPages]
  );

  const availableColors = useMemo(() => {
    if (!displayedProducts || !Array.isArray(displayedProducts)) return [];
    const set = new Set<string>();
    for (const p of displayedProducts) {
      if (!p?.variants || !Array.isArray(p.variants)) continue;
      for (const v of p.variants) {
        if (v?.color) set.add(v.color);
      }
    }
    return Array.from(set);
  }, [displayedProducts]);

  const onApplyFilter = () => {
    setShowFilter(false);
  };
  const onResetFilter = () => {
    setFilterState(DEFAULT_FILTER);
    setActiveBrand(null);
    setVisualSearchActive(false);
  };

  const handleVisualSearch = async (imageUri: string) => {
    setVisualSearchLoading(true);
    setError(null);
    
    try {
      // Call AI backend for visual search
      const results = await searchProductsByImage(imageUri, 20);
      
      // Ensure results is always an array
      const safeResults = Array.isArray(results) ? results : [];
      
      // Update products with AI results
      setHomeProducts(safeResults);
      setTotalProducts(safeResults.length);
      setVisualSearchActive(true);
      
      // Clear other filters
      setActiveSearch('');
      setSearchInput('');
      setActiveCategory(null);
      setActiveBrand(null);
      setPage(1);
      
      // Graceful handling for empty results (AI embeddings not yet indexed)
      if (safeResults.length === 0) {
        // Don't throw error - this is expected when AI embeddings need re-indexing
        // The EmptyBlock component will handle the UI display
        console.log('[Visual Search] No results - AI embeddings may need re-indexing');
      }
    } catch (e) {
      const msg = e instanceof ApiError 
        ? resolveApiError(e, locale) 
        : 'Không thể xử lý tìm kiếm hình ảnh. Vui lòng thử lại.';
      setError(msg);
      Alert.alert('Lỗi', msg, [{ text: 'OK' }]);
      setVisualSearchActive(false);
      // Reset to empty array on error to prevent undefined issues
      setHomeProducts([]);
      setTotalProducts(0);
    } finally {
      setVisualSearchLoading(false);
    }
  };

  const activeFilterCount =
    (filterState.size ? 1 : 0) +
    (filterState.color ? 1 : 0) +
    (filterState.inStock ? 1 : 0) +
    (filterState.minPrice ? 1 : 0) +
    (filterState.maxPrice ? 1 : 0) +
    (filterState.sort !== 'newest' ? 1 : 0);

  return (
    <>
      <Stack.Screen options={{ title: 'Trang chủ', headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* === HEADER ROW === */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 16,
            }}
          >
            <HomeHeader
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onSubmitSearch={() => setActiveSearch(searchInput.trim())}
              onVisualSearch={handleVisualSearch}
            />
          </View>

          {/* === HERO BANNER === */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={{
              marginHorizontal: 16,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                backgroundColor: '#13131A', // bg-surface
                padding: 24,
                borderRadius: 24, // rounded-3xl for premium feel
                borderWidth: 1,
                borderColor: '#2A2A3A', // semantic-border
                minHeight: 200,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
                elevation: 12,
                overflow: 'visible',
              }}
            >
              {/* Left Side - Text Content */}
              <View style={{ flex: 1, zIndex: 2 }}>
                {/* Badge label */}
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'rgba(108, 99, 255, 0.18)',
                    borderWidth: 1,
                    borderColor: 'rgba(108, 99, 255, 0.4)',
                    borderRadius: 9999,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    marginBottom: 12,
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#6C63FF',
                      fontSize: 11,
                      fontWeight: '800',
                      letterSpacing: 1.2,
                    }}
                  >
                    ƯU ĐÃI GIỚI HẠN
                  </Text>
                </View>

                {/* Headline */}
                <Text
                  style={{
                    color: '#F0F0F5',
                    fontSize: 26,
                    fontWeight: '800',
                    letterSpacing: -0.6,
                    marginBottom: 8,
                    lineHeight: 32,
                  }}
                >
                  BỘ SƯU TẬP MỚI
                </Text>
                <Text
                  style={{
                    color: '#8888A0',
                    fontSize: 14,
                    marginBottom: 20,
                    lineHeight: 20,
                  }}
                >
                  Khám phá ngay những mẫu giày hot nhất.
                </Text>

                {/* Mua Ngay button */}
                <Pressable
                  onPress={() => {
                    Alert.alert('Thông báo', 'Chức năng mua sắm đang được phát triển!', [
                      { text: 'OK', style: 'default' }
                    ]);
                  }}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#6C63FF', // accent
                    borderRadius: 24,
                    paddingHorizontal: 22,
                    paddingVertical: 12,
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>
                    Mua Ngay
                  </Text>
                </Pressable>
              </View>

              {/* Right Side - Dramatic Sneaker Image with 3D Pop-out Effect */}
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Air_Jordan_1_retro_high_OG.png' }}
                style={{
                  position: 'absolute',
                  right: -30,
                  top: -40,
                  width: 180,
                  height: 180,
                  transform: [{ rotate: '-15deg' }],
                  zIndex: 1,
                }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* === BRANDS SECTION === */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(150)}
            style={{
              marginBottom: 20,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
              {uniqueBrands.map((brandName) => {
                const isActive = activeBrand === brandName;
                const logoUrl = getBrandLogoUrl(brandName);
                
                return (
                  <BrandLogoButton
                    key={brandName}
                    brandName={brandName}
                    logoUrl={logoUrl}
                    isActive={isActive}
                    onPress={() => setActiveBrand(isActive ? null : brandName)}
                  />
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* === SECTION TITLE & FILTERS === */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F0F0F5', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 }}>
                {activeCategory
                  ? homeCategories.find((c) => c.id === activeCategory)?.label ?? 'Catalog'
                  : 'Tất cả giày'}
              </Text>
              {activeSearch ? (
                <Text style={{ marginTop: 4, fontSize: 13, color: '#8888A0', fontWeight: '500' }}>
                  {'Tìm: "' + activeSearch + '"'}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <PillButton
                label={
                  filterState.sort === 'price_asc'
                    ? 'Giá ↑'
                    : filterState.sort === 'price_desc'
                      ? 'Giá ↓'
                      : filterState.sort === 'rating_desc'
                        ? 'Đánh giá'
                        : filterState.sort === 'name_asc'
                          ? 'A→Z'
                          : 'Mới'
                }
                icon={<Ionicons name="swap-vertical" size={15} color="#8888A0" />}
                onPress={() => setShowFilter(true)}
              />
              <PillButton
                label={activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
                icon={<Feather name="filter" size={15} color="#8888A0" />}
                onPress={() => setShowFilter(true)}
              />
            </View>
          </Animated.View>

          {/* === ACTIVE FILTER BADGES === */}
          {(activeSearch || activeCategory || activeBrand || activeFilterCount > 0 || visualSearchActive) ? (
            <View style={{ marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 }}>
              {visualSearchActive ? (
                <ChipBadge
                  label="🔍 Tìm kiếm bằng hình ảnh"
                  onClear={() => {
                    setVisualSearchActive(false);
                    void loadPage(1);
                  }}
                />
              ) : null}
              {activeSearch ? (
                <ChipBadge
                  label={`"${activeSearch}"`}
                  onClear={() => {
                    setActiveSearch('');
                    setSearchInput('');
                  }}
                />
              ) : null}
              {activeCategory ? (
                <ChipBadge
                  label={
                    homeCategories.find((c) => c.id === activeCategory)?.label ?? activeCategory
                  }
                  onClear={() => setActiveCategory(null)}
                />
              ) : null}
              {activeBrand ? (
                <ChipBadge
                  label={activeBrand}
                  onClear={() => setActiveBrand(null)}
                />
              ) : null}
              {filterState.size ? (
                <ChipBadge
                  label={`Size ${filterState.size}`}
                  onClear={() => setFilterState((s) => ({ ...s, size: null }))}
                />
              ) : null}
              {filterState.color ? (
                <ChipBadge
                  label={filterState.color}
                  onClear={() => setFilterState((s) => ({ ...s, color: null }))}
                />
              ) : null}
              {filterState.inStock ? (
                <ChipBadge
                  label="Còn hàng"
                  onClear={() => setFilterState((s) => ({ ...s, inStock: false }))}
                />
              ) : null}
            </View>
          ) : null}

          {/* === PRODUCT GRID OR LOADING/ERROR STATES === */}
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {loading || visualSearchLoading ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : error ? (
              <ErrorBlock message={error} onRetry={() => void loadPage(page)} />
            ) : homeProducts.length === 0 ? (
              <EmptyBlock
                title="Không tìm thấy sản phẩm"
                hint="Thử điều chỉnh bộ lọc hoặc tìm từ khóa khác."
                cta="Xóa bộ lọc"
                onPress={() => {
                  setActiveCategory(null);
                  setActiveBrand(null);
                  setActiveSearch('');
                  setSearchInput('');
                  setFilterState(DEFAULT_FILTER);
                  setVisualSearchActive(false);
                }}
              />
            ) : displayedProducts.length === 0 ? (
              <EmptyBlock
                title={visualSearchActive ? "Không tìm thấy sản phẩm nào khớp với hình ảnh" : "Không có sản phẩm của thương hiệu này"}
                hint={visualSearchActive ? "Đang chờ hệ thống AI cập nhật dữ liệu mới." : "Thử chọn thương hiệu khác hoặc xóa bộ lọc."}
                cta={visualSearchActive ? "Thử lại" : "Xóa bộ lọc"}
                onPress={() => {
                  if (visualSearchActive) {
                    setVisualSearchActive(false);
                    void loadPage(1);
                  } else {
                    setActiveBrand(null);
                  }
                }}
              />
            ) : (
              <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                <Text style={{ marginBottom: 16, fontSize: 12, color: '#8888A0', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' }}>
                  {displayedProducts.length > 0
                    ? `Trang ${page} / ${totalPages} · ${displayedProducts.length} sản phẩm${activeBrand ? ` (${activeBrand})` : ''}`
                    : 'Không có sản phẩm'}
                </Text>
                <View
                  style={{ opacity: productsLoading ? 0.35 : 1 }}
                  pointerEvents={productsLoading ? 'none' : 'auto'}
                >
                  <FlatList
                    key={`grid-2`}
                    data={displayedProducts}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    keyExtractor={(p, index) => `${p.id}-${index}`}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 12, marginBottom: 16 }}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>

                {/* === PAGINATION === */}
                {totalPages > 1 ? (
                  <View style={{ marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 8 }}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 9999,
                        borderWidth: 1,
                        borderColor: '#2A2A3A',
                        backgroundColor: '#1C1C28',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
                      disabled={page <= 1 || productsLoading}
                      onPress={() => setPage((p) => Math.max(1, p - 1))}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: page <= 1 ? '#444455' : '#F0F0F5',
                          letterSpacing: 0.3,
                        }}
                      >
                        {'‹ Trước'}
                      </Text>
                    </TouchableOpacity>
                    {pageNumbers.map((entry, idx) =>
                      entry === 'gap' ? (
                        <Text key={`gap-${idx}`} style={{ paddingHorizontal: 6, fontSize: 14, color: '#8888A0', fontWeight: '600' }}>
                          {'…'}
                        </Text>
                      ) : (
                        <TouchableOpacity
                          key={entry}
                          style={{
                            minWidth: 44,
                            alignItems: 'center',
                            borderRadius: 9999,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            backgroundColor: entry === page ? '#6C63FF' : '#1C1C28',
                            borderWidth: 1,
                            borderColor: entry === page ? '#6C63FF' : '#2A2A3A',
                            shadowColor: entry === page ? '#6C63FF' : '#000',
                            shadowOffset: { width: 0, height: entry === page ? 4 : 2 },
                            shadowOpacity: entry === page ? 0.4 : 0.15,
                            shadowRadius: entry === page ? 10 : 6,
                            elevation: entry === page ? 4 : 2,
                          }}
                          disabled={productsLoading}
                          onPress={() => setPage(entry)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '700',
                              color: entry === page ? '#FFFFFF' : '#F0F0F5',
                              letterSpacing: 0.3,
                            }}
                          >
                            {entry}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                    <TouchableOpacity
                      style={{
                        borderRadius: 9999,
                        borderWidth: 1,
                        borderColor: '#2A2A3A',
                        backgroundColor: '#1C1C28',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 2,
                      }}
                      disabled={page >= totalPages || productsLoading}
                      onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: page >= totalPages ? '#444455' : '#F0F0F5',
                          letterSpacing: 0.3,
                        }}
                      >
                        {'Sau ›'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </View>

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        availableColors={availableColors}
        state={filterState}
        onChange={setFilterState}
        onApply={onApplyFilter}
        onReset={onResetFilter}
      />
    </>
  );
}

/** Số trang hiển thị: 1 2 3 … 10 (rút gọn khi nhiều trang). */
function buildPaginationPages(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | 'gap')[] = [];
  const pushUnique = (n: number | 'gap') => {
    const last = items[items.length - 1];
    if (n === 'gap' && last === 'gap') return;
    if (typeof n === 'number' && last === n) return;
    items.push(n);
  };
  pushUnique(1);
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);
  if (windowStart > 2) pushUnique('gap');
  for (let p = windowStart; p <= windowEnd; p++) pushUnique(p);
  if (windowEnd < total - 1) pushUnique('gap');
  pushUnique(total);
  return items;
}

function ChipBadge({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <View 
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        borderRadius: 9999, 
        backgroundColor: 'rgba(255, 101, 132, 0.15)', 
        borderWidth: 1, 
        borderColor: 'rgba(255, 101, 132, 0.35)', 
        paddingHorizontal: 14, 
        paddingVertical: 8,
        shadowColor: '#FF6584',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#FF6584', letterSpacing: 0.2 }}>
        {label}
      </Text>
      <Text 
        onPress={onClear} 
        style={{ fontSize: 16, fontWeight: '800', color: '#FF6584', lineHeight: 16 }}
      >
        &times;
      </Text>
    </View>
  );
}

// Brand Logo Button Component with Fallback
function BrandLogoButton({ 
  brandName, 
  logoUrl, 
  isActive, 
  onPress 
}: { 
  brandName: string; 
  logoUrl: string | null; 
  isActive: boolean; 
  onPress: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  
  // Fallback URL for Puma specifically
  const fallbackUrl = brandName === 'Puma' 
    ? 'https://purepng.com/public/uploads/large/purepng.com-puma-logopumabrand-logoiconssymbols-puma-681522783020s3ofl.png'
    : null;
  
  const displayUrl = imageError && fallbackUrl ? fallbackUrl : logoUrl;
  
  return (
    <Pressable
      onPress={onPress}
      style={{ alignItems: 'center' }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: isActive ? 3 : 0,
          borderColor: isActive ? '#6C63FF' : 'transparent',
        }}
      >
        {displayUrl ? (
          <Image
            source={{ uri: displayUrl }}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
            onError={() => {
              if (!imageError) {
                console.warn(`Failed to load logo for ${brandName}, trying fallback`);
                setImageError(true);
              }
            }}
          />
        ) : (
          <Ionicons name="footsteps" size={28} color="#6C63FF" />
        )}
      </View>
    </Pressable>
  );
}
