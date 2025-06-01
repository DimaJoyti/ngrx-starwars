// Star Wars Marketplace Models
// Enhanced with Bright Data MCP integration for real marketplace data

// ===== CORE MARKETPLACE MODELS =====

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  
  // Pricing
  price: number;
  originalPrice?: number;
  currency: 'USD' | 'EUR' | 'GBP';
  isOnSale: boolean;
  salePercentage?: number;
  
  // Product details
  category: ProductCategory;
  subcategory?: string;
  brand: string;
  manufacturer: string;
  sku: string;
  
  // Images and media
  images: ProductImage[];
  videos?: ProductVideo[];
  
  // Inventory
  inStock: boolean;
  stockQuantity: number;
  availability: 'in-stock' | 'pre-order' | 'out-of-stock' | 'discontinued';
  releaseDate?: Date;
  
  // Ratings and reviews
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  
  // Metadata
  tags: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive';
  isExclusive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  
  // Bright Data source info
  sourceUrl: string;
  sourceStore: 'bigbadtoystore' | 'sideshow' | 'hasbro' | 'other';
  lastUpdated: Date;
  
  // Relationships
  relatedItems?: string[];
  bundleItems?: string[];
  
  // 3D and AR support
  has3DModel: boolean;
  model3DUrl?: string;
  hasARSupport: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  order: number;
  type: 'product' | 'lifestyle' | 'detail' | 'packaging';
}

export interface ProductVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  type: 'unboxing' | 'review' | '360-view' | 'demo';
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  images?: string[];
}

export type ProductCategory = 
  | 'action-figures'
  | 'statues'
  | 'replicas'
  | 'vehicles'
  | 'apparel'
  | 'accessories'
  | 'collectibles'
  | 'books'
  | 'games'
  | 'home-decor'
  | 'art-prints'
  | 'model-kits';

// ===== SHOPPING CART MODELS =====

export interface CartItem {
  id: string;
  productId: string;
  product: MarketplaceItem;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
  price: number; // Price at time of adding to cart
}

export interface ShoppingCart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'edition' | 'format';
  value: string;
  priceModifier: number;
  stockQuantity: number;
}

// ===== WISHLIST MODELS =====

export interface WishlistItem {
  id: string;
  productId: string;
  product: MarketplaceItem;
  addedAt: Date;
  priceAtAdd: number;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  items: WishlistItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== FILTER AND SEARCH MODELS =====

export interface MarketplaceFilters {
  categories: ProductCategory[];
  priceRange: {
    min: number;
    max: number;
  };
  brands: string[];
  rarity: ('common' | 'rare' | 'epic' | 'legendary' | 'exclusive')[];
  availability: ('in-stock' | 'pre-order' | 'out-of-stock')[];
  rating: number;
  isOnSale: boolean;
  isNew: boolean;
  isFeatured: boolean;
  has3DModel: boolean;
  hasARSupport: boolean;
}

export interface SearchQuery {
  query: string;
  filters: Partial<MarketplaceFilters>;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popularity';
  page: number;
  pageSize: number;
}

export interface SearchResult {
  items: MarketplaceItem[];
  totalCount: number;
  facets: SearchFacets;
  suggestions: string[];
}

export interface SearchFacets {
  categories: { name: string; count: number }[];
  brands: { name: string; count: number }[];
  priceRanges: { range: string; count: number }[];
  ratings: { rating: number; count: number }[];
}

// ===== BRIGHT DATA INTEGRATION MODELS =====

export interface BrightDataProduct {
  sourceId: string;
  sourceStore: string;
  sourceUrl: string;
  scrapedAt: Date;
  rawData: any;
  processed: boolean;
  errors?: string[];
}

export interface MarketplaceSync {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  errors: string[];
}

// ===== CONSTANTS =====

export const MARKETPLACE_CATEGORIES: { [key in ProductCategory]: string } = {
  'action-figures': 'Action Figures',
  'statues': 'Statues & Busts',
  'replicas': 'Prop Replicas',
  'vehicles': 'Vehicles & Ships',
  'apparel': 'Apparel & Accessories',
  'accessories': 'Accessories',
  'collectibles': 'Collectibles',
  'books': 'Books & Comics',
  'games': 'Games & Puzzles',
  'home-decor': 'Home & Office',
  'art-prints': 'Art Prints',
  'model-kits': 'Model Kits'
};

export const RARITY_COLORS = {
  common: '#95A5A6',
  rare: '#3498DB',
  epic: '#9B59B6',
  legendary: '#F39C12',
  exclusive: '#E74C3C'
} as const;

export const STORE_COLORS = {
  bigbadtoystore: '#FF6B35',
  sideshow: '#2C3E50',
  hasbro: '#E74C3C',
  other: '#95A5A6'
} as const;

// ===== UTILITY TYPES =====

export type MarketplaceItemSummary = Pick<MarketplaceItem, 
  'id' | 'name' | 'price' | 'images' | 'rating' | 'category' | 'rarity' | 'inStock'
>;

export type CartSummary = Pick<ShoppingCart, 
  'id' | 'items' | 'subtotal' | 'total' | 'currency'
>;
