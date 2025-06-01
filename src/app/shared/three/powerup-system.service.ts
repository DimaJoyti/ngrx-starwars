import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BehaviorSubject } from 'rxjs';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  mesh: THREE.Mesh;
  physicsBody: CANNON.Body;
  position: THREE.Vector3;
  duration: number; // how long it lasts when collected
  value: number; // strength of the effect
  lifeTime: number; // how long it exists in world
  maxLifeTime: number;
  isCollected: boolean;
}

export type PowerUpType = 
  | 'health_restore'
  | 'shield_boost'
  | 'energy_boost'
  | 'damage_multiplier'
  | 'fire_rate_boost'
  | 'speed_boost'
  | 'invulnerability'
  | 'multi_shot'
  | 'homing_missiles'
  | 'shield_regeneration';

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
  value: number;
  originalValue?: number; // for restoring original values
}

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  description: string;
  color: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  duration: number;
  value: number;
  maxLifeTime: number;
  spawnChance: number; // 0-1
}

@Injectable({
  providedIn: 'root'
})
export class PowerUpSystemService {
  private powerUps: Map<string, PowerUp> = new Map();
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();
  private scene!: THREE.Scene;
  private physicsWorld!: CANNON.World;

  private activePowerUpsSubject = new BehaviorSubject<ActivePowerUp[]>([]);
  public activePowerUps$ = this.activePowerUpsSubject.asObservable();

  private powerUpConfigs: Map<PowerUpType, PowerUpConfig> = new Map();

  constructor() {
    this.initializePowerUpConfigs();
  }

  /**
   * Initialize power-up configurations
   */
  private initializePowerUpConfigs(): void {
    const configs: PowerUpConfig[] = [
      {
        type: 'health_restore',
        name: 'Health Pack',
        description: 'Restores ship health',
        color: 0x00ff00,
        rarity: 'common',
        duration: 0, // instant effect
        value: 50,
        maxLifeTime: 15000,
        spawnChance: 0.3
      },
      {
        type: 'shield_boost',
        name: 'Shield Booster',
        description: 'Increases shield capacity',
        color: 0x00ffff,
        rarity: 'common',
        duration: 20000,
        value: 1.5,
        maxLifeTime: 12000,
        spawnChance: 0.25
      },
      {
        type: 'energy_boost',
        name: 'Energy Cell',
        description: 'Increases energy regeneration',
        color: 0xffff00,
        rarity: 'common',
        duration: 15000,
        value: 2,
        maxLifeTime: 10000,
        spawnChance: 0.25
      },
      {
        type: 'damage_multiplier',
        name: 'Damage Amplifier',
        description: 'Increases weapon damage',
        color: 0xff4444,
        rarity: 'uncommon',
        duration: 12000,
        value: 2,
        maxLifeTime: 8000,
        spawnChance: 0.15
      },
      {
        type: 'fire_rate_boost',
        name: 'Rapid Fire',
        description: 'Increases firing rate',
        color: 0xff8800,
        rarity: 'uncommon',
        duration: 10000,
        value: 0.5, // reduces cooldown by 50%
        maxLifeTime: 8000,
        spawnChance: 0.15
      },
      {
        type: 'speed_boost',
        name: 'Afterburner',
        description: 'Increases ship speed',
        color: 0x8888ff,
        rarity: 'uncommon',
        duration: 8000,
        value: 1.5,
        maxLifeTime: 7000,
        spawnChance: 0.12
      },
      {
        type: 'invulnerability',
        name: 'Force Field',
        description: 'Temporary invulnerability',
        color: 0xffffff,
        rarity: 'rare',
        duration: 5000,
        value: 1,
        maxLifeTime: 6000,
        spawnChance: 0.05
      },
      {
        type: 'multi_shot',
        name: 'Multi-Shot',
        description: 'Fires multiple projectiles',
        color: 0xff00ff,
        rarity: 'rare',
        duration: 15000,
        value: 3, // number of projectiles
        maxLifeTime: 8000,
        spawnChance: 0.08
      },
      {
        type: 'homing_missiles',
        name: 'Homing Missiles',
        description: 'Projectiles track enemies',
        color: 0xff6600,
        rarity: 'epic',
        duration: 20000,
        value: 1,
        maxLifeTime: 10000,
        spawnChance: 0.03
      },
      {
        type: 'shield_regeneration',
        name: 'Shield Matrix',
        description: 'Rapid shield regeneration',
        color: 0x00ff88,
        rarity: 'legendary',
        duration: 25000,
        value: 5, // regeneration multiplier
        maxLifeTime: 12000,
        spawnChance: 0.01
      }
    ];

    configs.forEach(config => {
      this.powerUpConfigs.set(config.type, config);
    });
  }

