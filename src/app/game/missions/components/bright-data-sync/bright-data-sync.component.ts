import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';
import { BrightDataMissionSync } from '../../models/mission.model';
import * as MissionActions from '../../store/mission.actions';
import {
  selectSyncHistory,
  selectLastSyncStatus,
  selectMissionLoading,
  selectMissionError
} from '../../store/mission.selectors';

@Component({
  selector: 'app-bright-data-sync',
  templateUrl: './bright-data-sync.component.html',
  styleUrls: ['./bright-data-sync.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrightDataSyncComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables
  syncHistory$: Observable<BrightDataMissionSync[]>;
  lastSyncStatus$: Observable<BrightDataMissionSync | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Auto-refresh interval (5 minutes)
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000;

  constructor(private store: Store) {
    this.syncHistory$ = this.store.select(selectSyncHistory);
    this.lastSyncStatus$ = this.store.select(selectLastSyncStatus);
    this.loading$ = this.store.select(selectMissionLoading);
    this.error$ = this.store.select(selectMissionError);
  }

  ngOnInit(): void {
    // Load initial data
    this.loadSyncData();

    // Set up auto-refresh
    interval(this.REFRESH_INTERVAL).pipe(
      startWith(0),
      switchMap(() => {
        this.store.dispatch(MissionActions.loadLastSyncStatus());
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSyncData(): void {
    this.store.dispatch(MissionActions.loadSyncHistory());
    this.store.dispatch(MissionActions.loadLastSyncStatus());
  }

  // Event handlers
  onStartSync(): void {
    this.store.dispatch(MissionActions.syncWithBrightData());
  }

  onRefreshData(): void {
    this.loadSyncData();
  }

  onViewSourceUrl(url: string): void {
    window.open(url, '_blank');
  }

  // Utility methods
  getSyncStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'in_progress':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  }

  getSyncStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return 'check-circle';
      case 'failed':
        return 'x-circle';
      case 'in_progress':
        return 'clock';
      default:
        return 'help-circle';
    }
  }

  formatDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getTimeSinceLastSync(lastSyncTime: string): string {
    const now = new Date();
    const lastSync = new Date(lastSyncTime);
    const diff = now.getTime() - lastSync.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  shouldShowSyncRecommendation(lastSyncTime: string): boolean {
    const now = new Date();
    const lastSync = new Date(lastSyncTime);
    const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    // Recommend sync if it's been more than 24 hours
    return hoursSinceLastSync > 24;
  }

  trackBySyncId(index: number, sync: BrightDataMissionSync): number {
    return sync.id;
  }
}
