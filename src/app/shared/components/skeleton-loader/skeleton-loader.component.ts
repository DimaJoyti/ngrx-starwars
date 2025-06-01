import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [ngClass]="containerClass">
      <!-- Product Card Skeleton -->
      <div *ngIf="type === 'product-card'" class="skeleton-product-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
          <div class="skeleton-rating">
            <div class="skeleton-stars"></div>
            <div class="skeleton-line skeleton-rating-text"></div>
          </div>
          <div class="skeleton-price">
            <div class="skeleton-line skeleton-price-main"></div>
            <div class="skeleton-line skeleton-price-original"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button skeleton-button-primary"></div>
            <div class="skeleton-button skeleton-button-icon"></div>
          </div>
        </div>
      </div>

      <!-- Product Grid Skeleton -->
      <div *ngIf="type === 'product-grid'" class="skeleton-product-grid">
        <div *ngFor="let item of getArray(count)" class="skeleton-product-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-subtitle"></div>
            <div class="skeleton-rating">
              <div class="skeleton-stars"></div>
              <div class="skeleton-line skeleton-rating-text"></div>
            </div>
            <div class="skeleton-price">
              <div class="skeleton-line skeleton-price-main"></div>
            </div>
            <div class="skeleton-actions">
              <div class="skeleton-button skeleton-button-primary"></div>
              <div class="skeleton-button skeleton-button-icon"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results Skeleton -->
      <div *ngIf="type === 'search-results'" class="skeleton-search-results">
        <div class="skeleton-search-header">
          <div class="skeleton-line skeleton-results-count"></div>
          <div class="skeleton-line skeleton-sort-options"></div>
        </div>
        <div class="skeleton-results-grid">
          <div *ngFor="let item of getArray(count)" class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-subtitle"></div>
              <div class="skeleton-line skeleton-price-main"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Text Lines Skeleton -->
      <div *ngIf="type === 'text'" class="skeleton-text">
        <div *ngFor="let item of getArray(count)" 
             class="skeleton-line" 
             [style.width]="getRandomWidth()">
        </div>
      </div>

      <!-- Button Skeleton -->
      <div *ngIf="type === 'button'" class="skeleton-button" [ngClass]="buttonClass"></div>

      <!-- Avatar Skeleton -->
      <div *ngIf="type === 'avatar'" class="skeleton-avatar" [ngClass]="avatarClass"></div>

      <!-- Custom Skeleton -->
      <div *ngIf="type === 'custom'" class="skeleton-custom" [style.width]="width" [style.height]="height"></div>
    </div>
  `,
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() type: 'product-card' | 'product-grid' | 'search-results' | 'text' | 'button' | 'avatar' | 'custom' = 'text';
  @Input() count: number = 3;
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() containerClass: string = '';
  @Input() buttonClass: string = '';
  @Input() avatarClass: string = '';

  getArray(count: number): number[] {
    return Array(count).fill(0).map((_, i) => i);
  }

  getRandomWidth(): string {
    const widths = ['100%', '95%', '85%', '90%', '75%'];
    return widths[Math.floor(Math.random() * widths.length)];
  }
}
