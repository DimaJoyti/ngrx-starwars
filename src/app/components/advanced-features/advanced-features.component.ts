import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { BrightDataService } from '../../shared/services/bright-data.service';
import { GameMechanicsService, BattleState, ExplorationState, PlayerProgress } from '../../shared/services/game-mechanics.service';
import { Optimized3DRendererService, PerformanceMetrics } from '../../shared/services/optimized-3d-renderer.service';
import { EnhancedStarship, EnhancedPlanet } from '../../shared/models/bright-data-models';

@Component({
  selector: 'app-advanced-features',
  templateUrl: './advanced-features.component.html',
  styleUrls: ['./advanced-features.component.scss']
})
export class AdvancedFeaturesComponent implements OnInit, OnDestroy {
  @ViewChild('optimizedScene', { static: false }) optimizedSceneRef!: ElementRef;

  // Observables
  battleState$: Observable<BattleState | null>;
  explorationState$: Observable<ExplorationState | null>;
  playerProgress$: Observable<PlayerProgress>;
  performanceMetrics$: Observable<PerformanceMetrics>;

  // Component state
  selectedFeature = 'battle';
  availableStarships: EnhancedStarship[] = [];
  availablePlanets: EnhancedPlanet[] = [];
  
  // Battle system
  selectedPlayerShip: EnhancedStarship | null = null;
  selectedEnemyShip: EnhancedStarship | null = null;
  battleInProgress = false;

  // Exploration system
  selectedPlanet: EnhancedPlanet | null = null;
  explorationInProgress = false;

  // Performance monitoring
  performanceOptimized = true;
  showPerformanceMetrics = false;

  // Bright Data features
  starWarsNews: any[] = [];
  trendingTopics: string[] = [];
  socialMentions: any[] = [];
  dataAnalytics: any = null;

  // Loading states
  loadingNews = false;
  loadingTrending = false;
  loadingSocial = false;
  loadingAnalytics = false;

  private destroy$ = new Subject<void>();

  constructor(
    private brightDataService: BrightDataService,
    private gameMechanicsService: GameMechanicsService,
    private optimizedRenderer: Optimized3DRendererService
  ) {
    // Initialize observables
    this.battleState$ = this.gameMechanicsService.getBattleState();
    this.explorationState$ = this.gameMechanicsService.getExplorationState();
    this.playerProgress$ = this.gameMechanicsService.getPlayerProgress();
    this.performanceMetrics$ = this.optimizedRenderer.getPerformanceMetrics();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupSubscriptions();
    this.initializeOptimizedRenderer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.optimizedRenderer.dispose();
  }

  // ===== INITIALIZATION =====

  private loadInitialData(): void {
    // Load starships and planets
    this.brightDataService.getEnhancedStarships()
      .pipe(takeUntil(this.destroy$))
      .subscribe(starships => {
        this.availableStarships = starships;
      });

    this.brightDataService.getEnhancedPlanets()
      .pipe(takeUntil(this.destroy$))
      .subscribe(planets => {
        this.availablePlanets = planets;
      });

    // Load Bright Data features
    this.loadStarWarsNews();
    this.loadTrendingTopics();
    this.loadDataAnalytics();
  }

