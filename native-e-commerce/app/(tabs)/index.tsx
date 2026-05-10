import { Stack } from 'expo-router';
import { FlatList, ScrollView, Text, TouchableOpacity, View, useWindowDimensions, Pressable, Alert, Image } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { FilterSheet, type FilterSheetState } from '../../components/home/FilterSheet';
import { HomeHeader } from '../../components/home/HomeHeader';
import { PillButton } from '../../components/home/PillButton';
import { ProductCard } from '../../components/home/ProductCard';
import { EmptyBlock, ErrorBlock } from '~/components/ui/StateBlocks';
import { CATALOG_PAGE_SIZE, fetchCategories, fetchProducts } from '~/lib/api/catalog';
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

// Real shoe brand logos for the brands section
const SHOE_BRANDS = [
  { id: '1', name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png' },
  { id: '2', name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png' },
  { id: '3', name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/da/Puma_complete_logo.svg/200px-Puma_complete_logo.svg.png' },
  { id: '4', name: 'Reebok', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Reebok_2019_logo.svg/200px-Reebok_2019_logo.svg.png' },
  { id: '5', name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/200px-Converse_logo.svg.png' },
  { id: '6', name: 'Vans', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/200px-Vans-logo.svg.png' },
];

export default function HomeScreen() {
  const locale = getAppLocale();
  const L = strings(locale);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width >= 1180 ? 4 : width >= 860 ? 3 : 2;
  const gridGap = 12;
  const containerHorizontal = 16 * 2;
  const cardWidth = Math.max(
    150,
    Math.floor((width - containerHorizontal - gridGap * (numColumns - 1)) / numColumns)
  );

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
  const [filterState, setFilterState] = useState<FilterSheetState>(DEFAULT_FILTER);
  const [showFilter, setShowFilter] = useState(false);

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
      size: filterState.size ?? undefined,
      color: filterState.color ?? undefined,
      inStock: filterState.inStock || undefined,
      sort: filterState.sort,
      minPrice: filterState.minPrice ? Number(filterState.minPrice) : undefined,
      maxPrice: filterState.maxPrice ? Number(filterState.maxPrice) : undefined,
    }),
    [activeCategory, activeSearch, filterState]
  );

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
          cats.map((c) => ({
            ...c,
            image: c.image && c.image.length > 0 ? c.image : CATEGORY_PLACEHOLDER,
          }))
        );
        setHomeProducts(prodPage.items);
        setTotalProducts(prodPage.total);
        const pages = Math.max(1, Math.ceil(prodPage.total / CATALOG_PAGE_SIZE));
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
    const filterChanged =
      prevFilterKeyRef.current !== null && prevFilterKeyRef.current !== filterKey;
    prevFilterKeyRef.current = filterKey;

    if (filterChanged && page !== 1) {
      setPage(1);
      return;
    }

    void loadPage(page);
  }, [page, filterKey, loadPage]);

  const totalPages =
    totalProducts > 0 ? Math.max(1, Math.ceil(totalProducts / CATALOG_PAGE_SIZE)) : 1;
  const pageNumbers = useMemo(
    () => buildPaginationPages(page, totalPages),
    [page, totalPages]
  );

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    for (const p of homeProducts) {
      for (const v of p.variants) {
        if (v.color) set.add(v.color);
      }
    }
    return Array.from(set);
  }, [homeProducts]);

  const onApplyFilter = () => {
    setShowFilter(false);
  };
  const onResetFilter = () => {
    setFilterState(DEFAULT_FILTER);
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

              {/* Right Side - Dramatic Sneaker Image */}
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' }}
                style={{
                  position: 'absolute',
                  right: -16,
                  top: -16,
                  width: 160,
                  height: 160,
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
              {SHOE_BRANDS.map((brand) => (
                <Pressable
                  key={brand.id}
                  style={{ alignItems: 'center', width: 60 }}
                >
                  {/* White Circle Container */}
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    {/* Brand Logo */}
                    <Image
                      source={{ uri: brand.logo }}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Brand Name */}
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#F0F0F5',
                      fontSize: 12,
                      fontWeight: '500',
                      textAlign: 'center',
                    }}
                  >
                    {brand.name}
                  </Text>
                </Pressable>
              ))}
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
          {(activeSearch || activeCategory || activeFilterCount > 0) ? (
            <View style={{ marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 }}>
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
            {loading ? (
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
                  setActiveSearch('');
                  setSearchInput('');
                  setFilterState(DEFAULT_FILTER);
                }}
              />
            ) : (
              <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                <Text style={{ marginBottom: 16, fontSize: 12, color: '#8888A0', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' }}>
                  {totalProducts > 0
                    ? `Trang ${page} / ${totalPages} · ${totalProducts} sản phẩm`
                    : 'Không có sản phẩm'}
                </Text>
                <View
                  style={{ opacity: productsLoading ? 0.35 : 1 }}
                  pointerEvents={productsLoading ? 'none' : 'auto'}
                >
                  <FlatList
                    key={`grid-2`}
                    data={homeProducts}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    keyExtractor={(p) => p.id}
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
