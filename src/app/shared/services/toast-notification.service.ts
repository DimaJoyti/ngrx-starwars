import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
  icon?: string;
  persistent?: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private toasts$ = new BehaviorSubject<ToastNotification[]>([]);
  private maxToasts = 5;
  private defaultDuration = 5000; // 5 seconds

  constructor() {}

  /**
   * Get all active toasts
   */
  getToasts(): Observable<ToastNotification[]> {
    return this.toasts$.asObservable();
  }

  /**
   * Show a success toast
   */
  showSuccess(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.addToast({
      type: 'success',
      title,
      message,
      icon: 'check_circle',
      ...options
    });
  }

  /**
   * Show an error toast
   */
  showError(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.addToast({
      type: 'error',
      title,
      message,
      icon: 'error',
      persistent: true, // Errors should be persistent by default
      ...options
    });
  }

  /**
   * Show a warning toast
   */
  showWarning(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.addToast({
      type: 'warning',
      title,
      message,
      icon: 'warning',
      ...options
    });
  }

  /**
   * Show an info toast
   */
  showInfo(title: string, message: string, options?: Partial<ToastNotification>): string {
    return this.addToast({
      type: 'info',
      title,
      message,
      icon: 'info',
      ...options
    });
  }

  /**
   * Show a custom toast
   */
  showCustom(toast: Omit<ToastNotification, 'id' | 'createdAt'>): string {
    return this.addToast(toast);
  }

  /**
   * Remove a specific toast
   */
  removeToast(id: string): void {
    const currentToasts = this.toasts$.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toasts$.next(updatedToasts);
  }

  /**
   * Clear all toasts
   */
  clearAll(): void {
    this.toasts$.next([]);
  }

  /**
   * Clear toasts by type
   */
  clearByType(type: ToastNotification['type']): void {
    const currentToasts = this.toasts$.value;
    const updatedToasts = currentToasts.filter(toast => toast.type !== type);
    this.toasts$.next(updatedToasts);
  }

  // ===== MARKETPLACE SPECIFIC METHODS =====

  /**
   * Show product added to cart notification
   */
  showProductAddedToCart(productName: string): string {
    return this.showSuccess(
      'Added to Cart',
      `${productName} has been added to your cart`,
      {
        icon: 'shopping_cart',
        action: {
          label: 'View Cart',
          handler: () => {
            // Navigate to cart - will be implemented
            console.log('Navigate to cart');
          }
        }
      }
    );
  }

  /**
   * Show product added to wishlist notification
   */
  showProductAddedToWishlist(productName: string): string {
    return this.showSuccess(
      'Added to Wishlist',
      `${productName} has been saved to your wishlist`,
      {
        icon: 'favorite',
        action: {
          label: 'View Wishlist',
          handler: () => {
            // Navigate to wishlist - will be implemented
            console.log('Navigate to wishlist');
          }
        }
      }
    );
  }

  /**
   * Show price drop alert
   */
  showPriceDropAlert(productName: string, oldPrice: number, newPrice: number, currency: string = 'USD'): string {
    const savings = oldPrice - newPrice;
    const percentage = Math.round((savings / oldPrice) * 100);
    
    return this.showInfo(
      'Price Drop Alert! 🎉',
      `${productName} is now ${this.formatPrice(newPrice, currency)} (${percentage}% off!)`,
      {
        icon: 'trending_down',
        persistent: true,
        action: {
          label: 'View Product',
          handler: () => {
            // Navigate to product - will be implemented
            console.log('Navigate to product');
          }
        }
      }
    );
  }

  /**
   * Show sync completion notification
   */
  showSyncCompleted(itemsAdded: number, itemsUpdated: number): string {
    return this.showSuccess(
      'Sync Completed',
      `${itemsAdded} new products added, ${itemsUpdated} products updated`,
      {
        icon: 'sync',
        duration: 7000
      }
    );
  }

  /**
   * Show sync error notification
   */
  showSyncError(error: string): string {
    return this.showError(
      'Sync Failed',
      `Failed to sync with Bright Data: ${error}`,
      {
        icon: 'sync_problem',
        action: {
          label: 'Retry',
          handler: () => {
            // Retry sync - will be implemented
            console.log('Retry sync');
          }
        }
      }
    );
  }

  /**
   * Show out of stock notification
   */
  showOutOfStock(productName: string): string {
    return this.showWarning(
      'Out of Stock',
      `${productName} is currently out of stock`,
      {
        icon: 'inventory_2',
        action: {
          label: 'Notify When Available',
          handler: () => {
            // Set up stock notification - will be implemented
            console.log('Set up stock notification');
          }
        }
      }
    );
  }

  /**
   * Show back in stock notification
   */
  showBackInStock(productName: string): string {
    return this.showSuccess(
      'Back in Stock! 🎉',
      `${productName} is now available`,
      {
        icon: 'inventory',
        persistent: true,
        action: {
          label: 'Buy Now',
          handler: () => {
            // Navigate to product - will be implemented
            console.log('Navigate to product');
          }
        }
      }
    );
  }

  // ===== PRIVATE METHODS =====

  private addToast(toastData: Omit<ToastNotification, 'id' | 'createdAt'>): string {
    const id = this.generateId();
    const toast: ToastNotification = {
      ...toastData,
      id,
      createdAt: new Date(),
      duration: toastData.duration ?? (toastData.persistent ? undefined : this.defaultDuration)
    };

    const currentToasts = this.toasts$.value;
    
    // Remove oldest toast if we've reached the limit
    if (currentToasts.length >= this.maxToasts) {
      currentToasts.shift();
    }

    const updatedToasts = [...currentToasts, toast];
    this.toasts$.next(updatedToasts);

    // Auto-remove toast after duration (if not persistent)
    if (toast.duration && !toast.persistent) {
      setTimeout(() => {
        this.removeToast(id);
      }, toast.duration);
    }

    return id;
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
}