  private setupSubscriptions(): void {
    // Monitor battle state
    this.battleState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.battleInProgress = state?.isActive || false;
      });

    // Monitor exploration state
    this.explorationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.explorationInProgress = state?.isActive || false;
      });

    // Monitor performance
    this.performanceMetrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        // Auto-adjust optimization based on performance
        if (metrics.fps < 30 && this.performanceOptimized) {
          this.enablePerformanceMode();
        }
      });
  }

  private initializeOptimizedRenderer(): void {
    if (this.optimizedSceneRef) {
      this.optimizedRenderer.initializeOptimizedScene(this.optimizedSceneRef.nativeElement);
    }
  }

  // ===== FEATURE SELECTION =====

  selectFeature(feature: 'battle' | 'exploration' | 'performance' | 'brightdata'): void {
    this.selectedFeature = feature;
    
    switch (feature) {
      case 'brightdata':
        this.loadSocialMentions();
        break;
    }
  }

  // ===== BATTLE SYSTEM =====

  selectPlayerShip(ship: EnhancedStarship): void {
    this.selectedPlayerShip = ship;
  }

  selectEnemyShip(ship: EnhancedStarship): void {
    this.selectedEnemyShip = ship;
  }

  startBattle(): void {
    if (!this.selectedPlayerShip) return;

    this.gameMechanicsService.startBattle(this.selectedPlayerShip, this.selectedEnemyShip || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe(battleState => {
        console.log('Battle started:', battleState);
      });
  }

  playerAttack(): void {
    this.gameMechanicsService.playerAttack();
  }

  // ===== EXPLORATION SYSTEM =====

  selectPlanet(planet: EnhancedPlanet): void {
    this.selectedPlanet = planet;
  }

  startExploration(): void {
    if (!this.selectedPlanet) return;

    this.gameMechanicsService.startExploration(this.selectedPlanet)
      .pipe(takeUntil(this.destroy$))
      .subscribe(explorationState => {
        console.log('Exploration started:', explorationState);
      });
  }

  movePlayer(direction: 'north' | 'south' | 'east' | 'west'): void {
    // Simple movement logic
    const currentState = this.explorationState$.pipe(takeUntil(this.destroy$));
    currentState.subscribe(state => {
      if (state) {
        const newPosition = { ...state.playerPosition };
        const moveDistance = 10;

        switch (direction) {
          case 'north':
            newPosition.z -= moveDistance;
            break;
          case 'south':
            newPosition.z += moveDistance;
            break;
          case 'east':
            newPosition.x += moveDistance;
            break;
          case 'west':
            newPosition.x -= moveDistance;
            break;
        }

        this.gameMechanicsService.movePlayer(newPosition);
      }
    });
  }

  collectResource(resourceType: string): void {
    this.gameMechanicsService.collectResource(resourceType, 1);
  }

  // ===== PERFORMANCE OPTIMIZATION =====

  togglePerformanceMode(): void {
    this.performanceOptimized = !this.performanceOptimized;
    
    if (this.performanceOptimized) {
      this.enablePerformanceMode();
    } else {
      this.disablePerformanceMode();
    }
  }

  private enablePerformanceMode(): void {
    this.optimizedRenderer.updateOptimizationSettings({
      enableLOD: true,
      enableFrustumCulling: true,
      adaptiveQuality: true,
      shadowMapSize: 512,
      antialias: false
    });
  }

  private disablePerformanceMode(): void {
    this.optimizedRenderer.updateOptimizationSettings({
      enableLOD: false,
      enableFrustumCulling: false,
      adaptiveQuality: false,
      shadowMapSize: 2048,
      antialias: true
    });
  }

  togglePerformanceMetrics(): void {
    this.showPerformanceMetrics = !this.showPerformanceMetrics;
  }

  clearModelCache(): void {
    this.optimizedRenderer.clearCache();
  }

  // ===== BRIGHT DATA FEATURES =====

  private loadStarWarsNews(): void {
    this.loadingNews = true;
    this.brightDataService.getStarWarsNews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (news) => {
          this.starWarsNews = news;
          this.loadingNews = false;
        },
        error: (error) => {
          console.error('Error loading news:', error);
          this.loadingNews = false;
        }
      });
  }

  private loadTrendingTopics(): void {
    this.loadingTrending = true;
    this.brightDataService.getTrendingTopics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topics) => {
          this.trendingTopics = topics;
          this.loadingTrending = false;
        },
        error: (error) => {
          console.error('Error loading trending topics:', error);
          this.loadingTrending = false;
        }
      });
  }

  private loadSocialMentions(): void {
    this.loadingSocial = true;
    this.brightDataService.getStarWarsSocialMentions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mentions) => {
          this.socialMentions = mentions;
          this.loadingSocial = false;
        },
        error: (error) => {
          console.error('Error loading social mentions:', error);
          this.loadingSocial = false;
        }
      });
  }

  private loadDataAnalytics(): void {
    this.loadingAnalytics = true;
    this.brightDataService.getDataAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.dataAnalytics = analytics;
          this.loadingAnalytics = false;
        },
        error: (error) => {
          console.error('Error loading analytics:', error);
          this.loadingAnalytics = false;
        }
      });
  }

  searchStarWarsContent(query: string): void {
    if (!query.trim()) return;

    this.brightDataService.searchStarWarsContent(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          console.log('Search results:', results);
          // Handle search results
        },
        error: (error) => {
          console.error('Search error:', error);
        }
      });
  }

  scrapeCharacterData(characterName: string): void {
    this.brightDataService.scrapeCharacterData(characterName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Character data:', data);
          // Handle character data
        },
        error: (error) => {
          console.error('Scraping error:', error);
        }
      });
  }

  enrichStarshipData(starship: EnhancedStarship): void {
    this.brightDataService.enrichStarshipData(starship.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrichedData) => {
          console.log('Enriched starship data:', enrichedData);
          // Update starship with enriched data
        },
        error: (error) => {
          console.error('Enrichment error:', error);
        }
      });
  }

  // ===== UTILITY METHODS =====

  formatPerformanceMetric(value: number, unit: string): string {
    return `${value.toFixed(1)} ${unit}`;
  }

  getHealthPercentage(current: number, max: number): number {
    return Math.round((current / max) * 100);
  }

  getProgressColor(percentage: number): string {
    if (percentage > 70) return 'success';
    if (percentage > 30) return 'warning';
    return 'danger';
  }
}
