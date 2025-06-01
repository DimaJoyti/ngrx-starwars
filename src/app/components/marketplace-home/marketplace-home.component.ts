import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import {
  MarketplaceItem,
  MarketplaceFilters,
  ProductCategory,
  MARKETPLACE_CATEGORIES,
  RARITY_COLORS
} from '../../shared/models/marketplace-models';
import { MarketplaceService } from '../../shared/services/marketplace.service';
import { ProductComparisonService } from '../../shared/services/product-comparison.service';
import { ToastNotificationService } from '../../shared/services/toast-notification.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ToastNotificationComponent } from '../../shared/components/toast-notification/toast-notification.component';

@Component({
  selector: 'app-marketplace-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    SkeletonLoaderComponent,
    ToastNotificationComponent
  ],
  templateUrl: './marketplace-home.component.html',
  styleUrls: ['./marketplace-home.component.scss']
})
export class MarketplaceHomeComponent implements OnInit, OnDestroy {
  // Observables
  featuredProducts$: Observable<MarketplaceItem[]>;
  saleProducts$: Observable<MarketplaceItem[]>;
  allProducts$: Observable<MarketplaceItem[]>;
  isLoading$: Observable<boolean>;
  isSyncing$: Observable<boolean>;

  // Search and filters
  searchControl = new FormControl('');
  selectedCategory: ProductCategory | 'all' = 'all';
  selectedRarity: string = 'all';
  priceRange = { min: 0, max: 1000 };
  showOnlyInStock = false;
  showOnlyOnSale = false;

  // View options
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'newest' = 'newest';

  // Constants for template
  readonly MARKETPLACE_CATEGORIES = MARKETPLACE_CATEGORIES;
  readonly RARITY_COLORS = RARITY_COLORS;
  readonly CATEGORY_KEYS = Object.keys(MARKETPLACE_CATEGORIES) as ProductCategory[];

  private destroy$ = new Subject<void>();

  constructor(
    private marketplaceService: MarketplaceService,
    private comparisonService: ProductComparisonService,
    private toastService: ToastNotificationService
  ) {
    // Initialize observables
    this.featuredProducts$ = this.marketplaceService.getFeaturedProducts();
    this.saleProducts$ = this.marketplaceService.getSaleProducts();
    this.allProducts$ = this.marketplaceService.getCachedProducts();
    this.isLoading$ = this.marketplaceService.isLoadingProducts();
    this.isSyncing$ = this.marketplaceService.isSyncingData();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSearchAndFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== INITIALIZATION =====

  private loadInitialData(): void {
    // Load all products initially
    this.marketplaceService.getProducts().subscribe();
    
    // Load featured and sale products
    this.featuredProducts$ = this.marketplaceService.getFeaturedProducts();
    this.saleProducts$ = this.marketplaceService.getSaleProducts();
  }

  private setupSearchAndFilters(): void {
    // Setup reactive search and filtering
    const filters$ = combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      // Add other filter observables here when needed
    ]).pipe(
      map(([searchQuery]) => ({
        searchQuery: searchQuery || '',
        category: this.selectedCategory,
        rarity: this.selectedRarity,
        priceRange: this.priceRange,
        inStock: this.showOnlyInStock,
        onSale: this.showOnlyOnSale
      }))
    );

