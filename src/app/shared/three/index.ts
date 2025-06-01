// Експорт всіх 3D сервісів та компонентів
export * from './three.service';
export * from './physics.service';
export * from './model-loader.service';
export * from './animation.service';
export * from './starship-3d.service';
export * from './battle-3d.service';
export * from './ai-system.service';
export * from './wave-system.service';
export * from './powerup-system.service';
export * from './weapon-system.service';
export * from './environmental-hazards.service';
export * from './achievement-system.service';
export * from './base-three.component';

// Експорт типів та інтерфейсів
export type { SceneConfig, CameraConfig } from './three.service';
export type { PhysicsConfig, RigidBodyConfig } from './physics.service';
export type { ModelLoadOptions, LoadProgress } from './model-loader.service';
export type { AnimationConfig, TweenAnimation } from './animation.service';
export type { Starship3D, StarshipStats, StarshipCustomization, StarshipAnimations } from './starship-3d.service';
export type {
  BattleShip,
  BattleWeapon,
  BattleShield,
  BattleProjectile,
  BattleExplosion,
  BattleState,
  BattleEvent
} from './battle-3d.service';
export type {
  AIBehavior,
  AIState,
  AIShip
} from './ai-system.service';
export type {
  WaveConfig,
  EnemyWaveConfig,
  WaveEvent,
  WaveState
} from './wave-system.service';
export type {
  PowerUp,
  PowerUpType,
  ActivePowerUp,
  PowerUpConfig
} from './powerup-system.service';
export type {
  AdvancedWeapon,
  WeaponType,
  WeaponUpgrade
} from './weapon-system.service';
export type {
  EnvironmentalHazard,
  HazardType,
  HazardEffect
} from './environmental-hazards.service';
export type {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  PlayerStats
} from './achievement-system.service';
