import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MarketplaceItem } from '../models/marketplace-models';

@Injectable({
  providedIn: 'root'
})
export class ProductComparisonService {
  private readonly maxComparisonItems = 4;
  private readonly storageKey = 'marketplace-comparison';
  
  private comparisonProducts$ = new BehaviorSubject<MarketplaceItem[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get all products in comparison
   */
  getComparisonProducts(): Observable<MarketplaceItem[]> {
    return this.comparisonProducts$.asObservable();
  }

  /**
   * Get current comparison products as array
   */
  getCurrentComparisonProducts(): MarketplaceItem[] {
    return this.comparisonProducts$.value;
  }

  /**
   * Get comparison count
   */
  getComparisonCount(): number {
    return this.comparisonProducts$.value.length;
  }

  /**
   * Check if product is in comparison
   */
  isInComparison(productId: string): boolean {
    return this.comparisonProducts$.value.some(product => product.id === productId);
  }

  /**
   * Add product to comparison
   */
  addToComparison(product: MarketplaceItem): boolean {
    const currentProducts = this.comparisonProducts$.value;
    
    // Check if already in comparison
    if (this.isInComparison(product.id)) {
      return false;
    }

    // Check if we've reached the maximum
    if (currentProducts.length >= this.maxComparisonItems) {
      return false;
    }

    const updatedProducts = [...currentProducts, product];
    this.updateComparison(updatedProducts);
    return true;
  }

  /**
   * Remove product from comparison
   */
  removeFromComparison(productId: string): boolean {
    const currentProducts = this.comparisonProducts$.value;
    const updatedProducts = currentProducts.filter(product => product.id !== productId);
    
    if (updatedProducts.length !== currentProducts.length) {
      this.updateComparison(updatedProducts);
      return true;
    }
    
    return false;
  }

  /**
   * Toggle product in comparison
   */
  toggleComparison(product: MarketplaceItem): boolean {
    if (this.isInComparison(product.id)) {
      return this.removeFromComparison(product.id);
    } else {
      return this.addToComparison(product);
    }
  }

  /**
   * Clear all products from comparison
   */
  clearComparison(): void {
    this.updateComparison([]);
  }

  /**
   * Get maximum comparison items allowed
   */
  getMaxComparisonItems(): number {
    return this.maxComparisonItems;
  }

  /**
   * Check if comparison is full
   */
  isComparisonFull(): boolean {
    return this.comparisonProducts$.value.length >= this.maxComparisonItems;
  }

  /**
   * Get comparison summary for display
   */
  getComparisonSummary(): {
    count: number;
    maxCount: number;
    isFull: boolean;
    isEmpty: boolean;
    products: MarketplaceItem[];
  } {
    const products = this.comparisonProducts$.value;
    return {
      count: products.length,
      maxCount: this.maxComparisonItems,
      isFull: this.isComparisonFull(),
      isEmpty: products.length === 0,
      products: products
    };
  }

  /**
   * Get comparison analytics
   */
  getComparisonAnalytics(): {
    priceRange: { min: number; max: number; average: number };
    ratingRange: { min: number; max: number; average: number };
    categories: string[];
    stores: string[];
    features: {
      has3DModel: number;
      hasARSupport: number;
      isExclusive: number;
      isNew: number;
      isOnSale: number;
    };
  } {
    const products = this.comparisonProducts$.value;
    
    if (products.length === 0) {
      return {
        priceRange: { min: 0, max: 0, average: 0 },
        ratingRange: { min: 0, max: 0, average: 0 },
        categories: [],
        stores: [],
        features: {
          has3DModel: 0,
          hasARSupport: 0,
          isExclusive: 0,
          isNew: 0,
          isOnSale: 0
        }
      };
    }

    const prices = products.map(p => p.price);
    const ratings = products.map(p => p.rating);
    
    return {
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: prices.reduce((sum, price) => sum + price, 0) / prices.length
      },
      ratingRange: {
        min: Math.min(...ratings),
        max: Math.max(...ratings),
        average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      },
      categories: [...new Set(products.map(p => p.category))],
      stores: [...new Set(products.map(p => p.sourceStore))],
      features: {
        has3DModel: products.filter(p => p.has3DModel).length,
        hasARSupport: products.filter(p => p.hasARSupport).length,
        isExclusive: products.filter(p => p.isExclusive).length,
        isNew: products.filter(p => p.isNew).length,
        isOnSale: products.filter(p => p.isOnSale).length
      }
    };
  }

  /**
   * Export comparison data
   */
  exportComparison(): string {
    const products = this.comparisonProducts$.value;
    const analytics = this.getComparisonAnalytics();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        category: product.category,
        rarity: product.rarity,
        sourceStore: product.sourceStore,
        features: {
          has3DModel: product.has3DModel,
          hasARSupport: product.hasARSupport,
          isExclusive: product.isExclusive,
          isNew: product.isNew,
          isOnSale: product.isOnSale
        }
      })),
      analytics: analytics
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import comparison data
   */
  importComparison(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      if (importData.products && Array.isArray(importData.products)) {
        // This would need to fetch full product data based on IDs
        // For now, just clear the comparison
        this.clearComparison();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import comparison data:', error);
      return false;
    }
  }

  // ===== PRIVATE METHODS =====

  private updateComparison(products: MarketplaceItem[]): void {
    this.comparisonProducts$.next(products);
    this.saveToStorage(products);
  }

  private saveToStorage(products: MarketplaceItem[]): void {
    try {
      const storageData = {
        timestamp: new Date().toISOString(),
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          currency: product.currency,
          images: product.images.slice(0, 1), // Save only first image
          category: product.category,
          rarity: product.rarity,
          rating: product.rating,
          reviewCount: product.reviewCount,
          sourceStore: product.sourceStore,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
          availability: product.availability,
          isOnSale: product.isOnSale,
          originalPrice: product.originalPrice,
          has3DModel: product.has3DModel,
          hasARSupport: product.hasARSupport,
          isExclusive: product.isExclusive,
          isNew: product.isNew
        }))
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save comparison to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const storageData = JSON.parse(stored);
        
        // Check if data is not too old (e.g., 7 days)
        const timestamp = new Date(storageData.timestamp);
        const now = new Date();
        const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 7 && storageData.products) {
          this.comparisonProducts$.next(storageData.products);
        } else {
          // Clear old data
          localStorage.removeItem(this.storageKey);
        }
      }
    } catch (error) {
      console.error('Failed to load comparison from storage:', error);
      localStorage.removeItem(this.storageKey);
    }
  }
}
