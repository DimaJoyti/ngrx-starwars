import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { BehaviorSubject, Observable } from 'rxjs';
import { AIBehavior } from './ai-system.service';

export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  enemyTypes: EnemyWaveConfig[];
  spawnDelay: number; // milliseconds between spawns
  waveDelay: number; // milliseconds before next wave
  bonusReward: number;
  specialEvents?: WaveEvent[];
}

export interface EnemyWaveConfig {
  shipType: 'fighter' | 'freighter' | 'destroyer' | 'corvette' | 'battlestation';
  count: number;
  aiBehavior: AIBehavior['type'];
  healthMultiplier: number;
  damageMultiplier: number;
  spawnPattern: 'random' | 'formation' | 'sides' | 'behind' | 'surrounding';
  spawnDistance: number;
}

export interface WaveEvent {
  type: 'asteroid_field' | 'reinforcements' | 'boss_ship' | 'power_up' | 'nebula';
  triggerTime: number; // seconds into wave
  duration: number; // seconds
  data?: any;
}

export interface WaveState {
  currentWave: number;
  isActive: boolean;
  enemiesRemaining: number;
  totalEnemies: number;
  nextWaveIn: number;
  waveProgress: number; // 0-1
  totalScore: number;
  difficulty: number; // 1-10
}

@Injectable({
  providedIn: 'root'
})
export class WaveSystemService {
  private waveState: WaveState = {
    currentWave: 1,
    isActive: false,
    enemiesRemaining: 0,
    totalEnemies: 0,
    nextWaveIn: 0,
    waveProgress: 0,
    totalScore: 0,
    difficulty: 1
  };

  private waveStateSubject = new BehaviorSubject<WaveState>(this.waveState);
  public waveState$ = this.waveStateSubject.asObservable();

  private waveConfigs: Map<number, WaveConfig> = new Map();
  private currentWaveConfig: WaveConfig | null = null;
  private spawnTimer = 0;
  private waveTimer = 0;
  private enemiesSpawned = 0;

  constructor() {
    this.generateWaveConfigs();
  }

  /**
   * Generate wave configurations for progressive difficulty
   */
  private generateWaveConfigs(): void {
    for (let wave = 1; wave <= 50; wave++) {
      const config = this.createWaveConfig(wave);
      this.waveConfigs.set(wave, config);
    }
  }

  /**
   * Create wave configuration based on wave number
   */
  private createWaveConfig(waveNumber: number): WaveConfig {
    const difficulty = Math.min(10, 1 + (waveNumber - 1) * 0.2);
    const baseEnemyCount = Math.floor(2 + waveNumber * 0.5);
    const enemyCount = Math.min(15, baseEnemyCount);

    const config: WaveConfig = {
      waveNumber,
      enemyCount,
      enemyTypes: this.generateEnemyTypes(waveNumber, difficulty),
      spawnDelay: Math.max(500, 2000 - waveNumber * 50),
      waveDelay: 3000,
      bonusReward: waveNumber * 100,
      specialEvents: this.generateSpecialEvents(waveNumber)
    };

    return config;
  }

