import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  EnhancedStarship,
  EnhancedPlanet,
  FACTION_COLORS,
  RARITY_COLORS
} from '../../shared/models/bright-data-models';
import { BrightDataService } from '../../shared/services/bright-data.service';
import { BrightData3DService } from '../../shared/services/bright-data-3d.service';
import { MarketplaceService } from '../../shared/services/marketplace.service';
import { MarketplaceHomeComponent } from '../marketplace-home/marketplace-home.component';
import * as BrightDataActions from '../../store/bright-data/bright-data.actions';
import { BrightDataState } from '../../store/bright-data/bright-data.reducer';

@Component({
  selector: 'app-bright-data-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MarketplaceHomeComponent
  ],
  templateUrl: './bright-data-dashboard.component.html',
  styleUrls: ['./bright-data-dashboard.component.scss']
})
export class BrightDataDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('scene3D', { static: false }) scene3DRef!: ElementRef;

  // Observables from store
  starships$: Observable<EnhancedStarship[]>;
  planets$: Observable<EnhancedPlanet[]>;
  selectedStarship$: Observable<EnhancedStarship | null>;
  selectedPlanet$: Observable<EnhancedPlanet | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedView$: Observable<string>;

  // Component state
  selectedTab = 'marketplace';
  selectedTabIndex = 0;
  searchQuery = '';
  selectedFaction = 'all';
  selectedRarity = 'all';
  selectedClimate = 'all';
  
  // 3D Scene state
  scene3DInitialized = false;
  currentSceneType: 'starship' | 'planet' | 'battle' | null = null;

  // Constants for templates
  readonly FACTION_COLORS = FACTION_COLORS;
  readonly RARITY_COLORS = RARITY_COLORS;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<{ brightData: BrightDataState }>,
    private brightDataService: BrightDataService,
    private brightData3DService: BrightData3DService
  ) {
    // Initialize observables
    this.starships$ = this.store.select(state => state.brightData.starships);
    this.planets$ = this.store.select(state => state.brightData.planets);
    this.selectedStarship$ = this.store.select(state => state.brightData.selectedStarship);
    this.selectedPlanet$ = this.store.select(state => state.brightData.selectedPlanet);
    this.loading$ = this.store.select(state => state.brightData.ui.loading);
    this.error$ = this.store.select(state => state.brightData.ui.error);
    this.selectedView$ = this.store.select(state => state.brightData.ui.selectedView);
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.brightData3DService.dispose();
  }

  // ===== INITIALIZATION METHODS =====

  private loadInitialData(): void {
    // Load enhanced data from Bright Data MCP
    this.store.dispatch(BrightDataActions.loadEnhancedStarships());
    this.store.dispatch(BrightDataActions.loadEnhancedPlanets());
  }

  private setupSubscriptions(): void {
    // Subscribe to selected starship changes for 3D display
    this.selectedStarship$
      .pipe(takeUntil(this.destroy$))
      .subscribe(starship => {
        if (starship && this.scene3DInitialized) {
          this.load3DStarship(starship);
        }
      });

    // Subscribe to selected planet changes for 3D display
    this.selectedPlanet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(planet => {
        if (planet && this.scene3DInitialized) {
          this.load3DPlanet(planet);
        }
      });

    // Subscribe to 3D scene initialization
    this.brightData3DService.isSceneInitialized()
      .pipe(takeUntil(this.destroy$))
      .subscribe(initialized => {
        this.scene3DInitialized = initialized;
      });
  }

  // ===== TAB AND VIEW METHODS =====

  selectTab(tabIndex: number): void {
    this.selectedTabIndex = tabIndex;

    const tabNames = ['marketplace', 'starships', 'planets', '3d-viewer'];
    const selectedTabName = tabNames[tabIndex] || 'marketplace';
    this.selectedTab = selectedTabName;

    this.store.dispatch(BrightDataActions.setSelectedView({ view: selectedTabName }));

    // Initialize 3D scene based on tab (only for 3D viewer tab)
    if (selectedTabName === '3d-viewer' && this.scene3DRef && !this.scene3DInitialized) {
      this.initialize3DScene('starships');
    }
  }

  // ===== STARSHIP METHODS =====

  selectStarship(starship: EnhancedStarship): void {
    this.store.dispatch(BrightDataActions.selectStarshipFor3D({ starship }));
  }

  filterStarshipsByFaction(faction: 'rebel' | 'empire' | 'neutral' | 'all'): void {
    this.selectedFaction = faction;
    this.store.dispatch(BrightDataActions.filterStarshipsByFaction({ faction }));
  }

  filterStarshipsByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'all'): void {
    this.selectedRarity = rarity;
    this.store.dispatch(BrightDataActions.filterStarshipsByRarity({ rarity }));
  }

  searchStarships(): void {
    if (this.searchQuery.trim()) {
      this.store.dispatch(BrightDataActions.searchStarships({ query: this.searchQuery }));
    }
  }

  startBattle(starship: EnhancedStarship): void {
    this.store.dispatch(BrightDataActions.startBattleWithStarship({ starship }));
    this.selectTab('battle');
  }

  // ===== PLANET METHODS =====

  selectPlanet(planet: EnhancedPlanet): void {
    this.store.dispatch(BrightDataActions.selectPlanetFor3D({ planet }));
  }

  filterPlanetsByClimate(climate: string): void {
    this.selectedClimate = climate;
    this.store.dispatch(BrightDataActions.filterPlanetsByClimate({ climate }));
  }

  searchPlanets(): void {
    if (this.searchQuery.trim()) {
      this.store.dispatch(BrightDataActions.searchPlanets({ query: this.searchQuery }));
    }
  }

  explorePlanet(planet: EnhancedPlanet): void {
    this.store.dispatch(BrightDataActions.explorePlanet({ planet }));
    this.selectTab('exploration');
  }

  // ===== 3D METHODS =====

  private initialize3DScene(sceneType: 'starships' | 'planets' | 'battle' | 'exploration'): void {
    if (!this.scene3DRef) return;

    let scene3DType: 'starship' | 'planet' | 'battle';
    
    switch (sceneType) {
      case 'starships':
        scene3DType = 'starship';
        break;
      case 'planets':
        scene3DType = 'planet';
        break;
      case 'battle':
        scene3DType = 'battle';
        break;
      case 'exploration':
        scene3DType = 'planet';
        break;
      default:
        scene3DType = 'starship';
    }

    this.currentSceneType = scene3DType;
    this.brightData3DService.initializeScene(this.scene3DRef.nativeElement, scene3DType);
    this.store.dispatch(BrightDataActions.initialize3DScene({ sceneType: scene3DType }));
  }

  private load3DStarship(starship: EnhancedStarship): void {
    this.brightData3DService.loadStarship(starship)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (model) => {
          console.log('Starship 3D model loaded:', starship.name);
          this.store.dispatch(BrightDataActions.load3DModelSuccess({ 
            modelId: starship.name, 
            model 
          }));
        },
        error: (error) => {
          console.error('Failed to load starship 3D model:', error);
          this.store.dispatch(BrightDataActions.load3DModelFailure({ error: error.message }));
        }
      });
  }

  private load3DPlanet(planet: EnhancedPlanet): void {
    this.brightData3DService.loadPlanet(planet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (model) => {
          console.log('Planet 3D model loaded:', planet.name);
          this.store.dispatch(BrightDataActions.load3DModelSuccess({ 
            modelId: planet.name, 
            model 
          }));
        },
        error: (error) => {
          console.error('Failed to load planet 3D model:', error);
          this.store.dispatch(BrightDataActions.load3DModelFailure({ error: error.message }));
        }
      });
  }

  // ===== DATA SYNC METHODS =====

  syncWithBrightData(): void {
    this.store.dispatch(BrightDataActions.syncWithBrightData());
  }

  refreshData(): void {
    this.store.dispatch(BrightDataActions.refreshDataFromAPI());
  }

  // ===== UTILITY METHODS =====

  getStarshipRarityColor(rarity: string): string {
    return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#95A5A6';
  }

  getStarshipFactionColor(faction: string): string {
    return FACTION_COLORS[faction as keyof typeof FACTION_COLORS] || '#95A5A6';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value);
  }

  getStarshipSpeedRating(starship: EnhancedStarship): number {
    if (!starship.technicalSpecs) return 0;
    return Math.round((starship.technicalSpecs.maxSpeedKmh / 1200) * 100);
  }

  getStarshipAgilityRating(starship: EnhancedStarship): number {
    if (!starship.physicsConfig) return 0;
    return Math.round(starship.physicsConfig.agility * 10);
  }

  getPlanetDifficultyRating(planet: EnhancedPlanet): number {
    if (!planet.gameplayData) return 0;
    return planet.gameplayData.explorationDifficulty;
  }

  // ===== ERROR HANDLING =====

  clearError(): void {
    this.store.dispatch(BrightDataActions.clearError());
  }

  // ===== TEMPLATE HELPERS =====

  trackByStarshipId(index: number, starship: EnhancedStarship): number {
    return starship.id;
  }

  trackByPlanetId(index: number, planet: EnhancedPlanet): number {
    return planet.id;
  }
}
