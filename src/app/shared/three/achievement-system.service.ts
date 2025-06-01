import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  reward: AchievementReward;
  conditions: AchievementCondition[];
}

export type AchievementCategory = 
  | 'combat' 
  | 'survival' 
  | 'exploration' 
  | 'collection' 
  | 'mastery' 
  | 'special';

export type AchievementRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'legendary';

export interface AchievementReward {
  type: 'credits' | 'experience' | 'unlock' | 'title' | 'cosmetic';
  value: number;
  item?: string;
}

export interface AchievementCondition {
  type: string;
  value: number;
  operator: '=' | '>' | '<' | '>=' | '<=';
}

export interface PlayerStats {
  enemiesDestroyed: number;
  wavesCompleted: number;
  powerUpsCollected: number;
  damageDealt: number;
  damageTaken: number;
  timeAlive: number;
  shotsFired: number;
  shotsHit: number;
  distanceTraveled: number;
  creditsEarned: number;
  highestWave: number;
  perfectWaves: number;
  consecutiveHits: number;
  maxConsecutiveHits: number;
  weaponsUnlocked: number;
  achievementsUnlocked: number;
  totalPlayTime: number;
  gamesPlayed: number;
  hazardsSurvived: number;
  bossesDefeated: number;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementSystemService {
  private achievements: Map<string, Achievement> = new Map();
  private playerStats: PlayerStats = this.getDefaultStats();
  
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  public achievements$ = this.achievementsSubject.asObservable();
  
  private unlockedAchievementSubject = new BehaviorSubject<Achievement | null>(null);
  public unlockedAchievement$ = this.unlockedAchievementSubject.asObservable();

  constructor() {
    this.initializeAchievements();
    this.loadPlayerStats();
  }

  /**
   * Get default player stats
   */
  private getDefaultStats(): PlayerStats {
    return {
      enemiesDestroyed: 0,
      wavesCompleted: 0,
      powerUpsCollected: 0,
      damageDealt: 0,
      damageTaken: 0,
      timeAlive: 0,
      shotsFired: 0,
      shotsHit: 0,
      distanceTraveled: 0,
      creditsEarned: 0,
      highestWave: 0,
      perfectWaves: 0,
      consecutiveHits: 0,
      maxConsecutiveHits: 0,
      weaponsUnlocked: 0,
      achievementsUnlocked: 0,
      totalPlayTime: 0,
      gamesPlayed: 0,
      hazardsSurvived: 0,
      bossesDefeated: 0
    };
  }

  /**
   * Initialize achievements
   */
  private initializeAchievements(): void {
    const achievementData: Omit<Achievement, 'progress' | 'isUnlocked'>[] = [
      // Combat Achievements
      {
        id: 'first_kill',
        name: 'First Blood',
        description: 'Destroy your first enemy',
        icon: '🎯',
        category: 'combat',
        rarity: 'common',
        maxProgress: 1,
        reward: { type: 'credits', value: 100 },
        conditions: [{ type: 'enemiesDestroyed', value: 1, operator: '>=' }]
      },
      {
        id: 'destroyer',
        name: 'Destroyer',
        description: 'Destroy 100 enemies',
        icon: '💥',
        category: 'combat',
        rarity: 'uncommon',
        maxProgress: 100,
        reward: { type: 'credits', value: 1000 },
        conditions: [{ type: 'enemiesDestroyed', value: 100, operator: '>=' }]
      },
      {
        id: 'annihilator',
        name: 'Annihilator',
        description: 'Destroy 1000 enemies',
        icon: '☄️',
        category: 'combat',
        rarity: 'rare',
        maxProgress: 1000,
        reward: { type: 'unlock', value: 1, item: 'plasma_rifle' },
        conditions: [{ type: 'enemiesDestroyed', value: 1000, operator: '>=' }]
      },
      {
        id: 'marksman',
        name: 'Marksman',
        description: 'Achieve 90% accuracy',
        icon: '🎯',
        category: 'combat',
        rarity: 'epic',
        maxProgress: 90,
        reward: { type: 'unlock', value: 1, item: 'railgun' },
        conditions: [
          { type: 'shotsFired', value: 100, operator: '>=' },
          { type: 'accuracy', value: 90, operator: '>=' }
        ]
      },
      {
        id: 'perfect_shot',
        name: 'Perfect Shot',
        description: 'Hit 50 consecutive shots',
        icon: '🏹',
        category: 'combat',
        rarity: 'legendary',
        maxProgress: 50,
        reward: { type: 'unlock', value: 1, item: 'photon_torpedo' },
        conditions: [{ type: 'maxConsecutiveHits', value: 50, operator: '>=' }]
      },

      // Survival Achievements
      {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive for 5 minutes',
        icon: '⏱️',
        category: 'survival',
        rarity: 'common',
        maxProgress: 300,
        reward: { type: 'credits', value: 500 },
        conditions: [{ type: 'timeAlive', value: 300, operator: '>=' }]
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Survive for 30 minutes',
        icon: '🛡️',
        category: 'survival',
        rarity: 'rare',
        maxProgress: 1800,
        reward: { type: 'unlock', value: 1, item: 'shield_booster' },
        conditions: [{ type: 'timeAlive', value: 1800, operator: '>=' }]
      },
      {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Complete a wave without taking damage',
        icon: '✨',
        category: 'survival',
        rarity: 'epic',
        maxProgress: 1,
        reward: { type: 'unlock', value: 1, item: 'force_field' },
        conditions: [{ type: 'perfectWaves', value: 1, operator: '>=' }]
      },

      // Wave Achievements
      {
        id: 'wave_master',
        name: 'Wave Master',
        description: 'Complete 10 waves',
        icon: '🌊',
        category: 'mastery',
        rarity: 'uncommon',
        maxProgress: 10,
        reward: { type: 'credits', value: 2000 },
        conditions: [{ type: 'wavesCompleted', value: 10, operator: '>=' }]
      },
      {
        id: 'wave_legend',
        name: 'Wave Legend',
        description: 'Reach wave 50',
        icon: '👑',
        category: 'mastery',
        rarity: 'legendary',
        maxProgress: 50,
        reward: { type: 'title', value: 1, item: 'Wave Legend' },
        conditions: [{ type: 'highestWave', value: 50, operator: '>=' }]
      },

      // Collection Achievements
      {
        id: 'collector',
        name: 'Collector',
        description: 'Collect 50 power-ups',
        icon: '💎',
        category: 'collection',
        rarity: 'common',
        maxProgress: 50,
        reward: { type: 'credits', value: 750 },
        conditions: [{ type: 'powerUpsCollected', value: 50, operator: '>=' }]
      },
      {
        id: 'hoarder',
        name: 'Hoarder',
        description: 'Collect 500 power-ups',
        icon: '💰',
        category: 'collection',
        rarity: 'rare',
        maxProgress: 500,
        reward: { type: 'unlock', value: 1, item: 'power_up_magnet' },
        conditions: [{ type: 'powerUpsCollected', value: 500, operator: '>=' }]
      },

      // Special Achievements
      {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat 10 boss enemies',
        icon: '🐉',
        category: 'special',
        rarity: 'epic',
        maxProgress: 10,
        reward: { type: 'unlock', value: 1, item: 'gravity_bomb' },
        conditions: [{ type: 'bossesDefeated', value: 10, operator: '>=' }]
      },
      {
        id: 'hazard_master',
        name: 'Hazard Master',
        description: 'Survive 100 environmental hazards',
        icon: '⚠️',
        category: 'survival',
        rarity: 'rare',
        maxProgress: 100,
        reward: { type: 'unlock', value: 1, item: 'hazard_detector' },
        conditions: [{ type: 'hazardsSurvived', value: 100, operator: '>=' }]
      },
      {
        id: 'wealthy',
        name: 'Wealthy',
        description: 'Earn 100,000 credits',
        icon: '💸',
        category: 'collection',
        rarity: 'epic',
        maxProgress: 100000,
        reward: { type: 'unlock', value: 1, item: 'credit_multiplier' },
        conditions: [{ type: 'creditsEarned', value: 100000, operator: '>=' }]
      }
    ];

    achievementData.forEach(data => {
      const achievement: Achievement = {
        ...data,
        progress: 0,
        isUnlocked: false
      };
      this.achievements.set(achievement.id, achievement);
    });

    this.updateAchievementsSubject();
  }

  /**
   * Update player stats
   */
  updateStats(statUpdates: Partial<PlayerStats>): void {
    Object.keys(statUpdates).forEach(key => {
      const statKey = key as keyof PlayerStats;
      const value = statUpdates[statKey];
      if (value !== undefined) {
        (this.playerStats as any)[statKey] = value;
      }
    });

    // Calculate derived stats
    if (this.playerStats.shotsFired > 0) {
      const accuracy = (this.playerStats.shotsHit / this.playerStats.shotsFired) * 100;
      (this.playerStats as any).accuracy = accuracy;
    }

    this.checkAchievements();
    this.savePlayerStats();
  }

  /**
   * Increment player stats
   */
  incrementStats(statUpdates: Partial<PlayerStats>): void {
    Object.keys(statUpdates).forEach(key => {
      const statKey = key as keyof PlayerStats;
      const value = statUpdates[statKey];
      if (value !== undefined) {
        (this.playerStats as any)[statKey] += value;
      }
    });

    this.updateStats({});
  }

  /**
   * Check achievements
   */
  private checkAchievements(): void {
    this.achievements.forEach(achievement => {
      if (achievement.isUnlocked) return;

      let conditionsMet = true;
      let progress = 0;

      achievement.conditions.forEach(condition => {
        const statValue = (this.playerStats as any)[condition.type] || 0;
        
        switch (condition.operator) {
          case '>=':
            if (statValue < condition.value) conditionsMet = false;
            break;
          case '>':
            if (statValue <= condition.value) conditionsMet = false;
            break;
          case '<=':
            if (statValue > condition.value) conditionsMet = false;
            break;
          case '<':
            if (statValue >= condition.value) conditionsMet = false;
            break;
          case '=':
            if (statValue !== condition.value) conditionsMet = false;
            break;
        }

        // Calculate progress for the primary condition
        if (condition.type === achievement.conditions[0].type) {
          progress = Math.min(achievement.maxProgress, statValue);
        }
      });

      achievement.progress = progress;

      if (conditionsMet && !achievement.isUnlocked) {
        this.unlockAchievement(achievement);
      }
    });

    this.updateAchievementsSubject();
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(achievement: Achievement): void {
    achievement.isUnlocked = true;
    achievement.unlockedAt = new Date();
    achievement.progress = achievement.maxProgress;

    this.playerStats.achievementsUnlocked++;

    // Apply reward
    this.applyReward(achievement.reward);

    // Notify about unlock
    this.unlockedAchievementSubject.next(achievement);

    console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
  }

  /**
   * Apply achievement reward
   */
  private applyReward(reward: AchievementReward): void {
    switch (reward.type) {
      case 'credits':
        this.playerStats.creditsEarned += reward.value;
        break;
      case 'experience':
        // Handle experience reward
        break;
      case 'unlock':
        // Handle item unlock
        console.log(`🔓 Unlocked: ${reward.item}`);
        break;
      case 'title':
        // Handle title unlock
        console.log(`👑 Title Unlocked: ${reward.item}`);
        break;
    }
  }

  /**
   * Get player stats
   */
  getPlayerStats(): PlayerStats {
    return { ...this.playerStats };
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.isUnlocked);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  /**
   * Get achievement progress percentage
   */
  getAchievementProgress(achievementId: string): number {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return 0;
    return (achievement.progress / achievement.maxProgress) * 100;
  }

  /**
   * Save player stats to localStorage
   */
  private savePlayerStats(): void {
    localStorage.setItem('starwars_player_stats', JSON.stringify(this.playerStats));
    localStorage.setItem('starwars_achievements', JSON.stringify(
      Array.from(this.achievements.entries()).map(([id, achievement]) => ({
        id,
        progress: achievement.progress,
        isUnlocked: achievement.isUnlocked,
        unlockedAt: achievement.unlockedAt
      }))
    ));
  }

  /**
   * Load player stats from localStorage
   */
  private loadPlayerStats(): void {
    const savedStats = localStorage.getItem('starwars_player_stats');
    if (savedStats) {
      this.playerStats = { ...this.getDefaultStats(), ...JSON.parse(savedStats) };
    }

    const savedAchievements = localStorage.getItem('starwars_achievements');
    if (savedAchievements) {
      const achievementData = JSON.parse(savedAchievements);
      achievementData.forEach((data: any) => {
        const achievement = this.achievements.get(data.id);
        if (achievement) {
          achievement.progress = data.progress;
          achievement.isUnlocked = data.isUnlocked;
          achievement.unlockedAt = data.unlockedAt ? new Date(data.unlockedAt) : undefined;
        }
      });
    }

    this.updateAchievementsSubject();
  }

  /**
   * Reset all progress
   */
  resetProgress(): void {
    this.playerStats = this.getDefaultStats();
    this.achievements.forEach(achievement => {
      achievement.progress = 0;
      achievement.isUnlocked = false;
      achievement.unlockedAt = undefined;
    });
    this.savePlayerStats();
    this.updateAchievementsSubject();
  }

  /**
   * Update achievements subject
   */
  private updateAchievementsSubject(): void {
    this.achievementsSubject.next(this.getAllAchievements());
  }
}