  /**
   * Generate enemy types for wave
   */
  private generateEnemyTypes(waveNumber: number, difficulty: number): EnemyWaveConfig[] {
    const types: EnemyWaveConfig[] = [];
    
    // Basic fighters (always present)
    const fighterCount = Math.max(1, Math.floor(waveNumber * 0.3));
    types.push({
      shipType: 'fighter',
      count: fighterCount,
      aiBehavior: waveNumber < 5 ? 'aggressive' : 'patrol',
      healthMultiplier: 1 + (difficulty - 1) * 0.2,
      damageMultiplier: 1 + (difficulty - 1) * 0.15,
      spawnPattern: 'random',
      spawnDistance: 40
    });

    // Add corvettes from wave 3
    if (waveNumber >= 3) {
      const corvetteCount = Math.floor(waveNumber * 0.2);
      if (corvetteCount > 0) {
        types.push({
          shipType: 'corvette',
          count: corvetteCount,
          aiBehavior: 'defensive',
          healthMultiplier: 1.5 + (difficulty - 1) * 0.3,
          damageMultiplier: 1.2 + (difficulty - 1) * 0.2,
          spawnPattern: 'formation',
          spawnDistance: 50
        });
      }
    }

    // Add destroyers from wave 7
    if (waveNumber >= 7) {
      const destroyerCount = Math.floor((waveNumber - 6) * 0.15);
      if (destroyerCount > 0) {
        types.push({
          shipType: 'destroyer',
          count: destroyerCount,
          aiBehavior: 'aggressive',
          healthMultiplier: 2 + (difficulty - 1) * 0.4,
          damageMultiplier: 1.5 + (difficulty - 1) * 0.3,
          spawnPattern: 'sides',
          spawnDistance: 60
        });
      }
    }

    // Add boss ships every 10 waves
    if (waveNumber % 10 === 0) {
      types.push({
        shipType: 'battlestation',
        count: 1,
        aiBehavior: 'defensive',
        healthMultiplier: 5 + (difficulty - 1) * 0.8,
        damageMultiplier: 2 + (difficulty - 1) * 0.5,
        spawnPattern: 'behind',
        spawnDistance: 80
      });
    }

    // Add kamikaze ships from wave 15
    if (waveNumber >= 15 && waveNumber % 5 === 0) {
      types.push({
        shipType: 'fighter',
        count: 2,
        aiBehavior: 'kamikaze',
        healthMultiplier: 0.5,
        damageMultiplier: 3,
        spawnPattern: 'surrounding',
        spawnDistance: 30
      });
    }

    return types;
  }

  /**
   * Generate special events for wave
   */
  private generateSpecialEvents(waveNumber: number): WaveEvent[] {
    const events: WaveEvent[] = [];

    // Asteroid field every 5 waves
    if (waveNumber % 5 === 0 && waveNumber > 5) {
      events.push({
        type: 'asteroid_field',
        triggerTime: 10,
        duration: 30,
        data: { asteroidCount: 20, damage: 10 }
      });
    }

    // Reinforcements for boss waves
    if (waveNumber % 10 === 0) {
      events.push({
        type: 'reinforcements',
        triggerTime: 20,
        duration: 0,
        data: { shipType: 'fighter', count: 3 }
      });
    }

    // Power-ups every 3 waves
    if (waveNumber % 3 === 0) {
      events.push({
        type: 'power_up',
        triggerTime: 5,
        duration: 15,
        data: { type: 'damage_boost', multiplier: 1.5 }
      });
    }

    return events;
  }

  /**
   * Start wave system
   */
  startWaveSystem(): void {
    this.waveState.currentWave = 1;
    this.waveState.isActive = true;
    this.waveState.totalScore = 0;
    this.waveState.difficulty = 1;
    this.startWave(1);
  }

  /**
   * Start specific wave
   */
  startWave(waveNumber: number): void {
    this.currentWaveConfig = this.waveConfigs.get(waveNumber) || this.createWaveConfig(waveNumber);
    
    this.waveState.currentWave = waveNumber;
    this.waveState.totalEnemies = this.currentWaveConfig.enemyCount;
    this.waveState.enemiesRemaining = this.currentWaveConfig.enemyCount;
    this.waveState.difficulty = Math.min(10, 1 + (waveNumber - 1) * 0.2);
    this.waveState.waveProgress = 0;
    
    this.spawnTimer = 0;
    this.waveTimer = 0;
    this.enemiesSpawned = 0;

    this.updateWaveState();
    this.onWaveStart?.(this.currentWaveConfig);
  }

  /**
   * Update wave system
   */
  update(deltaTime: number): void {
    if (!this.waveState.isActive || !this.currentWaveConfig) return;

    this.waveTimer += deltaTime * 1000;
    this.spawnTimer += deltaTime * 1000;

    // Spawn enemies
    if (this.enemiesSpawned < this.currentWaveConfig.enemyCount && 
        this.spawnTimer >= this.currentWaveConfig.spawnDelay) {
      this.spawnNextEnemy();
      this.spawnTimer = 0;
    }

    // Update wave progress
    const enemiesKilled = this.currentWaveConfig.enemyCount - this.waveState.enemiesRemaining;
    this.waveState.waveProgress = enemiesKilled / this.currentWaveConfig.enemyCount;

    // Check for wave completion
    if (this.waveState.enemiesRemaining <= 0 && this.enemiesSpawned >= this.currentWaveConfig.enemyCount) {
      this.completeWave();
    }

    // Process special events
    this.processSpecialEvents();

    this.updateWaveState();
  }

