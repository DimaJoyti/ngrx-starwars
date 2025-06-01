import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, combineLatest } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';
import { 
  EnhancedStarship, 
  EnhancedPlanet,
  GameplayStats,
  WeaponSystem 
} from '../models/bright-data-models';

export interface BattleState {
  playerShip: EnhancedStarship;
  enemyShip: EnhancedStarship;
  playerHealth: number;
  enemyHealth: number;
  playerShields: number;
  enemyShields: number;
  currentWave: number;
  score: number;
  isActive: boolean;
  battlePhase: 'preparation' | 'combat' | 'victory' | 'defeat';
}

export interface ExplorationState {
  planet: EnhancedPlanet;
  playerPosition: { x: number; y: number; z: number };
  discoveredAreas: string[];
  collectedResources: { [key: string]: number };
  completedMissions: string[];
  explorationProgress: number;
  currentHazards: string[];
  isActive: boolean;
}

export interface PlayerProgress {
  level: number;
  experience: number;
  credits: number;
  reputation: { [faction: string]: number };
  unlockedShips: string[];
  unlockedPlanets: string[];
  achievements: string[];
  totalPlayTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameMechanicsService {
  private battleState$ = new BehaviorSubject<BattleState | null>(null);
  private explorationState$ = new BehaviorSubject<ExplorationState | null>(null);
  private playerProgress$ = new BehaviorSubject<PlayerProgress>({
    level: 1,
    experience: 0,
    credits: 1000,
    reputation: { rebel: 0, empire: 0, neutral: 0 },
    unlockedShips: [],
    unlockedPlanets: [],
    achievements: [],
    totalPlayTime: 0
  });

  private gameTimer$ = interval(1000); // Game tick every second

  constructor() {
    this.initializeGameLoop();
  }

  // ===== BATTLE SYSTEM =====

  /**
   * Start a battle between player and enemy starships
   */
  startBattle(playerShip: EnhancedStarship, enemyShip?: EnhancedStarship): Observable<BattleState> {
    const enemy = enemyShip || this.generateRandomEnemy(playerShip);
    
    const battleState: BattleState = {
      playerShip,
      enemyShip: enemy,
      playerHealth: playerShip.technicalSpecs?.hullIntegrity || 100,
      enemyHealth: enemy.technicalSpecs?.hullIntegrity || 100,
      playerShields: playerShip.technicalSpecs?.shieldStrength || 0,
      enemyShields: enemy.technicalSpecs?.shieldStrength || 0,
      currentWave: 1,
      score: 0,
      isActive: true,
      battlePhase: 'preparation'
    };

    this.battleState$.next(battleState);
    this.startBattleLoop();
    
    return this.battleState$.asObservable();
  }

  /**
   * Execute player attack
   */
  playerAttack(weaponIndex: number = 0): void {
    const state = this.battleState$.value;
    if (!state || !state.isActive || state.battlePhase !== 'combat') return;

    const weapon = state.playerShip.weaponSystems?.[weaponIndex];
    if (!weapon) return;

    const damage = this.calculateDamage(weapon, state.playerShip.gameplayStats!);
    const newState = { ...state };

    // Apply damage to enemy
    if (newState.enemyShields > 0) {
      newState.enemyShields = Math.max(0, newState.enemyShields - damage);
      const overflow = damage - state.enemyShields;
      if (overflow > 0) {
        newState.enemyHealth = Math.max(0, newState.enemyHealth - overflow);
      }
    } else {
      newState.enemyHealth = Math.max(0, newState.enemyHealth - damage);
    }

    // Check for victory
    if (newState.enemyHealth <= 0) {
      newState.battlePhase = 'victory';
      newState.isActive = false;
      this.handleBattleVictory(newState);
    }

    this.battleState$.next(newState);
  }

  /**
   * Calculate damage based on weapon and ship stats
   */
  private calculateDamage(weapon: WeaponSystem, shipStats: GameplayStats): number {
    const baseDamage = weapon.damage;
    const accuracyBonus = shipStats.accuracy / 100;
    const attackBonus = shipStats.attackPower / 100;
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4; // 80% - 120%
    
    return Math.round(baseDamage * accuracyBonus * attackBonus * randomFactor);
  }

  /**
   * Generate random enemy based on player ship level
   */
  private generateRandomEnemy(playerShip: EnhancedStarship): EnhancedStarship {
    // This would normally fetch from a pool of available enemies
    // For now, return a basic TIE Fighter configuration
    return {
      id: 999,
      name: 'Enemy TIE Fighter',
      model: 'TIE/ln Fighter',
      url: '',
      manufacturer: 'Sienar Fleet Systems',
      costInCredits: '0',
      length: '6.4',
      maxAtmospheringSpeed: '1200',
      crew: '1',
      passengers: '0',
      cargoCapacity: '65',
      consumables: '2 days',
      hyperdriveRating: '0',
      mglt: '100',
      starshipClass: 'Starfighter',
      created: '',
      updated: '',
      technicalSpecs: {
        lengthMeters: 6.4,
        widthMeters: 6.4,
        heightMeters: 7.0,
        maxSpeedKmh: 1200,
        hyperdriveClass: 0,
        mgltRating: 100,
        crewMin: 1,
        crewOptimal: 1,
        crewMax: 1,
        passengerCapacity: 0,
        cargoTons: 0.065,
        shieldStrength: 0,
        hullIntegrity: 200,
        powerOutput: 1800,
        sensorRange: 800
      },
      gameplayStats: {
        attackPower: 70,
        defense: 30,
        speed: 100,
        agility: 95,
        accuracy: 75,
        rarity: 'common',
        unlockLevel: 1,
        upgradeCost: 500,
        maxLevel: 5,
        specialAbilities: ['swarm_tactics'],
        faction: 'empire'
      },
      weaponSystems: [{
        id: 1,
        starshipId: 999,
        name: 'Laser Cannon',
        type: 'laser',
        damage: 50,
        range: 600,
        rateOfFire: 240,
        accuracy: 75,
        position: 'front'
      }]
    };
  }

  // ===== EXPLORATION SYSTEM =====

  /**
   * Start planet exploration
   */
  startExploration(planet: EnhancedPlanet): Observable<ExplorationState> {
    const explorationState: ExplorationState = {
      planet,
      playerPosition: { x: 0, y: 0, z: 0 },
      discoveredAreas: [],
      collectedResources: {},
      completedMissions: [],
      explorationProgress: 0,
      currentHazards: [],
      isActive: true
    };

    this.explorationState$.next(explorationState);
    return this.explorationState$.asObservable();
  }

  /**
   * Move player to new position
   */
  movePlayer(newPosition: { x: number; y: number; z: number }): void {
    const state = this.explorationState$.value;
    if (!state || !state.isActive) return;

    const newState = { ...state };
    newState.playerPosition = newPosition;

    // Check for discoveries
    this.checkForDiscoveries(newState);
    
    // Check for hazards
    this.checkForHazards(newState);

    this.explorationState$.next(newState);
  }

  /**
   * Collect resource at current location
   */
  collectResource(resourceType: string, amount: number): void {
    const state = this.explorationState$.value;
    if (!state || !state.isActive) return;

    const newState = { ...state };
    newState.collectedResources[resourceType] = 
      (newState.collectedResources[resourceType] || 0) + amount;

    // Update player progress
    this.addExperience(amount * 10);
    this.addCredits(amount * 5);

    this.explorationState$.next(newState);
  }

  // ===== PROGRESSION SYSTEM =====

  /**
   * Add experience points
   */
  addExperience(amount: number): void {
    const progress = this.playerProgress$.value;
    const newProgress = { ...progress };
    
    newProgress.experience += amount;
    
    // Check for level up
    const requiredExp = this.getRequiredExperience(newProgress.level);
    if (newProgress.experience >= requiredExp) {
      newProgress.level++;
      newProgress.experience -= requiredExp;
      this.handleLevelUp(newProgress);
    }

    this.playerProgress$.next(newProgress);
  }

  /**
   * Add credits
   */
  addCredits(amount: number): void {
    const progress = this.playerProgress$.value;
    const newProgress = { ...progress };
    newProgress.credits += amount;
    this.playerProgress$.next(newProgress);
  }

  /**
   * Unlock new starship
   */
  unlockStarship(shipName: string): void {
    const progress = this.playerProgress$.value;
    if (!progress.unlockedShips.includes(shipName)) {
      const newProgress = { ...progress };
      newProgress.unlockedShips.push(shipName);
      this.playerProgress$.next(newProgress);
      this.addAchievement(`ship_unlocked_${shipName}`);
    }
  }

  /**
   * Add achievement
   */
  addAchievement(achievementId: string): void {
    const progress = this.playerProgress$.value;
    if (!progress.achievements.includes(achievementId)) {
      const newProgress = { ...progress };
      newProgress.achievements.push(achievementId);
      this.playerProgress$.next(newProgress);
    }
  }

  // ===== UTILITY METHODS =====

  private getRequiredExperience(level: number): number {
    return level * 1000 + (level - 1) * 500;
  }

  private handleLevelUp(progress: PlayerProgress): void {
    // Grant level up rewards
    this.addCredits(progress.level * 100);
    this.addAchievement(`level_${progress.level}`);
  }

  private handleBattleVictory(battleState: BattleState): void {
    const expGain = battleState.enemyShip.gameplayStats?.attackPower || 50;
    const creditGain = battleState.enemyShip.gameplayStats?.upgradeCost || 100;
    
    this.addExperience(expGain);
    this.addCredits(creditGain);
    this.addAchievement('battle_victory');
  }

  private checkForDiscoveries(state: ExplorationState): void {
    // Simple discovery logic based on position
    const areaKey = `${Math.floor(state.playerPosition.x / 100)}_${Math.floor(state.playerPosition.z / 100)}`;
    
    if (!state.discoveredAreas.includes(areaKey)) {
      state.discoveredAreas.push(areaKey);
      state.explorationProgress = Math.min(100, state.explorationProgress + 5);
      this.addExperience(25);
    }
  }

  private checkForHazards(state: ExplorationState): void {
    // Check for environmental hazards based on planet data
    const hazards = state.planet.gameplayData?.environmentalHazards || [];
    const randomHazard = hazards[Math.floor(Math.random() * hazards.length)];
    
    if (randomHazard && Math.random() < 0.1) { // 10% chance
      if (!state.currentHazards.includes(randomHazard)) {
        state.currentHazards.push(randomHazard);
      }
    }
  }

  private startBattleLoop(): void {
    // Simple AI battle loop
    this.gameTimer$.pipe(
      filter(() => {
        const state = this.battleState$.value;
        return state?.isActive && state.battlePhase === 'combat' || false;
      }),
      take(1)
    ).subscribe(() => {
      this.enemyAttack();
    });
  }

  private enemyAttack(): void {
    const state = this.battleState$.value;
    if (!state || !state.isActive) return;

    const weapon = state.enemyShip.weaponSystems?.[0];
    if (!weapon) return;

    const damage = this.calculateDamage(weapon, state.enemyShip.gameplayStats!);
    const newState = { ...state };

    // Apply damage to player
    if (newState.playerShields > 0) {
      newState.playerShields = Math.max(0, newState.playerShields - damage);
      const overflow = damage - state.playerShields;
      if (overflow > 0) {
        newState.playerHealth = Math.max(0, newState.playerHealth - overflow);
      }
    } else {
      newState.playerHealth = Math.max(0, newState.playerHealth - damage);
    }

    // Check for defeat
    if (newState.playerHealth <= 0) {
      newState.battlePhase = 'defeat';
      newState.isActive = false;
    }

    this.battleState$.next(newState);
  }

  private initializeGameLoop(): void {
    // Update play time every second
    this.gameTimer$.subscribe(() => {
      const progress = this.playerProgress$.value;
      const newProgress = { ...progress };
      newProgress.totalPlayTime++;
      this.playerProgress$.next(newProgress);
    });
  }

  // ===== PUBLIC OBSERVABLES =====

  getBattleState(): Observable<BattleState | null> {
    return this.battleState$.asObservable();
  }

  getExplorationState(): Observable<ExplorationState | null> {
    return this.explorationState$.asObservable();
  }

  getPlayerProgress(): Observable<PlayerProgress> {
    return this.playerProgress$.asObservable();
  }
}
