import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MarketplaceItem } from '../../shared/models/marketplace-models';
import { ProductComparisonService } from '../../shared/services/product-comparison.service';
import { ToastNotificationService } from '../../shared/services/toast-notification.service';

@Component({
  selector: 'app-product-comparison',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="comparison-dialog">
      <!-- Header -->
      <div class="comparison-header">
        <h2 mat-dialog-title>
          <mat-icon>compare</mat-icon>
          Product Comparison
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div mat-dialog-content class="comparison-content">
        <div *ngIf="(comparisonProducts$ | async)?.length === 0" class="empty-state">
          <mat-icon>compare</mat-icon>
          <h3>No products to compare</h3>
          <p>Add products to comparison to see them here</p>
        </div>

        <div *ngIf="(comparisonProducts$ | async)?.length! > 0" class="comparison-table-container">
          <!-- Product Headers -->
          <div class="product-headers">
            <div class="feature-column-header">Features</div>
            <div 
              *ngFor="let product of comparisonProducts$ | async; trackBy: trackByProductId"
              class="product-header">
              
              <!-- Product Image -->
              <div class="product-image">
                <img [src]="product.images[0]?.url" [alt]="product.name" loading="lazy">
                <button 
                  mat-icon-button 
                  class="remove-product"
                  (click)="removeFromComparison(product.id)"
                  matTooltip="Remove from comparison">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <!-- Product Info -->
              <div class="product-info">
                <h4 class="product-name">{{ product.name }}</h4>
                <p class="product-brand">{{ product.brand }}</p>
                <div class="product-price">
                  <span class="current-price">{{ formatPrice(product.price, product.currency) }}</span>
                  <span *ngIf="product.originalPrice && product.isOnSale" class="original-price">
                    {{ formatPrice(product.originalPrice, product.currency) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparison Table -->
          <div class="comparison-table">
            <!-- Price Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Price</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value price-value">
                <span class="current-price">{{ formatPrice(product.price, product.currency) }}</span>
                <span *ngIf="product.isOnSale" class="sale-badge">SALE</span>
              </div>
            </div>

            <!-- Rating Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Rating</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value rating-value">
                <div class="rating-display">
                  <div class="stars">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                              [class.filled]="star <= product.rating">
                      star
                    </mat-icon>
                  </div>
                  <span class="rating-text">{{ product.rating }}/5 ({{ product.reviewCount }})</span>
                </div>
              </div>
            </div>

            <!-- Category Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Category</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value">
                <mat-chip>{{ getCategoryDisplayName(product.category) }}</mat-chip>
              </div>
            </div>

            <!-- Rarity Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Rarity</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value">
                <mat-chip [style.background-color]="getRarityColor(product.rarity)">
                  {{ product.rarity | titlecase }}
                </mat-chip>
              </div>
            </div>

            <!-- Availability Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Availability</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value availability-value">
                <mat-chip [ngClass]="'availability-' + product.availability">
                  {{ getAvailabilityDisplayName(product.availability) }}
                </mat-chip>
                <span class="stock-quantity" *ngIf="product.inStock">
                  {{ product.stockQuantity }} in stock
                </span>
              </div>
            </div>

            <!-- Features Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Features</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value features-value">
                <div class="feature-badges">
                  <mat-chip *ngIf="product.has3DModel" class="feature-chip">
                    <mat-icon>3d_rotation</mat-icon>
                    3D Model
                  </mat-chip>
                  <mat-chip *ngIf="product.hasARSupport" class="feature-chip">
                    <mat-icon>view_in_ar</mat-icon>
                    AR Support
                  </mat-chip>
                  <mat-chip *ngIf="product.isExclusive" class="feature-chip exclusive">
                    <mat-icon>star</mat-icon>
                    Exclusive
                  </mat-chip>
                  <mat-chip *ngIf="product.isNew" class="feature-chip new">
                    <mat-icon>fiber_new</mat-icon>
                    New
                  </mat-chip>
                </div>
              </div>
            </div>

            <!-- Source Store Comparison -->
            <div class="comparison-row">
              <div class="feature-label">Store</div>
              <div 
                *ngFor="let product of comparisonProducts$ | async"
                class="feature-value">
                <mat-chip class="store-chip">{{ getStoreDisplayName(product.sourceStore) }}</mat-chip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div mat-dialog-actions class="comparison-actions">
        <button mat-button (click)="clearComparison()" [disabled]="(comparisonProducts$ | async)?.length === 0">
          <mat-icon>clear_all</mat-icon>
          Clear All
        </button>
        
        <div class="spacer"></div>
        
        <button mat-button mat-dialog-close>Close</button>
        <button 
          mat-raised-button 
          color="primary"
          (click)="addSelectedToCart()"
          [disabled]="(comparisonProducts$ | async)?.length === 0">
          <mat-icon>shopping_cart</mat-icon>
          Add All to Cart
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./product-comparison.component.scss']
})
export class ProductComparisonComponent implements OnInit, OnDestroy {
  comparisonProducts$: Observable<MarketplaceItem[]>;
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<ProductComparisonComponent>,
    private comparisonService: ProductComparisonService,
    private toastService: ToastNotificationService
  ) {
    this.comparisonProducts$ = this.comparisonService.getComparisonProducts();
  }

  ngOnInit(): void {
    // Any initialization logic
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeFromComparison(productId: string): void {
    this.comparisonService.removeFromComparison(productId);
    this.toastService.showInfo('Removed from Comparison', 'Product removed from comparison');
  }

  clearComparison(): void {
    this.comparisonService.clearComparison();
    this.toastService.showInfo('Comparison Cleared', 'All products removed from comparison');
  }

  addSelectedToCart(): void {
    this.comparisonProducts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        // This would integrate with cart service
        console.log('Adding products to cart:', products);
        this.toastService.showSuccess(
          'Added to Cart', 
          `${products.length} products added to cart`
        );
      });
  }

  // Utility methods
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  getRarityColor(rarity: string): string {
    const colors = {
      common: '#95A5A6',
      rare: '#3498DB',
      epic: '#9B59B6',
      legendary: '#F39C12',
      exclusive: '#E74C3C'
    };
    return colors[rarity as keyof typeof colors] || '#95A5A6';
  }

  getCategoryDisplayName(category: string): string {
    const categories = {
      'action-figures': 'Action Figures',
      'statues': 'Statues & Busts',
      'replicas': 'Prop Replicas',
      'vehicles': 'Vehicles & Ships',
      'apparel': 'Apparel',
      'accessories': 'Accessories',
      'collectibles': 'Collectibles',
      'books': 'Books & Comics',
      'games': 'Games',
      'home-decor': 'Home & Office',
      'art-prints': 'Art Prints',
      'model-kits': 'Model Kits'
    };
    return categories[category as keyof typeof categories] || category;
  }

  getAvailabilityDisplayName(availability: string): string {
    const availabilities = {
      'in-stock': 'In Stock',
      'pre-order': 'Pre-Order',
      'out-of-stock': 'Out of Stock',
      'discontinued': 'Discontinued'
    };
    return availabilities[availability as keyof typeof availabilities] || availability;
  }

  getStoreDisplayName(store: string): string {
    const stores = {
      'bigbadtoystore': 'BigBadToyStore',
      'sideshow': 'Sideshow Collectibles',
      'hasbro': 'Hasbro Pulse',
      'other': 'Other'
    };
    return stores[store as keyof typeof stores] || store;
  }

  trackByProductId(index: number, product: MarketplaceItem): string {
    return product.id;
  }
}