  /**
   * Spawn next enemy in wave
   */
  private spawnNextEnemy(): void {
    if (!this.currentWaveConfig) return;

    // Find which enemy type to spawn
    let totalSpawned = 0;
    for (const enemyType of this.currentWaveConfig.enemyTypes) {
      if (this.enemiesSpawned < totalSpawned + enemyType.count) {
        this.spawnEnemy(enemyType);
        break;
      }
      totalSpawned += enemyType.count;
    }

    this.enemiesSpawned++;
  }

  /**
   * Spawn individual enemy
   */
  private spawnEnemy(config: EnemyWaveConfig): void {
    const spawnPosition = this.calculateSpawnPosition(config.spawnPattern, config.spawnDistance);
    
    this.onEnemySpawn?.(config, spawnPosition);
  }

  /**
   * Calculate spawn position based on pattern
   */
  private calculateSpawnPosition(pattern: EnemyWaveConfig['spawnPattern'], distance: number): THREE.Vector3 {
    switch (pattern) {
      case 'random':
        return new THREE.Vector3(
          (Math.random() - 0.5) * distance * 2,
          (Math.random() - 0.5) * distance,
          distance + Math.random() * 20
        );

      case 'formation':
        const formationIndex = this.enemiesSpawned % 3;
        return new THREE.Vector3(
          (formationIndex - 1) * 15,
          0,
          distance + formationIndex * 5
        );

      case 'sides':
        const side = this.enemiesSpawned % 2 === 0 ? -1 : 1;
        return new THREE.Vector3(
          side * distance,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 40
        );

      case 'behind':
        return new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 15,
          -distance
        );

      case 'surrounding':
        const angle = (this.enemiesSpawned / 8) * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 10,
          Math.sin(angle) * distance
        );

      default:
        return new THREE.Vector3(0, 0, distance);
    }
  }

  /**
   * Process special events
   */
  private processSpecialEvents(): void {
    if (!this.currentWaveConfig?.specialEvents) return;

    const waveTimeSeconds = this.waveTimer / 1000;

    this.currentWaveConfig.specialEvents.forEach(event => {
      if (waveTimeSeconds >= event.triggerTime && 
          waveTimeSeconds <= event.triggerTime + event.duration) {
        this.onSpecialEvent?.(event);
      }
    });
  }

  /**
   * Complete current wave
   */
  private completeWave(): void {
    if (!this.currentWaveConfig) return;

    // Award bonus points
    this.waveState.totalScore += this.currentWaveConfig.bonusReward;
    
    // Start next wave after delay
    setTimeout(() => {
      this.startWave(this.waveState.currentWave + 1);
    }, this.currentWaveConfig.waveDelay);

    this.onWaveComplete?.(this.currentWaveConfig);
  }

  /**
   * Enemy destroyed notification
   */
  enemyDestroyed(scoreValue: number = 100): void {
    this.waveState.enemiesRemaining = Math.max(0, this.waveState.enemiesRemaining - 1);
    this.waveState.totalScore += scoreValue;
    this.updateWaveState();
  }

  /**
   * Get current wave configuration
   */
  getCurrentWaveConfig(): WaveConfig | null {
    return this.currentWaveConfig;
  }

  /**
   * Get wave configuration for specific wave
   */
  getWaveConfig(waveNumber: number): WaveConfig | null {
    return this.waveConfigs.get(waveNumber) || null;
  }

  /**
   * Stop wave system
   */
  stopWaveSystem(): void {
    this.waveState.isActive = false;
    this.currentWaveConfig = null;
    this.updateWaveState();
  }

  /**
   * Update wave state
   */
  private updateWaveState(): void {
    this.waveStateSubject.next({ ...this.waveState });
  }

  /**
   * Callbacks for external systems
   */
  onWaveStart?: (config: WaveConfig) => void;
  onWaveComplete?: (config: WaveConfig) => void;
  onEnemySpawn?: (config: EnemyWaveConfig, position: THREE.Vector3) => void;
  onSpecialEvent?: (event: WaveEvent) => void;
}
