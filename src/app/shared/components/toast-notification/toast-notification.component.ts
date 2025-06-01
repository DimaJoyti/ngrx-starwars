import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ToastNotificationService, ToastNotification } from '../../services/toast-notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="toast-container" [@toastAnimation]="(toasts$ | async)?.length">
      <div 
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        class="toast"
        [ngClass]="'toast-' + toast.type"
        [@slideIn]
        (click)="onToastClick(toast)">
        
        <!-- Toast Icon -->
        <div class="toast-icon" *ngIf="toast.icon">
          <mat-icon>{{ toast.icon }}</mat-icon>
        </div>

        <!-- Toast Content -->
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
          
          <!-- Toast Action -->
          <button 
            *ngIf="toast.action"
            mat-button
            class="toast-action-button"
            (click)="onActionClick(toast, $event)">
            {{ toast.action.label }}
          </button>
        </div>

        <!-- Close Button -->
        <button 
          mat-icon-button
          class="toast-close"
          (click)="onCloseClick(toast, $event)"
          aria-label="Close notification">
          <mat-icon>close</mat-icon>
        </button>

        <!-- Progress Bar (for non-persistent toasts) -->
        <div 
          *ngIf="toast.duration && !toast.persistent"
          class="toast-progress"
          [style.animation-duration]="toast.duration + 'ms'">
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toast-notification.component.scss'],
  animations: [
    trigger('toastAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ transform: 'translateX(100%)', opacity: 0 }),
          stagger(100, [
            animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger(50, [
            animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  toasts$: Observable<ToastNotification[]>;
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastNotificationService) {
    this.toasts$ = this.toastService.getToasts();
  }

  ngOnInit(): void {
    // Subscribe to toasts for any additional logic if needed
    this.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        // Could add analytics or other side effects here
        console.log(`Active toasts: ${toasts.length}`);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToastClick(toast: ToastNotification): void {
    // Optional: Handle toast click (e.g., for expandable toasts)
    console.log('Toast clicked:', toast.title);
  }

  onActionClick(toast: ToastNotification, event: Event): void {
    event.stopPropagation();
    
    if (toast.action) {
      toast.action.handler();
      
      // Auto-close toast after action (unless persistent)
      if (!toast.persistent) {
        this.toastService.removeToast(toast.id);
      }
    }
  }

  onCloseClick(toast: ToastNotification, event: Event): void {
    event.stopPropagation();
    this.toastService.removeToast(toast.id);
  }

  trackByToastId(index: number, toast: ToastNotification): string {
    return toast.id;
  }
}