  /**
   * Initialize power-up system
   */
  initialize(scene: THREE.Scene, physicsWorld: CANNON.World): void {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  /**
   * Spawn random power-up at position
   */
  spawnRandomPowerUp(position: THREE.Vector3): PowerUp | null {
    const availableTypes = Array.from(this.powerUpConfigs.keys());
    const weightedTypes: PowerUpType[] = [];

    // Create weighted array based on spawn chances
    availableTypes.forEach(type => {
      const config = this.powerUpConfigs.get(type)!;
      const weight = Math.floor(config.spawnChance * 100);
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type);
      }
    });

    if (weightedTypes.length === 0) return null;

    const randomType = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    return this.spawnPowerUp(randomType, position);
  }

  /**
   * Spawn specific power-up at position
   */
  spawnPowerUp(type: PowerUpType, position: THREE.Vector3): PowerUp {
    const config = this.powerUpConfigs.get(type)!;
    const id = `powerup-${Date.now()}-${Math.random()}`;

    // Create visual mesh
    const mesh = this.createPowerUpMesh(config);
    mesh.position.copy(position);
    this.scene.add(mesh);

    // Create physics body
    const shape = new CANNON.Sphere(0.5);
    const physicsBody = new CANNON.Body({
      mass: 0,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      type: CANNON.Body.KINEMATIC
    });

    // Add floating animation
    physicsBody.velocity.set(0, 0.5, 0);
    this.physicsWorld.addBody(physicsBody);

    const powerUp: PowerUp = {
      id,
      type,
      mesh,
      physicsBody,
      position: position.clone(),
      duration: config.duration,
      value: config.value,
      lifeTime: 0,
      maxLifeTime: config.maxLifeTime,
      isCollected: false
    };

    // Add userData for collision detection
    (physicsBody as any).userData = { type: 'powerup', powerUp };
    mesh.userData = { type: 'powerup', powerUp };

    this.powerUps.set(id, powerUp);
    return powerUp;
  }

  /**
   * Create visual mesh for power-up
   */
  private createPowerUpMesh(config: PowerUpConfig): THREE.Mesh {
    const geometry = new THREE.OctahedronGeometry(0.5);
    const material = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: config.color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Add glow effect
    const glowGeometry = new THREE.OctahedronGeometry(0.7);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);

    return mesh;
  }

  /**
   * Update power-up system
   */
  update(deltaTime: number): void {
    const currentTime = Date.now();

    // Update power-ups in world
    this.powerUps.forEach((powerUp, id) => {
      if (powerUp.isCollected) return;

      powerUp.lifeTime += deltaTime * 1000;

      // Animate power-up
      powerUp.mesh.rotation.y += deltaTime * 2;
      powerUp.mesh.rotation.x += deltaTime * 1;

      // Floating animation
      const floatOffset = Math.sin(currentTime * 0.003 + powerUp.id.charCodeAt(0)) * 0.5;
      powerUp.mesh.position.y = powerUp.position.y + floatOffset;

      // Pulsing glow
      const pulseIntensity = 0.3 + Math.sin(currentTime * 0.005) * 0.2;
      (powerUp.mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = pulseIntensity;

      // Remove expired power-ups
      if (powerUp.lifeTime >= powerUp.maxLifeTime) {
        this.removePowerUp(id);
      }
    });

    // Update active power-ups
    this.activePowerUps.forEach((activePowerUp, type) => {
      if (currentTime >= activePowerUp.endTime) {
        this.deactivatePowerUp(type);
      }
    });

    this.updateActivePowerUpsSubject();
  }

  /**
   * Collect power-up
   */
  collectPowerUp(powerUpId: string, playerShip: any): boolean {
    const powerUp = this.powerUps.get(powerUpId);
    if (!powerUp || powerUp.isCollected) return false;

    powerUp.isCollected = true;
    this.applyPowerUpEffect(powerUp, playerShip);
    this.removePowerUp(powerUpId);

    // Emit collection event
    this.onPowerUpCollected?.(powerUp, playerShip);

    return true;
  }

  /**
   * Apply power-up effect to player
   */
  private applyPowerUpEffect(powerUp: PowerUp, playerShip: any): void {
    const config = this.powerUpConfigs.get(powerUp.type)!;

    switch (powerUp.type) {
      case 'health_restore':
        playerShip.health = Math.min(playerShip.maxHealth, playerShip.health + powerUp.value);
        break;

      case 'shield_boost':
      case 'energy_boost':
      case 'damage_multiplier':
      case 'fire_rate_boost':
      case 'speed_boost':
      case 'invulnerability':
      case 'multi_shot':
      case 'homing_missiles':
      case 'shield_regeneration':
        this.activatePowerUp(powerUp.type, powerUp.duration, powerUp.value);
        break;
    }
  }

  /**
   * Activate temporary power-up
   */
  private activatePowerUp(type: PowerUpType, duration: number, value: number): void {
    const endTime = Date.now() + duration;

    // If power-up is already active, extend duration or stack effect
    const existing = this.activePowerUps.get(type);
    if (existing) {
      existing.endTime = Math.max(existing.endTime, endTime);
      if (type === 'damage_multiplier' || type === 'speed_boost') {
        existing.value = Math.min(existing.value + value * 0.5, value * 2); // Stack with diminishing returns
      }
    } else {
      this.activePowerUps.set(type, {
        type,
        endTime,
        value
      });
    }

    this.updateActivePowerUpsSubject();
  }

  /**
   * Deactivate power-up
   */
  private deactivatePowerUp(type: PowerUpType): void {
    this.activePowerUps.delete(type);
    this.updateActivePowerUpsSubject();
  }

  /**
   * Remove power-up from world
   */
  private removePowerUp(powerUpId: string): void {
    const powerUp = this.powerUps.get(powerUpId);
    if (!powerUp) return;

    this.scene.remove(powerUp.mesh);
    this.physicsWorld.removeBody(powerUp.physicsBody);
    this.powerUps.delete(powerUpId);
  }

  /**
   * Check if power-up is active
   */
  isPowerUpActive(type: PowerUpType): boolean {
    return this.activePowerUps.has(type);
  }

  /**
   * Get active power-up value
   */
  getActivePowerUpValue(type: PowerUpType): number {
    const activePowerUp = this.activePowerUps.get(type);
    return activePowerUp ? activePowerUp.value : 1;
  }

  /**
   * Get all active power-ups
   */
  getActivePowerUps(): ActivePowerUp[] {
    return Array.from(this.activePowerUps.values());
  }

  /**
   * Get power-up by physics body
   */
  getPowerUpByPhysicsBody(body: CANNON.Body): PowerUp | null {
    const userData = (body as any).userData;
    return userData?.type === 'powerup' ? userData.powerUp : null;
  }

  /**
   * Clear all power-ups
   */
  clearAllPowerUps(): void {
    this.powerUps.forEach((powerUp, id) => {
      this.removePowerUp(id);
    });
    this.activePowerUps.clear();
    this.updateActivePowerUpsSubject();
  }

  /**
   * Update active power-ups subject
   */
  private updateActivePowerUpsSubject(): void {
    this.activePowerUpsSubject.next(this.getActivePowerUps());
  }

  /**
   * Get power-up configuration
   */
  getPowerUpConfig(type: PowerUpType): PowerUpConfig | null {
    return this.powerUpConfigs.get(type) || null;
  }

  /**
   * Spawn power-up with chance
   */
  trySpawnPowerUp(position: THREE.Vector3, baseChance: number = 0.1): PowerUp | null {
    if (Math.random() < baseChance) {
      return this.spawnRandomPowerUp(position);
    }
    return null;
  }

  /**
   * Callback for power-up collection
   */
  onPowerUpCollected?: (powerUp: PowerUp, playerShip: any) => void;
}
