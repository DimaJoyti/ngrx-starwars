import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, catchError, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 
  MarketplaceItem, 
  SearchQuery, 
  SearchResult, 
  MarketplaceFilters,
  ShoppingCart,
  CartItem,
  Wishlist,
  WishlistItem,
  MarketplaceSync,
  BrightDataProduct
} from '../models/marketplace-models';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private readonly apiUrl = 'http://localhost:8080/api';
  private readonly marketplaceEndpoint = '/marketplace';

  // Cache subjects
  private productsCache$ = new BehaviorSubject<MarketplaceItem[]>([]);
  private cartCache$ = new BehaviorSubject<ShoppingCart | null>(null);
  private wishlistCache$ = new BehaviorSubject<Wishlist[]>([]);
  private filtersCache$ = new BehaviorSubject<Partial<MarketplaceFilters>>({});

  // Loading states
  private loadingProducts$ = new BehaviorSubject<boolean>(false);
  private loadingCart$ = new BehaviorSubject<boolean>(false);
  private syncingData$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initializeCache();
  }

  // ===== PRODUCT METHODS =====

  /**
   * Get all marketplace products with optional filters
   */
  getProducts(filters?: Partial<MarketplaceFilters>): Observable<MarketplaceItem[]> {
    this.loadingProducts$.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}${this.marketplaceEndpoint}/products`, { params })
      .pipe(
        map(response => {
          // Handle new API response format
          if (response.success && response.data && response.data.products) {
            return response.data.products;
          }
          // Fallback for old format
          return Array.isArray(response) ? response : [];
        }),
        tap(products => {
          this.productsCache$.next(products);
          this.loadingProducts$.next(false);
        }),
        catchError(error => {
          console.error('Error loading products:', error);
          this.loadingProducts$.next(false);
          return of([]);
        })
      );
  }

  /**
   * Get cached products
   */
  getCachedProducts(): Observable<MarketplaceItem[]> {
    return this.productsCache$.asObservable();
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<MarketplaceItem | null> {
    return this.http.get<MarketplaceItem>(`${this.apiUrl}${this.marketplaceEndpoint}/products/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error loading product:', error);
          return of(null);
        })
      );
  }

  /**
   * Search products
   */
  searchProducts(searchQuery: SearchQuery): Observable<SearchResult> {
    this.loadingProducts$.next(true);
    
    return this.http.post<SearchResult>(`${this.apiUrl}${this.marketplaceEndpoint}/search`, searchQuery)
      .pipe(
        tap(result => {
          this.productsCache$.next(result.items);
          this.loadingProducts$.next(false);
        }),
        catchError(error => {
          console.error('Error searching products:', error);
          this.loadingProducts$.next(false);
          return of({ items: [], totalCount: 0, facets: { categories: [], brands: [], priceRanges: [], ratings: [] }, suggestions: [] });
        })
      );
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(): Observable<MarketplaceItem[]> {
    return this.http.get<any>(`${this.apiUrl}${this.marketplaceEndpoint}/featured`)
      .pipe(
        map(response => {
          // Handle new API response format
          if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
          }
          // Fallback for old format
          return Array.isArray(response) ? response : [];
        }),
        catchError(error => {
          console.error('Error loading featured products:', error);
          return of([]);
        })
      );
  }

  /**
   * Get products on sale
   */
  getSaleProducts(): Observable<MarketplaceItem[]> {
    return this.http.get<any>(`${this.apiUrl}${this.marketplaceEndpoint}/sale`)
      .pipe(
        map(response => {
          // Handle new API response format
          if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
          }
          // Fallback for old format
          return Array.isArray(response) ? response : [];
        }),
        catchError(error => {
          console.error('Error loading sale products:', error);
          return of([]);
        })
      );
  }

  // ===== SHOPPING CART METHODS =====

  /**
   * Get current shopping cart
   */
  getCart(): Observable<ShoppingCart | null> {
    this.loadingCart$.next(true);
    
    return this.http.get<ShoppingCart>(`${this.apiUrl}${this.marketplaceEndpoint}/cart`)
      .pipe(
        tap(cart => {
          this.cartCache$.next(cart);
          this.loadingCart$.next(false);
        }),
        catchError(error => {
          console.error('Error loading cart:', error);
          this.loadingCart$.next(false);
          return of(null);
        })
      );
  }

  /**
   * Get cached cart
   */
  getCachedCart(): Observable<ShoppingCart | null> {
    return this.cartCache$.asObservable();
  }

  /**
   * Add item to cart
   */
  addToCart(productId: string, quantity: number = 1): Observable<ShoppingCart> {
    const cartItem = { productId, quantity };
    
    return this.http.post<ShoppingCart>(`${this.apiUrl}${this.marketplaceEndpoint}/cart/add`, cartItem)
      .pipe(
        tap(cart => this.cartCache$.next(cart)),
        catchError(error => {
          console.error('Error adding to cart:', error);
          throw error;
        })
      );
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(itemId: string, quantity: number): Observable<ShoppingCart> {
    return this.http.put<ShoppingCart>(`${this.apiUrl}${this.marketplaceEndpoint}/cart/items/${itemId}`, { quantity })
      .pipe(
        tap(cart => this.cartCache$.next(cart)),
        catchError(error => {
          console.error('Error updating cart item:', error);
          throw error;
        })
      );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(itemId: string): Observable<ShoppingCart> {
    return this.http.delete<ShoppingCart>(`${this.apiUrl}${this.marketplaceEndpoint}/cart/items/${itemId}`)
      .pipe(
        tap(cart => this.cartCache$.next(cart)),
        catchError(error => {
          console.error('Error removing from cart:', error);
          throw error;
        })
      );
  }

  /**
   * Clear cart
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.marketplaceEndpoint}/cart`)
      .pipe(
        tap(() => this.cartCache$.next(null)),
        catchError(error => {
          console.error('Error clearing cart:', error);
          throw error;
        })
      );
  }

  // ===== WISHLIST METHODS =====

  /**
   * Get user wishlists
   */
  getWishlists(): Observable<Wishlist[]> {
    return this.http.get<Wishlist[]>(`${this.apiUrl}${this.marketplaceEndpoint}/wishlists`)
      .pipe(
        tap(wishlists => this.wishlistCache$.next(wishlists)),
        catchError(error => {
          console.error('Error loading wishlists:', error);
          return of([]);
        })
      );
  }

  /**
   * Add item to wishlist
   */
  addToWishlist(productId: string, wishlistId?: string): Observable<Wishlist> {
    const payload = { productId, wishlistId };
    
    return this.http.post<Wishlist>(`${this.apiUrl}${this.marketplaceEndpoint}/wishlists/add`, payload)
      .pipe(
        tap(wishlist => {
          const current = this.wishlistCache$.value;
          const index = current.findIndex(w => w.id === wishlist.id);
          if (index >= 0) {
            current[index] = wishlist;
          } else {
            current.push(wishlist);
          }
          this.wishlistCache$.next([...current]);
        }),
        catchError(error => {
          console.error('Error adding to wishlist:', error);
          throw error;
        })
      );
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(wishlistId: string, itemId: string): Observable<Wishlist> {
    return this.http.delete<Wishlist>(`${this.apiUrl}${this.marketplaceEndpoint}/wishlists/${wishlistId}/items/${itemId}`)
      .pipe(
        tap(wishlist => {
          const current = this.wishlistCache$.value;
          const index = current.findIndex(w => w.id === wishlist.id);
          if (index >= 0) {
            current[index] = wishlist;
            this.wishlistCache$.next([...current]);
          }
        }),
        catchError(error => {
          console.error('Error removing from wishlist:', error);
          throw error;
        })
      );
  }

  // ===== BRIGHT DATA INTEGRATION =====

  /**
   * Sync marketplace data with Bright Data MCP
   */
  syncWithBrightData(): Observable<MarketplaceSync> {
    this.syncingData$.next(true);
    
    return this.http.post<MarketplaceSync>(`${this.apiUrl}${this.marketplaceEndpoint}/sync`, {})
      .pipe(
        tap(sync => {
          this.syncingData$.next(false);
          if (sync.status === 'completed') {
            // Refresh products after sync
            this.getProducts().subscribe();
          }
        }),
        catchError(error => {
          console.error('Error syncing with Bright Data:', error);
          this.syncingData$.next(false);
          throw error;
        })
      );
  }

  /**
   * Get sync status
   */
  getSyncStatus(): Observable<MarketplaceSync[]> {
    return this.http.get<MarketplaceSync[]>(`${this.apiUrl}${this.marketplaceEndpoint}/sync/status`)
      .pipe(
        catchError(error => {
          console.error('Error getting sync status:', error);
          return of([]);
        })
      );
  }

  // ===== LOADING STATES =====

  isLoadingProducts(): Observable<boolean> {
    return this.loadingProducts$.asObservable();
  }

  isLoadingCart(): Observable<boolean> {
    return this.loadingCart$.asObservable();
  }

  isSyncingData(): Observable<boolean> {
    return this.syncingData$.asObservable();
  }

  // ===== PRIVATE METHODS =====

  private initializeCache(): void {
    this.productsCache$.next([]);
    this.cartCache$.next(null);
    this.wishlistCache$.next([]);
  }

  private handleError(error: any): Observable<never> {
    console.error('MarketplaceService error:', error);
    throw error;
  }
}
