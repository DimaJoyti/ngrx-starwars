import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import {
  Mission,
  MissionFilter,
  MissionType,
  MissionCategory,
  StarWarsEra,
  Faction,
  MISSION_DIFFICULTY_LABELS,
  MISSION_TYPE_ICONS,
  ERA_COLORS
} from '../../models/mission.model';
import * as MissionActions from '../../store/mission.actions';
import {
  selectFilteredMissions,
  selectMissionLoading,
  selectMissionError,
  selectMissionFilter,
  selectLastSyncStatus,
  selectMissionsNeedingSync
} from '../../store/mission.selectors';

@Component({
  selector: 'app-mission-list',
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables
  missions$: Observable<Mission[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  filter$: Observable<MissionFilter>;
  lastSyncStatus$: Observable<any>;
  needsSync$: Observable<boolean>;

  // Form controls
  searchControl = new FormControl('');
  typeControl = new FormControl('');
  categoryControl = new FormControl('');
  eraControl = new FormControl('');
  factionControl = new FormControl('');
  difficultyMinControl = new FormControl(1);
  difficultyMaxControl = new FormControl(10);

  // Filter options
  missionTypes: MissionType[] = [
    'story', 'exploration', 'combat', 'collection', 'rescue', 
    'stealth', 'racing', 'diplomatic', 'defense', 'escape', 'duel', 'survival'
  ];

  missionCategories: MissionCategory[] = ['main', 'side', 'daily', 'weekly', 'special'];

  starWarsEras: StarWarsEra[] = ['prequel', 'original', 'sequel', 'high_republic', 'old_republic'];

  factions: Faction[] = ['rebel', 'empire', 'republic', 'separatist', 'neutral', 'first_order', 'resistance'];

  // Constants
  difficultyLabels = MISSION_DIFFICULTY_LABELS;
  typeIcons = MISSION_TYPE_ICONS;
  eraColors = ERA_COLORS;

  // View state
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'name' | 'difficulty' | 'duration' | 'era' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private store: Store) {
    this.missions$ = this.store.select(selectFilteredMissions);
    this.loading$ = this.store.select(selectMissionLoading);
    this.error$ = this.store.select(selectMissionError);
    this.filter$ = this.store.select(selectMissionFilter);
    this.lastSyncStatus$ = this.store.select(selectLastSyncStatus);
    this.needsSync$ = this.store.select(selectMissionsNeedingSync);
  }

  ngOnInit(): void {
    // Load missions on component init
    this.store.dispatch(MissionActions.loadMissions());

    // Set up filter subscription
    this.setupFilterSubscription();

    // Check if sync is needed
    this.needsSync$.pipe(takeUntil(this.destroy$)).subscribe(needsSync => {
      if (needsSync) {
        this.store.dispatch(MissionActions.loadLastSyncStatus());
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterSubscription(): void {
    // Combine all filter controls
    const filterChanges$ = combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.typeControl.valueChanges.pipe(startWith('')),
      this.categoryControl.valueChanges.pipe(startWith('')),
      this.eraControl.valueChanges.pipe(startWith('')),
      this.factionControl.valueChanges.pipe(startWith('')),
      this.difficultyMinControl.valueChanges.pipe(startWith(1)),
      this.difficultyMaxControl.valueChanges.pipe(startWith(10))
    ]).pipe(
      map(([searchTerm, type, category, era, faction, difficultyMin, difficultyMax]) => ({
        search_term: searchTerm || undefined,
        type: type || undefined,
        category: category || undefined,
        era: era || undefined,
        faction: faction || undefined,
        difficulty_min: difficultyMin || undefined,
        difficulty_max: difficultyMax || undefined
      } as MissionFilter)),
      takeUntil(this.destroy$)
    );

    // Apply filter changes to store
    filterChanges$.subscribe(filter => {
      this.store.dispatch(MissionActions.setMissionFilter({ filter }));
    });
  }

  // Event handlers
  onMissionSelect(mission: Mission): void {
    this.store.dispatch(MissionActions.selectMission({ mission }));
  }

  onStartMission(mission: Mission): void {
    // This would get the current player ID from the game state
    const playerId = 1; // TODO: Get from current player state
    this.store.dispatch(MissionActions.startMission({ 
      missionId: mission.id, 
      playerId 
    }));
  }

  onRefreshMissions(): void {
    this.store.dispatch(MissionActions.loadMissions());
  }

  onSyncWithBrightData(): void {
    this.store.dispatch(MissionActions.syncWithBrightData());
  }

  onClearFilters(): void {
    this.searchControl.setValue('');
    this.typeControl.setValue('');
    this.categoryControl.setValue('');
    this.eraControl.setValue('');
    this.factionControl.setValue('');
    this.difficultyMinControl.setValue(1);
    this.difficultyMaxControl.setValue(10);
    this.store.dispatch(MissionActions.clearMissionFilter());
  }

  onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onSortChange(sortBy: 'name' | 'difficulty' | 'duration' | 'era'): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'asc';
    }
  }

  // Utility methods
  getDifficultyLabel(difficulty: number): string {
    return this.difficultyLabels[difficulty as keyof typeof this.difficultyLabels] || 'Unknown';
  }

  getTypeIcon(type: MissionType): string {
    return this.typeIcons[type] || 'help-circle';
  }

  getEraColor(era: StarWarsEra): string {
    return this.eraColors[era] || '#666666';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  trackByMissionId(index: number, mission: Mission): number {
    return mission.id;
  }

  // Computed properties
  get sortedMissions$(): Observable<Mission[]> {
    return this.missions$.pipe(
      map(missions => {
        const sorted = [...missions].sort((a, b) => {
          let comparison = 0;
          
          switch (this.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'difficulty':
              comparison = a.difficulty - b.difficulty;
              break;
            case 'duration':
              comparison = a.estimated_duration - b.estimated_duration;
              break;
            case 'era':
              comparison = a.era.localeCompare(b.era);
              break;
          }
          
          return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        
        return sorted;
      })
    );
  }
}
