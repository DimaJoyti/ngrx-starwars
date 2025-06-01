import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, filter, switchMap } from 'rxjs/operators';
import {
  Mission,
  MissionProgress,
  MissionStatistics,
  MISSION_DIFFICULTY_LABELS,
  MISSION_TYPE_ICONS,
  ERA_COLORS
} from '../../models/mission.model';
import * as MissionActions from '../../store/mission.actions';
import {
  selectSelectedMission,
  selectCurrentProgress,
  selectMissionLoading,
  selectMissionError,
  selectMissionStatisticsById
} from '../../store/mission.selectors';

@Component({
  selector: 'app-mission-detail',
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables
  mission$: Observable<Mission | null>;
  progress$: Observable<MissionProgress | null>;
  statistics$: Observable<MissionStatistics | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Constants
  difficultyLabels = MISSION_DIFFICULTY_LABELS;
  typeIcons = MISSION_TYPE_ICONS;
  eraColors = ERA_COLORS;

  // Current player (would come from game state)
  currentPlayerId = 1; // TODO: Get from current player state

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.mission$ = this.store.select(selectSelectedMission);
    this.progress$ = this.store.select(selectCurrentProgress);
    this.loading$ = this.store.select(selectMissionLoading);
    this.error$ = this.store.select(selectMissionError);
  }

  ngOnInit(): void {
    // Get mission ID from route and load mission
    this.route.params.pipe(
      map(params => +params['id']),
      filter(id => !isNaN(id)),
      switchMap(missionId => {
        // Load mission by ID (this would need to be implemented in the store)
        this.store.dispatch(MissionActions.loadMissions());
        
        // Load mission progress
        this.store.dispatch(MissionActions.loadMissionProgress({ 
          missionId, 
          playerId: this.currentPlayerId 
        }));
        
        // Load mission statistics
        this.store.dispatch(MissionActions.loadMissionStatistics({ missionId }));
        
        // Set up statistics observable
        this.statistics$ = this.store.select(selectMissionStatisticsById(missionId));
        
        return this.mission$.pipe(
          filter(mission => mission?.id === missionId),
          takeUntil(this.destroy$)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(mission => {
      if (mission) {
        this.store.dispatch(MissionActions.selectMission({ mission }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(MissionActions.clearSelectedMission());
  }

  // Event handlers
  onStartMission(mission: Mission): void {
    this.store.dispatch(MissionActions.startMission({ 
      missionId: mission.id, 
      playerId: this.currentPlayerId 
    }));
  }

  onCompleteMission(mission: Mission, rating: number): void {
    this.store.dispatch(MissionActions.completeMission({ 
      missionId: mission.id, 
      playerId: this.currentPlayerId,
      rating 
    }));
  }

  onLaunchUnity(mission: Mission): void {
    // Send mission data to Unity
    this.store.dispatch(MissionActions.sendMissionDataToUnity({ 
      missionId: mission.id, 
      playerId: this.currentPlayerId 
    }));
  }

  onBackToList(): void {
    this.router.navigate(['/game/missions']);
  }

  onViewWookieepedia(url: string): void {
    window.open(url, '_blank');
  }

  // Utility methods
  getDifficultyLabel(difficulty: number): string {
    return this.difficultyLabels[difficulty as keyof typeof this.difficultyLabels] || 'Unknown';
  }

  getTypeIcon(type: string): string {
    return this.typeIcons[type as keyof typeof this.typeIcons] || 'help-circle';
  }

  getEraColor(era: string): string {
    return this.eraColors[era as keyof typeof this.eraColors] || '#666666';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  getProgressPercentage(progress: MissionProgress): number {
    return Math.round(progress.progress_percentage);
  }

  getCompletionTime(progress: MissionProgress): string {
    if (!progress.time_spent) return 'N/A';
    
    const hours = Math.floor(progress.time_spent / 3600);
    const minutes = Math.floor((progress.time_spent % 3600) / 60);
    const seconds = progress.time_spent % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'star-filled' : 'star-empty');
    }
    return stars;
  }

  canStartMission(mission: Mission, progress: MissionProgress | null): boolean {
    if (!mission.is_active) return false;
    if (!progress) return true;
    if (progress.status === 'completed' && mission.is_repeatable) return true;
    return progress.status === 'not_started' || progress.status === 'failed' || progress.status === 'abandoned';
  }

  canCompleteMission(progress: MissionProgress | null): boolean {
    return progress?.status === 'in_progress' && progress.progress_percentage >= 100;
  }

  // Computed properties
  get missionWithProgress$(): Observable<{mission: Mission, progress: MissionProgress | null} | null> {
    return combineLatest([this.mission$, this.progress$]).pipe(
      map(([mission, progress]) => mission ? { mission, progress } : null)
    );
  }

  get objectiveProgress$(): Observable<any[]> {
    return combineLatest([this.mission$, this.progress$]).pipe(
      map(([mission, progress]) => {
        if (!mission || !mission.objectives) return [];
        
        return mission.objectives.map(objective => ({
          ...objective,
          progress_percentage: progress ? 
            Math.min(100, (objective.current_count / objective.target_count) * 100) : 0,
          is_completed: progress ? objective.is_completed : false
        }));
      })
    );
  }
}
