import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ThreeService } from '../../../shared/three/three.service';
import { PhysicsService } from '../../../shared/three/physics.service';
import { AnimationService } from '../../../shared/three/animation.service';
import {
  Battle3DService,
  BattleState,
  BattleEvent,
  BattleShip,
  BattleWeapon
} from '../../../shared/three/battle-3d.service';
import { WaveSystemService, WaveState } from '../../../shared/three/wave-system.service';
import { PowerUpSystemService, ActivePowerUp } from '../../../shared/three/powerup-system.service';
import { WeaponSystemService, AdvancedWeapon } from '../../../shared/three/weapon-system.service';
import { EnvironmentalHazardsService, EnvironmentalHazard } from '../../../shared/three/environmental-hazards.service';
import { AchievementSystemService, Achievement, PlayerStats } from '../../../shared/three/achievement-system.service';
import { SwapiService } from '../../../characters/swapi.service';
import { Starship } from '../../../characters/models/starship';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSliderModule,
    FormsModule
  ],
  template: `
    <div class="battle-arena-container">
      <!-- 3D Battle Canvas -->
      <div class="battle-main">
        <div #battleContainer class="battle-canvas"
             [style.width.px]="1200"
             [style.height.px]="800">
        </div>

        <!-- Battle Controls -->
        <div class="battle-controls">
          <button mat-mini-fab
                  [color]="battleState.isActive ? 'warn' : 'primary'"
                  (click)="toggleBattle()"
                  [disabled]="!playerShip">
            <mat-icon>{{ battleState.isActive ? 'pause' : 'play_arrow' }}</mat-icon>
          </button>

          <button mat-mini-fab color="accent" (click)="resetCamera()">
            <mat-icon>center_focus_strong</mat-icon>
          </button>

          <button mat-mini-fab (click)="toggleAutoCamera()">
            <mat-icon>{{ autoCamera ? 'videocam' : 'videocam_off' }}</mat-icon>
          </button>
        </div>

        <!-- Loading -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Initializing Battle Arena...</p>
        </div>
      </div>

      <!-- Battle UI -->
      <div class="battle-ui">
        <!-- Player Ship Status -->
        <div class="ship-status player-status" *ngIf="playerShip">
          <h3>{{ playerShip.starship3D.name }}</h3>
          <div class="status-bars">
            <div class="status-bar">
              <span>Health</span>
              <mat-progress-bar mode="determinate"
                               [value]="(playerShip.health / playerShip.maxHealth) * 100"
                               color="warn">
              </mat-progress-bar>
              <span>{{ playerShip.health }}/{{ playerShip.maxHealth }}</span>
            </div>

            <div class="status-bar">
              <span>Energy</span>
              <mat-progress-bar mode="determinate"
                               [value]="(playerShip.energy / playerShip.maxEnergy) * 100"
                               color="primary">
              </mat-progress-bar>
              <span>{{ Math.round(playerShip.energy) }}/{{ playerShip.maxEnergy }}</span>
            </div>

            <div class="status-bar">
              <span>Shields</span>
              <mat-progress-bar mode="determinate"
                               [value]="(playerShip.shields.strength / playerShip.shields.maxStrength) * 100"
                               color="accent">
              </mat-progress-bar>
              <span>{{ Math.round(playerShip.shields.strength) }}/{{ playerShip.shields.maxStrength }}</span>
            </div>
          </div>
        </div>

        <!-- Battle Stats -->
        <div class="battle-stats">
          <div class="stat-item">
            <mat-icon>timer</mat-icon>
            <span>{{ formatTime(battleState.timeElapsed) }}</span>
          </div>
          <div class="stat-item">
            <mat-icon>stars</mat-icon>
            <span>Score: {{ waveState.totalScore || battleState.score }}</span>
          </div>
          <div class="stat-item">
            <mat-icon>waves</mat-icon>
            <span>Wave: {{ waveState.currentWave }}</span>
          </div>
          <div class="stat-item">
            <mat-icon>group</mat-icon>
            <span>Enemies: {{ waveState.enemiesRemaining }}</span>
          </div>
          <div class="stat-item" *ngIf="waveState.isActive">
            <mat-icon>trending_up</mat-icon>
            <span>Difficulty: {{ waveState.difficulty.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Wave Progress -->
        <div class="wave-progress" *ngIf="waveState.isActive">
          <h4>Wave Progress</h4>
          <mat-progress-bar mode="determinate"
                           [value]="waveState.waveProgress * 100"
                           color="accent">
          </mat-progress-bar>
          <span class="progress-text">
            {{ waveState.totalEnemies - waveState.enemiesRemaining }}/{{ waveState.totalEnemies }}
          </span>
        </div>

        <!-- Active Power-ups -->
        <div class="active-powerups" *ngIf="activePowerUps.length > 0">
          <h4>Active Power-ups</h4>
          <div class="powerup-item" *ngFor="let powerUp of activePowerUps">
            <div class="powerup-info">
              <span class="powerup-name">{{ getPowerUpDisplayName(powerUp.type) }}</span>
              <span class="powerup-time">{{ getPowerUpRemainingTime(powerUp) }}s</span>
            </div>
            <mat-progress-bar mode="determinate"
                             [value]="getPowerUpProgress(powerUp)"
                             color="primary">
            </mat-progress-bar>
          </div>
        </div>

        <!-- Environmental Hazards -->
        <div class="hazards-panel" *ngIf="activeHazards.length > 0">
          <h4>⚠️ Environmental Hazards</h4>
          <div class="hazard-item" *ngFor="let hazard of activeHazards">
            <div class="hazard-info">
              <span class="hazard-name">{{ getHazardDisplayName(hazard.type) }}</span>
              <span class="hazard-distance">{{ getHazardDistance(hazard) }}m</span>
            </div>
            <mat-progress-bar mode="determinate"
                             [value]="getHazardLifeProgress(hazard)"
                             color="warn">
            </mat-progress-bar>
          </div>
        </div>

        <!-- Recent Achievements -->
        <div class="achievements-panel" *ngIf="recentAchievements.length > 0">
          <h4>🏆 Recent Achievements</h4>
          <div class="achievement-item" *ngFor="let achievement of recentAchievements">
            <div class="achievement-info">
              <span class="achievement-icon">{{ achievement.icon }}</span>
              <div class="achievement-details">
                <span class="achievement-name">{{ achievement.name }}</span>
                <span class="achievement-desc">{{ achievement.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Player Stats -->
        <div class="stats-panel">
          <h4>📊 Statistics</h4>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-label">Enemies Destroyed:</span>
              <span class="stat-value">{{ playerStats.enemiesDestroyed || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ getAccuracy() }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Credits Earned:</span>
              <span class="stat-value">{{ playerStats.creditsEarned || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Highest Wave:</span>
              <span class="stat-value">{{ playerStats.highestWave || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Weapon Controls -->
        <div class="weapon-controls" *ngIf="playerShip">
          <h4>Weapons</h4>
          <div class="weapons">
            <button *ngFor="let weapon of playerShip.weapons"
                    mat-raised-button
                    [color]="canFireWeapon(weapon) ? 'primary' : 'basic'"
                    [disabled]="!canFireWeapon(weapon)"
                    (click)="fireWeapon(weapon.id)">
              <mat-icon>{{ getWeaponIcon(weapon.type) }}</mat-icon>
              {{ weapon.type | titlecase }}
              <span class="cooldown" *ngIf="!canFireWeapon(weapon)">
                {{ getWeaponCooldown(weapon) }}s
              </span>
            </button>
          </div>
        </div>

        <!-- Enemy Ships -->
        <div class="enemy-list" *ngIf="battleState.enemyShips.length > 0">
          <h4>Enemy Ships</h4>
          <div class="enemy-ship" *ngFor="let enemy of battleState.enemyShips">
            <div class="enemy-info">
              <span class="enemy-name">{{ enemy.starship3D.name }}</span>
              <mat-progress-bar mode="determinate"
                               [value]="(enemy.health / enemy.maxHealth) * 100"
                               color="warn">
              </mat-progress-bar>
            </div>
            <button mat-icon-button (click)="targetEnemy(enemy)">
              <mat-icon>gps_fixed</mat-icon>
            </button>
          </div>
        </div>

        <!-- Battle Log -->
        <div class="battle-log">
          <h4>Battle Log</h4>
          <div class="log-entries">
            <div *ngFor="let event of battleEvents.slice(-5)"
                 class="log-entry"
                 [class]="'log-' + event.type">
              {{ formatBattleEvent(event) }}
            </div>
          </div>
        </div>

        <!-- Debug Controls -->
        <div class="debug-controls" *ngIf="!isLoading">
          <h4>🔧 Debug Controls</h4>
          <div class="debug-buttons">
            <button mat-raised-button color="accent" (click)="createRandomEnemy()">
              <mat-icon>add</mat-icon>
              Add Enemy
            </button>
            <button mat-raised-button color="warn" (click)="spawnHazard()">
              <mat-icon>warning</mat-icon>
              Spawn Hazard
            </button>
            <button mat-raised-button color="primary" (click)="giveRandomPowerUp()">
              <mat-icon>star</mat-icon>
              Power-up
            </button>
            <button mat-raised-button color="accent" (click)="testAchievement()">
              <mat-icon>emoji_events</mat-icon>
              Test Achievement
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="navigation">
        <button mat-fab color="accent" routerLink="/game/battle">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .battle-arena-container {
      height: 100vh;
      background: radial-gradient(ellipse at center, #0f0f23 0%, #000000 100%);
      display: flex;
      overflow: hidden;
    }

    .battle-main {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .battle-canvas {
      border: 2px solid #ffd700;
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      background: radial-gradient(ellipse at center, #1a1a2e 0%, #000000 100%);
    }

    .battle-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .battle-controls button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      border-radius: 12px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #333;
      border-top: 4px solid #ffd700;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .battle-ui {
      width: 350px;
      background: rgba(0, 0, 0, 0.9);
      border-left: 1px solid #ffd700;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .ship-status h3 {
      color: #ffd700;
      margin: 0 0 12px 0;
    }

    .status-bars {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: white;
    }

    .status-bar span:first-child {
      min-width: 60px;
    }

    .status-bar span:last-child {
      min-width: 50px;
      text-align: right;
      font-size: 10px;
    }

    .status-bar mat-progress-bar {
      flex: 1;
    }

    .battle-stats {
      background: rgba(26, 26, 46, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ffd700;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
      color: white;
      font-size: 14px;
    }

    .stat-item mat-icon {
      color: #ffd700;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .weapon-controls h4 {
      color: #ffd700;
      margin: 0 0 12px 0;
    }

    .weapons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .weapons button {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
      text-align: left;
    }

    .cooldown {
      margin-left: auto;
      font-size: 10px;
      opacity: 0.7;
    }

    .enemy-list h4 {
      color: #ffd700;
      margin: 0 0 12px 0;
    }

    .enemy-ship {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      padding: 8px;
      background: rgba(26, 26, 46, 0.5);
      border-radius: 4px;
    }

    .enemy-info {
      flex: 1;
    }

    .enemy-name {
      display: block;
      color: white;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .battle-log h4 {
      color: #ffd700;
      margin: 0 0 12px 0;
    }

    .log-entries {
      max-height: 150px;
      overflow-y: auto;
    }

    .log-entry {
      padding: 4px 8px;
      margin: 2px 0;
      border-radius: 4px;
      font-size: 11px;
      color: white;
    }

    .log-ship_hit { background: rgba(255, 68, 68, 0.3); }
    .log-ship_destroyed { background: rgba(255, 0, 0, 0.5); }
    .log-weapon_fired { background: rgba(68, 255, 68, 0.3); }
    .log-shield_down { background: rgba(255, 255, 68, 0.3); }
    .log-wave_complete { background: rgba(68, 68, 255, 0.3); }
    .log-wave_started { background: rgba(68, 255, 255, 0.3); }
    .log-powerup_collected { background: rgba(255, 255, 68, 0.3); }
    .log-battle_end { background: rgba(255, 68, 255, 0.3); }

    .wave-progress {
      background: rgba(26, 26, 46, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ffd700;
    }

    .wave-progress h4 {
      color: #ffd700;
      margin: 0 0 8px 0;
    }

    .progress-text {
      display: block;
      text-align: center;
      color: white;
      font-size: 12px;
      margin-top: 4px;
    }

    .active-powerups {
      background: rgba(26, 26, 46, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ffd700;
    }

    .active-powerups h4 {
      color: #ffd700;
      margin: 0 0 12px 0;
    }

    .powerup-item {
      margin: 8px 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }

    .powerup-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .powerup-name {
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .powerup-time {
      color: #ffd700;
      font-size: 11px;
    }

    .hazards-panel {
      background: rgba(46, 26, 26, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ff4444;
      margin-bottom: 12px;
    }

    .hazards-panel h4 {
      color: #ff4444;
      margin: 0 0 12px 0;
    }

    .hazard-item {
      margin: 8px 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }

    .hazard-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .hazard-name {
      color: #ff6666;
      font-size: 12px;
      font-weight: bold;
    }

    .hazard-distance {
      color: #ffaa66;
      font-size: 11px;
    }

    .achievements-panel {
      background: rgba(26, 46, 26, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #44ff44;
      margin-bottom: 12px;
    }

    .achievements-panel h4 {
      color: #44ff44;
      margin: 0 0 12px 0;
    }

    .achievement-item {
      margin: 8px 0;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      display: flex;
      align-items: center;
    }

    .achievement-icon {
      font-size: 20px;
      margin-right: 8px;
    }

    .achievement-details {
      display: flex;
      flex-direction: column;
    }

    .achievement-name {
      color: #66ff66;
      font-size: 12px;
      font-weight: bold;
    }

    .achievement-desc {
      color: #aaffaa;
      font-size: 10px;
    }

    .stats-panel {
      background: rgba(26, 26, 46, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #4444ff;
      margin-bottom: 12px;
    }

    .stats-panel h4 {
      color: #4444ff;
      margin: 0 0 12px 0;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      padding: 4px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }

    .stat-label {
      color: #aaaaff;
      font-size: 10px;
    }

    .stat-value {
      color: #ffffff;
      font-size: 12px;
      font-weight: bold;
    }

    .navigation {
      position: absolute;
      bottom: 20px;
      left: 20px;
    }

    .navigation button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
    }

    .debug-controls {
      background: rgba(46, 26, 46, 0.8);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #ff44ff;
      margin-top: 12px;
    }

    .debug-controls h4 {
      color: #ff44ff;
      margin: 0 0 12px 0;
    }

    .debug-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .debug-buttons button {
      font-size: 10px;
      padding: 4px 8px;
      min-width: auto;
    }
  `]
})
export class BattleArenaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('battleContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

  // 3D об'єкти
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;

  // Стан бою
  battleState: BattleState = {
    isActive: false,
    isPaused: false,
    timeElapsed: 0,
    playerShip: null,
    enemyShips: [],
    projectiles: [],
    explosions: [],
    score: 0,
    wave: 1
  };

  playerShip: BattleShip | null = null;
  targetedEnemy: BattleShip | null = null;
  battleEvents: BattleEvent[] = [];
  isLoading = true;
  autoCamera = true;

  // Enhanced systems state
  waveState: WaveState = {
    currentWave: 1,
    isActive: false,
    enemiesRemaining: 0,
    totalEnemies: 0,
    nextWaveIn: 0,
    waveProgress: 0,
    totalScore: 0,
    difficulty: 1
  };
  activePowerUps: ActivePowerUp[] = [];
  activeWeapons: AdvancedWeapon[] = [];
  activeHazards: EnvironmentalHazard[] = [];
  recentAchievements: Achievement[] = [];
  playerStats: PlayerStats = {} as PlayerStats;

  // System services
  private waveSystemService!: WaveSystemService;
  private powerUpSystemService!: PowerUpSystemService;
  private weaponSystemService!: WeaponSystemService;
  private environmentalHazardsService!: EnvironmentalHazardsService;
  private achievementSystemService!: AchievementSystemService;

  // Керування
  private keys: { [key: string]: boolean } = {};

  // Підписки
  private subscriptions: Subscription[] = [];

  // Доступ до Math та Date для шаблону
  Math = Math;
  Date = Date;

  constructor(
    private threeService: ThreeService,
    private physicsService: PhysicsService,
    private animationService: AnimationService,
    private battle3DService: Battle3DService,
    private swapiService: SwapiService
  ) {}

  ngOnInit(): void {
    console.log('🎮 BattleArenaComponent: ngOnInit started');
    try {
      this.setupSubscriptions();
      this.setupKeyboardControls();
      console.log('✅ BattleArenaComponent: ngOnInit completed successfully');
    } catch (error) {
      console.error('❌ BattleArenaComponent: Error in ngOnInit:', error);
    }
  }

  ngAfterViewInit(): void {
    console.log('🎮 BattleArenaComponent: ngAfterViewInit started');
    try {
      this.initializeBattleArena();
      console.log('✅ BattleArenaComponent: ngAfterViewInit completed successfully');
    } catch (error) {
      console.error('❌ BattleArenaComponent: Error in ngAfterViewInit:', error);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Налаштування підписок
   */
  private setupSubscriptions(): void {
    this.subscriptions.push(
      this.battle3DService.battleState$.subscribe(state => {
        this.battleState = state;
        this.playerShip = state.playerShip;
      })
    );

    this.subscriptions.push(
      this.battle3DService.battleEvents$.subscribe(event => {
        this.battleEvents.push(event);
        if (this.battleEvents.length > 50) {
          this.battleEvents = this.battleEvents.slice(-50);
        }
      })
    );

    // Get system services after battle service initialization
    setTimeout(() => {
      this.waveSystemService = this.battle3DService.getWaveSystemService();
      this.powerUpSystemService = this.battle3DService.getPowerUpSystemService();
      this.weaponSystemService = this.battle3DService.getWeaponSystemService();
      this.environmentalHazardsService = this.battle3DService.getEnvironmentalHazardsService();
      this.achievementSystemService = this.battle3DService.getAchievementSystemService();

      // Subscribe to wave system
      this.subscriptions.push(
        this.waveSystemService.waveState$.subscribe((state: WaveState) => {
          this.waveState = state;
        })
      );

      // Subscribe to power-up system
      this.subscriptions.push(
        this.powerUpSystemService.activePowerUps$.subscribe((powerUps: ActivePowerUp[]) => {
          this.activePowerUps = powerUps;
        })
      );

      // Subscribe to weapon system
      this.subscriptions.push(
        this.weaponSystemService.weapons$.subscribe((weapons: AdvancedWeapon[]) => {
          this.activeWeapons = weapons;
        })
      );

      // Subscribe to hazards system
      this.subscriptions.push(
        this.environmentalHazardsService.hazards$.subscribe((hazards: EnvironmentalHazard[]) => {
          this.activeHazards = hazards.filter(h => h.isActive);
        })
      );

      // Subscribe to achievements
      this.subscriptions.push(
        this.achievementSystemService.unlockedAchievement$.subscribe((achievement: Achievement | null) => {
          if (achievement) {
            this.recentAchievements.unshift(achievement);
            if (this.recentAchievements.length > 5) {
              this.recentAchievements = this.recentAchievements.slice(0, 5);
            }
          }
        })
      );

      // Get initial player stats
      this.playerStats = this.achievementSystemService.getPlayerStats();
    }, 100);
  }

  /**
   * Налаштування клавіатурного керування
   */
  private setupKeyboardControls(): void {
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
      this.handleKeyDown(event);
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });
  }

  /**
   * Обробка натискання клавіш
   */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.fireWeapon('primary');
        break;
      case 'KeyF':
        this.fireWeapon('secondary');
        break;
      case 'KeyP':
        this.toggleBattle();
        break;
      case 'KeyR':
        this.resetCamera();
        break;
      case 'KeyC':
        this.toggleAutoCamera();
        break;
      case 'KeyN':
        // Start next wave
        this.startNextWave();
        break;
      case 'KeyG':
        // Give random power-up for testing
        this.giveRandomPowerUp();
        break;
      case 'KeyH':
        // Spawn hazard for testing
        this.spawnHazard();
        break;
      case 'KeyE':
        // Create random enemy for testing
        this.createRandomEnemy();
        break;
      case 'KeyT':
        // Test achievement
        this.testAchievement();
        break;
      case 'Escape':
        // Reset game
        this.resetGame();
        break;
    }
  }

  /**
   * Ініціалізація бойової арени
   */
  private async initializeBattleArena(): Promise<void> {
    try {
      console.log('🚀 Initializing Battle Arena...');

      console.log('📦 Creating Three.js scene...');
      const components = this.threeService.createScene(
        'battle-arena',
        this.containerRef,
        {
          backgroundColor: 0x000011,
          enableShadows: true,
          fog: { color: 0x000011, near: 50, far: 200 }
        },
        {
          fov: 60,
          near: 0.1,
          far: 1000,
          position: new THREE.Vector3(0, 20, -40)
        }
      );
      console.log('✅ Three.js scene created successfully');

      this.scene = components.scene;
      this.camera = components.camera;
      this.renderer = components.renderer;

      console.log('⚔️ Initializing Battle 3D Service...');
      this.battle3DService.initializeBattleArena('battle-arena');
      console.log('✅ Battle 3D Service initialized');

      console.log('🌌 Creating space background...');
      this.createSpaceBackground();
      console.log('✅ Space background created');

      console.log('🎬 Starting animation loop...');
      this.animate();
      console.log('✅ Animation loop started');

      console.log('🚀 Loading ships and initializing game systems...');
      await this.loadShips();

      console.log('⚔️ Starting enhanced battle systems...');
      await this.initializeGameSystems();

      this.isLoading = false;
      console.log('🎉 Battle Arena initialization completed successfully!');
    } catch (error) {
      console.error('❌ Error initializing battle arena:', error);
      console.error('Error details:', error);
      this.isLoading = false;
    }
  }

  /**
   * Створення космічного фону
   */
  private createSpaceBackground(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  /**
   * Завантаження кораблів
   */
  private async loadShips(): Promise<void> {
    try {
      console.log('📡 Fetching starships from SWAPI...');
      const starshipsResponse = await this.swapiService.getStarships().toPromise();
      const starships = starshipsResponse?.results || [];

      if (starships.length > 0) {
        console.log(`✅ Found ${starships.length} starships`);
        const playerStarship = starships.find((s: Starship) => s.name.includes('X-wing')) || starships[0];
        console.log(`🎮 Creating player ship: ${playerStarship.name}`);
        await this.createPlayerShip(playerStarship);

        console.log('👾 Creating initial enemy wave...');
        await this.createEnemyWave(starships);
      } else {
        console.log('⚠️ No starships found, creating test ships...');
        await this.createTestShips();
      }
      console.log('✅ Ship loading completed');
    } catch (error) {
      console.error('❌ Error loading ships:', error);
      console.log('🔄 Falling back to test ships...');
      await this.createTestShips();
    }
  }

  /**
   * Ініціалізація ігрових систем
   */
  private async initializeGameSystems(): Promise<void> {
    try {
      console.log('🎯 Initializing game systems...');

      // Wait for services to be available
      await this.waitForServices();

      // Initialize wave system
      console.log('🌊 Starting wave system...');
      this.waveSystemService.startWave(1);

      // Start enhanced battle
      console.log('⚔️ Starting enhanced battle...');
      this.battle3DService.startEnhancedBattle();

      // Setup power-up spawning
      console.log('⭐ Setting up power-up system...');
      this.setupPowerUpSpawning();

      // Initialize achievement tracking
      console.log('🏆 Initializing achievement system...');
      this.initializeAchievementTracking();

      console.log('✅ All game systems initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing game systems:', error);
    }
  }

  /**
   * Створення корабля гравця
   */
  private async createPlayerShip(starshipData: Starship): Promise<void> {
    return new Promise((resolve, reject) => {
      this.battle3DService.createPlayerShip(starshipData).subscribe({
        next: (battleShip) => {
          this.playerShip = battleShip;
          resolve();
        },
        error: reject
      });
    });
  }

  /**
   * Створення хвилі ворогів
   */
  private async createEnemyWave(starships: Starship[]): Promise<void> {
    const enemyShips = starships.slice(1, 4); // Беремо 3 кораблі як ворогів
    console.log(`👾 Creating ${enemyShips.length} enemy ships...`);

    for (let i = 0; i < enemyShips.length; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        30 + i * 10
      );

      console.log(`🚀 Creating enemy ${i + 1}: ${enemyShips[i].name}`);
      await new Promise<void>((resolve) => {
        this.battle3DService.createEnemyShip(enemyShips[i], position).subscribe({
          next: (battleShip) => {
            console.log(`✅ Enemy ship created: ${battleShip.starship3D.name}`);

            // Spawn power-up chance when enemy is destroyed
            this.setupEnemyPowerUpDrop(battleShip);

            resolve();
          },
          error: (error) => {
            console.error(`❌ Failed to create enemy ${i + 1}:`, error);
            resolve();
          }
        });
      });
    }
    console.log('✅ Enemy wave creation completed');
  }

  /**
   * Налаштування випадання power-ups з ворогів
   */
  private setupEnemyPowerUpDrop(enemyShip: BattleShip): void {
    // Listen for when this enemy is destroyed
    const originalHealth = enemyShip.health;
    const checkDestroyed = () => {
      if (enemyShip.isDestroyed && this.powerUpSystemService) {
        // 30% chance to drop a power-up
        if (Math.random() < 0.3) {
          const position = enemyShip.starship3D.model.position.clone();
          position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 3,
            (Math.random() - 0.5) * 5
          ));
          this.powerUpSystemService.spawnRandomPowerUp(position);
          console.log('🎁 Power-up spawned from destroyed enemy');
        }
      }
    };

    // Check periodically (this is a simple approach, could be optimized)
    const interval = setInterval(() => {
      if (enemyShip.isDestroyed) {
        checkDestroyed();
        clearInterval(interval);
      }
    }, 100);
  }

  /**
   * Створення тестових кораблів
   */
  private async createTestShips(): Promise<void> {
    console.log('🧪 Creating test ships...');

    const mockStarship: Starship = {
      name: 'Test Fighter',
      model: 'T-65 X-wing',
      manufacturer: 'Incom Corporation',
      cost_in_credits: '149999',
      length: '12.5',
      max_atmosphering_speed: '1050',
      crew: '1',
      passengers: '0',
      cargo_capacity: '110',
      consumables: '1 week',
      hyperdrive_rating: '1.0',
      MGLT: '100',
      starship_class: 'Starfighter',
      pilots: [],
      films: [],
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      url: 'test'
    };

    console.log('🎮 Creating test player ship...');
    await this.createPlayerShip(mockStarship);

    console.log('👾 Creating test enemy ships...');
    for (let i = 0; i < 3; i++) {
      const enemyTypes = ['TIE Fighter', 'TIE Interceptor', 'TIE Bomber'];
      const enemyMock = {
        ...mockStarship,
        name: `${enemyTypes[i]} ${i + 1}`,
        model: enemyTypes[i]
      };

      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 15,
        25 + i * 12
      );

      await new Promise<void>((resolve) => {
        this.battle3DService.createEnemyShip(enemyMock, position).subscribe({
          next: (battleShip) => {
            console.log(`✅ Test enemy created: ${battleShip.starship3D.name}`);

            // Setup power-up drops for test enemies too
            this.setupEnemyPowerUpDrop(battleShip);

            resolve();
          },
          error: (error) => {
            console.error(`❌ Failed to create test enemy ${i + 1}:`, error);
            resolve();
          }
        });
      });
    }
    console.log('✅ Test ships creation completed');
  }

  /**
   * Очікування доступності сервісів
   */
  private async waitForServices(): Promise<void> {
    return new Promise((resolve) => {
      const checkServices = () => {
        if (this.waveSystemService &&
            this.powerUpSystemService &&
            this.achievementSystemService &&
            this.environmentalHazardsService) {
          resolve();
        } else {
          setTimeout(checkServices, 50);
        }
      };
      checkServices();
    });
  }

  /**
   * Налаштування системи power-ups
   */
  private setupPowerUpSpawning(): void {
    // Set up power-up collection callback
    this.powerUpSystemService.onPowerUpCollected = (powerUp, playerShip) => {
      console.log(`🎁 Power-up collected: ${powerUp.type}`);

      // Update achievement stats
      this.achievementSystemService.incrementStats({
        powerUpsCollected: 1
      });

      // Add battle event
      this.battleEvents.unshift({
        type: 'powerup_collected',
        timestamp: Date.now(),
        data: { type: powerUp.type }
      });
    };
  }

  /**
   * Ініціалізація відстеження досягнень
   */
  private initializeAchievementTracking(): void {
    // Subscribe to battle events for achievement tracking
    this.battle3DService.battleEvents$.subscribe((event) => {
      switch (event.type) {
        case 'ship_destroyed':
          if (!event.data.isPlayer) {
            this.achievementSystemService.incrementStats({
              enemiesDestroyed: 1,
              creditsEarned: 100
            });
          }
          break;
        case 'weapon_fired':
          this.achievementSystemService.incrementStats({
            shotsFired: 1
          });
          break;
        case 'ship_hit':
          if (!event.data.isPlayer) {
            this.achievementSystemService.incrementStats({
              shotsHit: 1
            });
          }
          break;
      }
    });
  }

  /**
   * Анімаційний цикл
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.updatePlayerControls();
    this.updateCamera();

    // Update all game systems
    const deltaTime = 1/60;
    this.battle3DService.update(deltaTime);
    this.animationService.update();

    // Update additional systems if available
    if (this.waveSystemService) {
      this.waveSystemService.update(deltaTime);
    }
    if (this.powerUpSystemService) {
      this.powerUpSystemService.update(deltaTime);
    }
    if (this.environmentalHazardsService) {
      this.environmentalHazardsService.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Оновлення керування кораблем гравця
   */
  private updatePlayerControls(): void {
    if (!this.playerShip || !this.battleState.isActive) return;

    const force = new THREE.Vector3();
    const moveSpeed = 50;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) force.z += moveSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) force.z -= moveSpeed;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) force.x -= moveSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) force.x += moveSpeed;

    if (force.length() > 0) {
      this.physicsService.applyForce('battle-arena', this.playerShip.id, force as any);
    }

    // Check for power-up collection
    this.checkPowerUpCollection();
  }

  /**
   * Перевірка збирання power-ups
   */
  private checkPowerUpCollection(): void {
    if (!this.playerShip || !this.powerUpSystemService) return;

    const playerPosition = this.playerShip.starship3D.model.position;
    const collectionDistance = 5; // Distance for automatic collection

    // Get all active power-ups using private field access
    // Note: This is a temporary solution until we add a public method
    const powerUps = (this.powerUpSystemService as any).powerUps as Map<string, any>;

    powerUps.forEach((powerUp: any, id: string) => {
      if (powerUp.isCollected) return;

      const distance = playerPosition.distanceTo(powerUp.position);
      if (distance <= collectionDistance) {
        // Collect the power-up
        this.powerUpSystemService.collectPowerUp(id, this.playerShip);
      }
    });
  }

  /**
   * Оновлення камери
   */
  private updateCamera(): void {
    if (!this.autoCamera || !this.playerShip) return;

    const shipPosition = this.playerShip.starship3D.model.position;
    const offset = new THREE.Vector3(0, 10, -20);

    this.camera.position.copy(shipPosition).add(offset);
    this.camera.lookAt(shipPosition);
  }

  /**
   * Перемикання бою
   */
  toggleBattle(): void {
    if (this.battleState.isActive) {
      this.battle3DService.pauseBattle();
      console.log('⏸️ Battle paused');
    } else {
      this.battle3DService.startEnhancedBattle();
      console.log('▶️ Battle resumed');
    }
  }

  /**
   * Запуск наступної хвилі
   */
  startNextWave(): void {
    if (this.waveSystemService) {
      const nextWave = this.waveState.currentWave + 1;
      console.log(`🌊 Starting wave ${nextWave}...`);
      this.waveSystemService.startWave(nextWave);
    }
  }

  /**
   * Скидання гри
   */
  resetGame(): void {
    console.log('🔄 Resetting game...');

    // Stop wave system
    if (this.waveSystemService) {
      this.waveSystemService.stopWaveSystem();
    }

    // Reset achievement stats for this session
    if (this.achievementSystemService) {
      // Note: We don't reset total achievements, just session stats
      console.log('📊 Resetting session stats...');
    }

    // Clear battle events
    this.battleEvents = [];

    // Reset camera
    this.resetCamera();

    console.log('✅ Game reset completed');
  }

  /**
   * Скидання камери
   */
  resetCamera(): void {
    this.camera.position.set(0, 20, -40);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Перемикання автоматичної камери
   */
  toggleAutoCamera(): void {
    this.autoCamera = !this.autoCamera;
  }

  /**
   * Стрільба зброєю
   */
  fireWeapon(weaponId: string): void {
    if (!this.playerShip) return;

    let target: THREE.Vector3 | undefined;
    if (this.targetedEnemy) {
      target = this.targetedEnemy.starship3D.model.position;
    }

    this.battle3DService.fireWeapon(this.playerShip, weaponId, target);
  }

  /**
   * Перевірка можливості стрільби
   */
  canFireWeapon(weapon: BattleWeapon): boolean {
    if (!this.playerShip) return false;

    const currentTime = Date.now();
    const cooldownRemaining = weapon.lastFired + weapon.cooldown - currentTime;
    const hasEnergy = this.playerShip.energy >= weapon.energyCost;

    return cooldownRemaining <= 0 && hasEnergy;
  }

  /**
   * Отримання часу перезарядки зброї
   */
  getWeaponCooldown(weapon: BattleWeapon): number {
    const currentTime = Date.now();
    const cooldownRemaining = weapon.lastFired + weapon.cooldown - currentTime;
    return Math.max(0, Math.ceil(cooldownRemaining / 1000));
  }

  /**
   * Отримання іконки зброї
   */
  getWeaponIcon(weaponType: string): string {
    switch (weaponType) {
      case 'laser': return 'flash_on';
      case 'ion': return 'electric_bolt';
      case 'turbolaser': return 'whatshot';
      case 'missile': return 'rocket_launch';
      default: return 'radio_button_unchecked';
    }
  }

  /**
   * Націлювання на ворога
   */
  targetEnemy(enemy: BattleShip): void {
    this.targetedEnemy = enemy;
  }

  /**
   * Форматування часу
   */
  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format battle events
   */
  formatBattleEvent(event: BattleEvent): string {
    switch (event.type) {
      case 'ship_hit':
        return `Ship took ${event.data.damage} damage`;
      case 'ship_destroyed':
        return `Ship destroyed!`;
      case 'weapon_fired':
        return `Fired ${event.data.weaponId}`;
      case 'shield_down':
        return `Shields down!`;
      case 'wave_started':
        return `Wave ${event.data.waveNumber} started! ${event.data.enemyCount} enemies`;
      case 'wave_complete':
        return `Wave ${event.data.waveNumber} completed! Bonus: ${event.data.bonus}`;
      case 'powerup_collected':
        return `Power-up collected: ${event.data.type}`;
      case 'battle_end':
        return `Battle ended. Score: ${event.data.score}`;
      default:
        return `Unknown event: ${event.type}`;
    }
  }

  /**
   * Get power-up display name
   */
  getPowerUpDisplayName(type: string): string {
    const config = this.powerUpSystemService?.getPowerUpConfig(type as any);
    return config?.name || type.replace('_', ' ');
  }

  /**
   * Get remaining time for power-up
   */
  getPowerUpRemainingTime(powerUp: ActivePowerUp): number {
    return Math.max(0, Math.ceil((powerUp.endTime - Date.now()) / 1000));
  }

  /**
   * Get power-up progress percentage
   */
  getPowerUpProgress(powerUp: ActivePowerUp): number {
    const totalDuration = 20000; // Default duration in ms
    const remaining = powerUp.endTime - Date.now();
    return Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
  }

  /**
   * Get hazard display name
   */
  getHazardDisplayName(type: string): string {
    const names: { [key: string]: string } = {
      'asteroid_field': 'Asteroid Field',
      'solar_flare': 'Solar Flare',
      'black_hole': 'Black Hole',
      'nebula_cloud': 'Nebula Cloud',
      'space_mine': 'Space Mine',
      'plasma_storm': 'Plasma Storm',
      'gravity_well': 'Gravity Well'
    };
    return names[type] || type.replace('_', ' ');
  }

  /**
   * Get hazard distance from player
   */
  getHazardDistance(hazard: EnvironmentalHazard): number {
    if (!this.playerShip) return 0;
    const distance = this.playerShip.starship3D.model.position.distanceTo(hazard.position);
    return Math.round(distance);
  }

  /**
   * Get hazard life progress
   */
  getHazardLifeProgress(hazard: EnvironmentalHazard): number {
    if (hazard.maxDuration === 0) return 100;
    return Math.max(0, 100 - (hazard.duration / hazard.maxDuration) * 100);
  }

  /**
   * Get player accuracy
   */
  getAccuracy(): number {
    if (!this.playerStats.shotsFired || this.playerStats.shotsFired === 0) return 0;
    return Math.round((this.playerStats.shotsHit / this.playerStats.shotsFired) * 100);
  }

  /**
   * Spawn environmental hazard manually
   */
  spawnHazard(): void {
    this.battle3DService.spawnRandomHazard();
  }

  /**
   * Give random power-up to player
   */
  giveRandomPowerUp(): void {
    if (this.playerShip) {
      const position = this.playerShip.starship3D.model.position.clone();
      position.add(new THREE.Vector3(2, 0, 2)); // Slightly offset
      this.powerUpSystemService.spawnRandomPowerUp(position);
    }
  }

  /**
   * Test achievement system
   */
  testAchievement(): void {
    // Simulate destroying an enemy for achievement testing
    this.achievementSystemService.incrementStats({
      enemiesDestroyed: 1,
      creditsEarned: 100,
      shotsFired: 1,
      shotsHit: 1
    });
  }

  /**
   * Create random enemy for testing
   */
  createRandomEnemy(): void {
    // Create a random enemy ship
    const mockStarship: Starship = {
      name: 'Test Enemy Fighter',
      model: 'TIE Fighter',
      manufacturer: 'Sienar Fleet Systems',
      cost_in_credits: '0',
      length: '6.4',
      max_atmosphering_speed: '1200',
      crew: '1',
      passengers: '0',
      cargo_capacity: '65',
      consumables: '2 days',
      hyperdrive_rating: 'None',
      MGLT: '100',
      starship_class: 'Starfighter',
      pilots: [],
      films: [],
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      url: 'test-enemy'
    };

    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 10,
      20 + Math.random() * 20
    );

    this.battle3DService.createEnemyShip(mockStarship, position).subscribe({
      next: (battleShip) => {
        console.log('Test enemy created:', battleShip.starship3D.name);
      },
      error: (error) => {
        console.error('Failed to create test enemy:', error);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.threeService.onWindowResize('battle-arena', this.containerRef);
  }

  /**
   * Очищення ресурсів
   */
  private cleanup(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.battle3DService.cleanup();
    this.threeService.disposeScene('battle-arena');
    this.physicsService.disposeWorld('battle-arena');
    this.animationService.disposeAll();
  }
}