    // Apply filters to products
    this.allProducts$ = combineLatest([
      this.marketplaceService.getCachedProducts(),
      filters$
    ]).pipe(
      map(([products, filters]) => this.applyFilters(products, filters)),
      map(products => this.applySorting(products))
    );
  }

  // ===== FILTERING AND SORTING =====

  private applyFilters(products: MarketplaceItem[], filters: any): MarketplaceItem[] {
    return products.filter(product => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Rarity filter
      if (filters.rarity !== 'all' && product.rarity !== filters.rarity) {
        return false;
      }

      // Price range filter
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false;
      }

      // In stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }

      // On sale filter
      if (filters.onSale && !product.isOnSale) {
        return false;
      }

      return true;
    });
  }

  private applySorting(products: MarketplaceItem[]): MarketplaceItem[] {
    return [...products].sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });
  }

  // ===== EVENT HANDLERS =====

  onCategoryChange(category: ProductCategory | 'all'): void {
    this.selectedCategory = category;
    this.setupSearchAndFilters(); // Refresh filters
  }

  onRarityChange(rarity: string): void {
    this.selectedRarity = rarity;
    this.setupSearchAndFilters(); // Refresh filters
  }

  onPriceRangeChange(range: { min: number; max: number }): void {
    this.priceRange = range;
    this.setupSearchAndFilters(); // Refresh filters
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy as any;
    this.setupSearchAndFilters(); // Refresh sorting
  }

  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onToggleInStock(): void {
    this.showOnlyInStock = !this.showOnlyInStock;
    this.setupSearchAndFilters(); // Refresh filters
  }

  onToggleOnSale(): void {
    this.showOnlyOnSale = !this.showOnlyOnSale;
    this.setupSearchAndFilters(); // Refresh filters
  }

  // ===== ACTIONS =====

  syncWithBrightData(): void {
    this.marketplaceService.syncWithBrightData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sync) => {
          console.log('Sync started:', sync);
          // Show success message
        },
        error: (error) => {
          console.error('Sync failed:', error);
          // Show error message
        }
      });
  }

  addToCart(product: MarketplaceItem): void {
    if (!product.inStock) {
      this.toastService.showOutOfStock(product.name);
      return;
    }

    this.marketplaceService.addToCart(product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.toastService.showProductAddedToCart(product.name);
        },
        error: (error) => {
          this.toastService.showError('Failed to Add to Cart', error.message || 'Please try again');
        }
      });
  }

  addToWishlist(product: MarketplaceItem): void {
    this.marketplaceService.addToWishlist(product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wishlist) => {
          this.toastService.showProductAddedToWishlist(product.name);
        },
        error: (error) => {
          this.toastService.showError('Failed to Add to Wishlist', error.message || 'Please try again');
        }
      });
  }

  // ===== COMPARISON METHODS =====

  addToComparison(product: MarketplaceItem): void {
    const success = this.comparisonService.addToComparison(product);

    if (success) {
      this.toastService.showSuccess(
        'Added to Comparison',
        `${product.name} added to comparison`,
        {
          action: {
            label: 'View Comparison',
            handler: () => this.openComparison()
          }
        }
      );
    } else {
      if (this.comparisonService.isInComparison(product.id)) {
        this.toastService.showInfo('Already in Comparison', `${product.name} is already being compared`);
      } else if (this.comparisonService.isComparisonFull()) {
        this.toastService.showWarning(
          'Comparison Full',
          `You can only compare up to ${this.comparisonService.getMaxComparisonItems()} products at once`
        );
      }
    }
  }

  removeFromComparison(product: MarketplaceItem): void {
    const success = this.comparisonService.removeFromComparison(product.id);

    if (success) {
      this.toastService.showInfo('Removed from Comparison', `${product.name} removed from comparison`);
    }
  }

  toggleComparison(product: MarketplaceItem): void {
    if (this.comparisonService.isInComparison(product.id)) {
      this.removeFromComparison(product);
    } else {
      this.addToComparison(product);
    }
  }

  isInComparison(product: MarketplaceItem): boolean {
    return this.comparisonService.isInComparison(product.id);
  }

  openComparison(): void {
    // This will be implemented with dialog service
    console.log('Open comparison dialog');
  }

  getComparisonCount(): number {
    return this.comparisonService.getComparisonCount();
  }

  // ===== UTILITY METHODS =====

  getRarityColor(rarity: string): string {
    return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#95A5A6';
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  trackByProductId(index: number, product: MarketplaceItem): string {
    return product.id;
  }
}
