import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ThreeService } from './three.service';
import { PhysicsService } from './physics.service';
import { AnimationService } from './animation.service';
import { Starship3DService, Starship3D } from './starship-3d.service';
import { AISystemService, AIShip } from './ai-system.service';
import { WaveSystemService, WaveConfig, EnemyWaveConfig } from './wave-system.service';
import { PowerUpSystemService, PowerUp } from './powerup-system.service';
import { WeaponSystemService, AdvancedWeapon, WeaponType } from './weapon-system.service';
import { EnvironmentalHazardsService, EnvironmentalHazard, HazardType } from './environmental-hazards.service';
import { AchievementSystemService, PlayerStats } from './achievement-system.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface BattleShip {
  id: string;
  starship3D: Starship3D;
  physicsBody: CANNON.Body;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  isPlayer: boolean;
  isDestroyed: boolean;
  weapons: BattleWeapon[];
  shields: BattleShield;
}

export interface BattleWeapon {
  id: string;
  type: 'laser' | 'ion' | 'turbolaser' | 'missile';
  damage: number;
  range: number;
  cooldown: number;
  lastFired: number;
  energyCost: number;
  projectileSpeed: number;
}

export interface BattleShield {
  strength: number;
  maxStrength: number;
  rechargeRate: number;
  isActive: boolean;
}

export interface BattleProjectile {
  id: string;
  mesh: THREE.Mesh;
  physicsBody: CANNON.Body;
  damage: number;
  ownerId: string;
  type: string;
  lifeTime: number;
  maxLifeTime: number;
}

export interface BattleExplosion {
  id: string;
  position: THREE.Vector3;
  size: number;
  duration: number;
  maxDuration: number;
  particles: THREE.Points;
}

export interface BattleState {
  isActive: boolean;
  isPaused: boolean;
  timeElapsed: number;
  playerShip: BattleShip | null;
  enemyShips: BattleShip[];
  projectiles: BattleProjectile[];
  explosions: BattleExplosion[];
  score: number;
  wave: number;
}

export interface BattleEvent {
  type: 'ship_hit' | 'ship_destroyed' | 'weapon_fired' | 'shield_down' | 'wave_complete' | 'battle_end' | 'powerup_collected' | 'wave_started';
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class Battle3DService {
  private battleState: BattleState = {
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

  private battleStateSubject = new BehaviorSubject<BattleState>(this.battleState);
  public battleState$ = this.battleStateSubject.asObservable();

  private battleEventsSubject = new Subject<BattleEvent>();
  public battleEvents$ = this.battleEventsSubject.asObservable();

  private scene!: THREE.Scene;
  private physicsWorld!: CANNON.World;
  private clock = new THREE.Clock();

  // Матеріали для фізики
  private shipMaterial!: CANNON.Material;
  private projectileMaterial!: CANNON.Material;
  private boundaryMaterial!: CANNON.Material;

  constructor(
    private threeService: ThreeService,
    private physicsService: PhysicsService,
    private animationService: AnimationService,
    private starship3DService: Starship3DService,
    private aiSystemService: AISystemService,
    private waveSystemService: WaveSystemService,
    private powerUpSystemService: PowerUpSystemService,
    private weaponSystemService: WeaponSystemService,
    private environmentalHazardsService: EnvironmentalHazardsService,
    private achievementSystemService: AchievementSystemService
  ) {
    this.initializeMaterials();
    this.setupSystemCallbacks();
  }

  /**
   * Setup system callbacks
   */
  private setupSystemCallbacks(): void {
    // AI system callbacks
    this.aiSystemService.onAIFireWeapon = (ship: AIShip, weaponId: string, target: THREE.Vector3) => {
      this.fireWeapon(ship, weaponId, target);
    };

    // Wave system callbacks
    this.waveSystemService.onWaveStart = (config: WaveConfig) => {
      this.battleEventsSubject.next({
        type: 'wave_started',
        data: { waveNumber: config.waveNumber, enemyCount: config.enemyCount },
        timestamp: Date.now()
      });
    };

    this.waveSystemService.onWaveComplete = (config: WaveConfig) => {
      this.battleState.score += config.bonusReward;
      this.battleEventsSubject.next({
        type: 'wave_complete',
        data: { waveNumber: config.waveNumber, bonus: config.bonusReward },
        timestamp: Date.now()
      });
    };

    this.waveSystemService.onEnemySpawn = (config: EnemyWaveConfig, position: THREE.Vector3) => {
      this.spawnWaveEnemy(config, position);
    };

    // Power-up system callbacks
    this.powerUpSystemService.onPowerUpCollected = (powerUp: PowerUp, playerShip: any) => {
      this.battleEventsSubject.next({
        type: 'powerup_collected',
        data: { type: powerUp.type, value: powerUp.value },
        timestamp: Date.now()
      });
    };
  }

  /**
   * Initialize physics materials
   */
  private initializeMaterials(): void {
    this.shipMaterial = this.physicsService.createMaterial('ship', {
      friction: 0.1,
      restitution: 0.3
    });

    this.projectileMaterial = this.physicsService.createMaterial('projectile', {
      friction: 0.0,
      restitution: 0.8
    });

    this.boundaryMaterial = this.physicsService.createMaterial('boundary', {
      friction: 0.0,
      restitution: 1.0
    });
  }

  /**
   * Initialize battle arena
   */
  initializeBattleArena(sceneId: string): void {
    this.scene = this.threeService.getScene(sceneId)!;
    
    // Create physics world without gravity (space)
    this.physicsWorld = this.physicsService.createWorld(sceneId, {
      gravity: new CANNON.Vec3(0, 0, 0),
      broadphase: new CANNON.NaiveBroadphase(),
      allowSleep: false
    });

    // Create arena boundaries
    this.createArenaBoundaries();

    // Setup contact materials
    this.setupContactMaterials();

    // Setup collision handlers
    this.setupCollisionHandlers();

    // Initialize subsystems
    this.powerUpSystemService.initialize(this.scene, this.physicsWorld);
    this.environmentalHazardsService.initialize(this.scene, this.physicsWorld);
  }

  /**
   * Створення меж арени
   */
  private createArenaBoundaries(): void {
    const arenaSize = 100;
    const wallThickness = 1;

    // Створення невидимих стін
    const walls = [
      { pos: [arenaSize, 0, 0], size: [wallThickness, arenaSize, arenaSize] },
      { pos: [-arenaSize, 0, 0], size: [wallThickness, arenaSize, arenaSize] },
      { pos: [0, arenaSize, 0], size: [arenaSize, wallThickness, arenaSize] },
      { pos: [0, -arenaSize, 0], size: [arenaSize, wallThickness, arenaSize] },
      { pos: [0, 0, arenaSize], size: [arenaSize, arenaSize, wallThickness] },
      { pos: [0, 0, -arenaSize], size: [arenaSize, arenaSize, wallThickness] }
    ];

    walls.forEach((wall, index) => {
      const shape = new CANNON.Box(new CANNON.Vec3(wall.size[0], wall.size[1], wall.size[2]));
      const body = new CANNON.Body({
        mass: 0,
        shape,
        position: new CANNON.Vec3(wall.pos[0], wall.pos[1], wall.pos[2]),
        material: this.boundaryMaterial,
        type: CANNON.Body.STATIC
      });
      
      this.physicsWorld.addBody(body);
    });
  }

  /**
   * Налаштування контактних матеріалів
   */
  private setupContactMaterials(): void {
    // Корабель-корабель
    const shipShipContact = this.physicsService.createContactMaterial(
      this.shipMaterial,
      this.shipMaterial,
      { friction: 0.1, restitution: 0.5 }
    );

    // Снаряд-корабель
    const projectileShipContact = this.physicsService.createContactMaterial(
      this.projectileMaterial,
      this.shipMaterial,
      { friction: 0.0, restitution: 0.0 }
    );

    // Снаряд-межа
    const projectileBoundaryContact = this.physicsService.createContactMaterial(
      this.projectileMaterial,
      this.boundaryMaterial,
      { friction: 0.0, restitution: 0.8 }
    );

    this.physicsWorld.addContactMaterial(shipShipContact);
    this.physicsWorld.addContactMaterial(projectileShipContact);
    this.physicsWorld.addContactMaterial(projectileBoundaryContact);
  }

  /**
   * Налаштування обробників колізій
   */
  private setupCollisionHandlers(): void {
    this.physicsWorld.addEventListener('beginContact', (event: any) => {
      const { bodyA, bodyB } = event;
      this.handleCollision(bodyA, bodyB);
    });
  }

  /**
   * Обробка колізій
   */
  private handleCollision(bodyA: CANNON.Body, bodyB: CANNON.Body): void {
    const objectA = this.getObjectByPhysicsBody(bodyA);
    const objectB = this.getObjectByPhysicsBody(bodyB);

    if (!objectA || !objectB) return;

    // Снаряд влучив у корабель
    if (objectA.type === 'projectile' && objectB.type === 'ship') {
      this.handleProjectileHit(objectA as BattleProjectile, objectB as BattleShip);
    } else if (objectA.type === 'ship' && objectB.type === 'projectile') {
      this.handleProjectileHit(objectB as BattleProjectile, objectA as BattleShip);
    }
    // Корабель зіткнувся з кораблем
    else if (objectA.type === 'ship' && objectB.type === 'ship') {
      this.handleShipCollision(objectA as BattleShip, objectB as BattleShip);
    }
    // Корабель зібрав power-up
    else if (objectA.type === 'ship' && objectB.type === 'powerup') {
      this.handlePowerUpCollection(objectA as BattleShip, objectB as PowerUp);
    } else if (objectA.type === 'powerup' && objectB.type === 'ship') {
      this.handlePowerUpCollection(objectB as BattleShip, objectA as PowerUp);
    }
  }

  /**
   * Створення корабля гравця
   */
  createPlayerShip(starshipData: any): Observable<BattleShip> {
    return new Observable(observer => {
      this.starship3DService.createStarship3D(starshipData).subscribe({
        next: (starship3D) => {
          const battleShip = this.createBattleShip(starship3D, true);
          
          // Позиціонування корабля гравця
          battleShip.physicsBody.position.set(0, 0, -30);
          battleShip.starship3D.model.position.copy(battleShip.physicsBody.position as any);

          this.battleState.playerShip = battleShip;
          this.scene.add(battleShip.starship3D.model);
          
          this.updateBattleState();
          observer.next(battleShip);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Створення ворожого корабля
   */
  createEnemyShip(starshipData: any, position: THREE.Vector3): Observable<BattleShip> {
    return new Observable(observer => {
      this.starship3DService.createStarship3D(starshipData).subscribe({
        next: (starship3D) => {
          const battleShip = this.createBattleShip(starship3D, false);
          
          // Позиціонування ворожого корабля
          battleShip.physicsBody.position.set(position.x, position.y, position.z);
          battleShip.starship3D.model.position.copy(battleShip.physicsBody.position as any);

          this.battleState.enemyShips.push(battleShip);
          this.scene.add(battleShip.starship3D.model);
          
          this.updateBattleState();
          observer.next(battleShip);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Створення бойового корабля
   */
  private createBattleShip(starship3D: Starship3D, isPlayer: boolean): BattleShip {
    // Створення фізичного тіла
    const shape = new CANNON.Box(new CANNON.Vec3(2, 1, 3));
    const physicsBody = new CANNON.Body({
      mass: isPlayer ? 10 : 8,
      shape,
      material: this.shipMaterial,
      type: CANNON.Body.DYNAMIC
    });

    this.physicsWorld.addBody(physicsBody);

    // Створення зброї
    const weapons: BattleWeapon[] = [
      {
        id: 'primary',
        type: 'laser',
        damage: 25,
        range: 50,
        cooldown: 500,
        lastFired: 0,
        energyCost: 10,
        projectileSpeed: 80
      },
      {
        id: 'secondary',
        type: 'missile',
        damage: 50,
        range: 60,
        cooldown: 2000,
        lastFired: 0,
        energyCost: 25,
        projectileSpeed: 40
      }
    ];

    const battleShip: BattleShip = {
      id: `ship-${Date.now()}-${Math.random()}`,
      starship3D,
      physicsBody,
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      isPlayer,
      isDestroyed: false,
      weapons,
      shields: {
        strength: 50,
        maxStrength: 50,
        rechargeRate: 2,
        isActive: true
      }
    };

    // Додавання userData для ідентифікації
    (physicsBody as any).userData = { type: 'ship', battleShip };
    starship3D.model.userData = { type: 'ship', battleShip };

    return battleShip;
  }

  /**
   * Стрільба зброєю
   */
  fireWeapon(ship: BattleShip, weaponId: string, target?: THREE.Vector3): void {
    const weapon = ship.weapons.find(w => w.id === weaponId);
    if (!weapon) return;

    const currentTime = Date.now();
    if (currentTime - weapon.lastFired < weapon.cooldown) return;
    if (ship.energy < weapon.energyCost) return;

    weapon.lastFired = currentTime;
    ship.energy -= weapon.energyCost;

    // Створення снаряда
    const projectile = this.createProjectile(ship, weapon, target);
    this.battleState.projectiles.push(projectile);
    this.scene.add(projectile.mesh);

    // Емітування події
    this.battleEventsSubject.next({
      type: 'weapon_fired',
      data: { shipId: ship.id, weaponId, projectileId: projectile.id },
      timestamp: currentTime
    });

    this.updateBattleState();
  }

  /**
   * Створення снаряда
   */
  private createProjectile(ship: BattleShip, weapon: BattleWeapon, target?: THREE.Vector3): BattleProjectile {
    // Визначення позиції пуску
    const shipPosition = ship.physicsBody.position;
    const launchPosition = new THREE.Vector3(
      shipPosition.x,
      shipPosition.y,
      shipPosition.z + (ship.isPlayer ? 3 : -3)
    );

    // Створення візуального снаряда
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (weapon.type) {
      case 'laser':
        geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        break;
      case 'ion':
        geometry = new THREE.SphereGeometry(0.1, 8, 8);
        material = new THREE.MeshBasicMaterial({ color: 0x0088ff });
        break;
      case 'turbolaser':
        geometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        break;
      case 'missile':
        geometry = new THREE.CylinderGeometry(0.1, 0.05, 0.8, 8);
        material = new THREE.MeshPhongMaterial({ color: 0x888888 });
        break;
      default:
        geometry = new THREE.SphereGeometry(0.1, 8, 8);
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(launchPosition);

    // Створення фізичного тіла снаряда
    const shape = new CANNON.Sphere(0.1);
    const physicsBody = new CANNON.Body({
      mass: 0.1,
      shape,
      material: this.projectileMaterial,
      position: new CANNON.Vec3(launchPosition.x, launchPosition.y, launchPosition.z)
    });

    // Визначення напрямку
    let direction: THREE.Vector3;
    if (target) {
      direction = target.clone().sub(launchPosition).normalize();
    } else {
      direction = new THREE.Vector3(0, 0, ship.isPlayer ? 1 : -1);
    }

    // Застосування швидкості
    const velocity = direction.multiplyScalar(weapon.projectileSpeed);
    physicsBody.velocity.set(velocity.x, velocity.y, velocity.z);

    this.physicsWorld.addBody(physicsBody);

    const projectile: BattleProjectile = {
      id: `projectile-${Date.now()}-${Math.random()}`,
      mesh,
      physicsBody,
      damage: weapon.damage,
      ownerId: ship.id,
      type: weapon.type,
      lifeTime: 0,
      maxLifeTime: 5000 // 5 секунд
    };

    // Додавання userData
    (physicsBody as any).userData = { type: 'projectile', projectile };
    mesh.userData = { type: 'projectile', projectile };

    return projectile;
  }

  /**
   * Обробка влучення снаряда
   */
  private handleProjectileHit(projectile: BattleProjectile, ship: BattleShip): void {
    if (projectile.ownerId === ship.id) return; // Не можна влучити в себе

    let damage = projectile.damage;

    // Обробка щитів
    if (ship.shields.isActive && ship.shields.strength > 0) {
      const shieldAbsorbed = Math.min(damage, ship.shields.strength);
      ship.shields.strength -= shieldAbsorbed;
      damage -= shieldAbsorbed;

      if (ship.shields.strength <= 0) {
        ship.shields.isActive = false;
        this.battleEventsSubject.next({
          type: 'shield_down',
          data: { shipId: ship.id },
          timestamp: Date.now()
        });
      }
    }

    // Нанесення пошкоджень корпусу
    ship.health -= damage;

    // Створення вибуху
    this.createExplosion(projectile.mesh.position, 2);

    // Видалення снаряда
    this.removeProjectile(projectile);

    // Емітування події влучення
    this.battleEventsSubject.next({
      type: 'ship_hit',
      data: { shipId: ship.id, damage, projectileType: projectile.type },
      timestamp: Date.now()
    });

    // Перевірка знищення корабля
    if (ship.health <= 0) {
      this.destroyShip(ship);
    }

    this.updateBattleState();
  }

  /**
   * Створення вибуху
   */
  private createExplosion(position: THREE.Vector3, size: number): void {
    // Створення системи частинок для вибуху
    const particleCount = 50;
    const particles = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = position.x + (Math.random() - 0.5) * size;
      particles[i * 3 + 1] = position.y + (Math.random() - 0.5) * size;
      particles[i * 3 + 2] = position.z + (Math.random() - 0.5) * size;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff4400,
      size: 0.2,
      transparent: true,
      opacity: 1
    });

    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);

    const explosion: BattleExplosion = {
      id: `explosion-${Date.now()}`,
      position: position.clone(),
      size,
      duration: 0,
      maxDuration: 1000,
      particles: particleSystem
    };

    this.battleState.explosions.push(explosion);
  }

  /**
   * Знищення корабля
   */
  private destroyShip(ship: BattleShip): void {
    ship.isDestroyed = true;

    // Створення великого вибуху
    this.createExplosion(ship.starship3D.model.position, 5);

    // Spawn power-up chance for enemy ships
    if (!ship.isPlayer) {
      this.powerUpSystemService.trySpawnPowerUp(ship.starship3D.model.position, 0.3);

      // Notify wave system of enemy destruction
      this.waveSystemService.enemyDestroyed(100);

      // Track achievements
      this.achievementSystemService.incrementStats({
        enemiesDestroyed: 1,
        creditsEarned: 100
      });

      // Check if it's a boss
      if (ship.maxHealth > 200) {
        this.achievementSystemService.incrementStats({ bossesDefeated: 1 });
      }
    }

    // Remove from AI system
    this.aiSystemService.removeAIShip(ship.id);

    // Видалення з сцени та фізичного світу
    this.scene.remove(ship.starship3D.model);
    this.physicsWorld.removeBody(ship.physicsBody);

    // Видалення зі списків
    if (ship.isPlayer) {
      this.battleState.playerShip = null;
    } else {
      const index = this.battleState.enemyShips.indexOf(ship);
      if (index > -1) {
        this.battleState.enemyShips.splice(index, 1);
      }
    }

    // Емітування події знищення
    this.battleEventsSubject.next({
      type: 'ship_destroyed',
      data: { shipId: ship.id, isPlayer: ship.isPlayer },
      timestamp: Date.now()
    });

    this.updateBattleState();
  }

  /**
   * Видалення снаряда
   */
  private removeProjectile(projectile: BattleProjectile): void {
    this.scene.remove(projectile.mesh);
    this.physicsWorld.removeBody(projectile.physicsBody);

    const index = this.battleState.projectiles.indexOf(projectile);
    if (index > -1) {
      this.battleState.projectiles.splice(index, 1);
    }
  }

  /**
   * Отримання об'єкта за фізичним тілом
   */
  private getObjectByPhysicsBody(body: CANNON.Body): any {
    return (body as any).userData;
  }

  /**
   * Обробка зіткнення кораблів
   */
  private handleShipCollision(shipA: BattleShip, shipB: BattleShip): void {
    // Нанесення пошкоджень від зіткнення
    const damage = 10;
    shipA.health -= damage;
    shipB.health -= damage;

    // Створення ефектів
    this.createExplosion(shipA.starship3D.model.position, 1);
    this.createExplosion(shipB.starship3D.model.position, 1);

    this.updateBattleState();
  }

  /**
   * Handle power-up collection
   */
  private handlePowerUpCollection(ship: BattleShip, powerUp: PowerUp): void {
    if (ship.isPlayer) {
      this.powerUpSystemService.collectPowerUp(powerUp.id, ship);
    }
  }

  /**
   * Spawn enemy from wave system
   */
  private spawnWaveEnemy(config: EnemyWaveConfig, position: THREE.Vector3): void {
    // Create mock starship data based on config
    const mockStarship = {
      name: `${config.shipType.charAt(0).toUpperCase() + config.shipType.slice(1)} Fighter`,
      model: config.shipType,
      manufacturer: 'Imperial Fleet',
      cost_in_credits: '0',
      length: '12',
      max_atmosphering_speed: '1000',
      crew: '1',
      passengers: '0',
      cargo_capacity: '0',
      consumables: '1 day',
      hyperdrive_rating: '2.0',
      MGLT: '100',
      starship_class: config.shipType,
      pilots: [],
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      url: 'wave-enemy'
    };

    this.createEnemyShip(mockStarship, position).subscribe({
      next: (battleShip) => {
        // Apply wave modifiers
        battleShip.health *= config.healthMultiplier;
        battleShip.maxHealth *= config.healthMultiplier;

        // Modify weapon damage
        battleShip.weapons.forEach(weapon => {
          weapon.damage *= config.damageMultiplier;
        });

        // Register with AI system
        const aiShip = this.aiSystemService.registerAIShip(battleShip, config.aiBehavior);

        // Update battle state
        this.updateBattleState();
      },
      error: (error) => {
        console.error('Failed to spawn wave enemy:', error);
      }
    });
  }

  /**
   * Оновлення стану бою
   */
  private updateBattleState(): void {
    this.battleStateSubject.next({ ...this.battleState });
  }

  /**
   * Оновлення бою (викликається кожен кадр)
   */
  update(deltaTime: number): void {
    if (!this.battleState.isActive || this.battleState.isPaused) return;

    this.battleState.timeElapsed += deltaTime;

    // Update AI system
    const allShips = [this.battleState.playerShip, ...this.battleState.enemyShips].filter(Boolean) as BattleShip[];
    this.aiSystemService.updateAI(deltaTime, allShips);

    // Update wave system
    this.waveSystemService.update(deltaTime);

    // Update power-up system
    this.powerUpSystemService.update(deltaTime);

    // Update environmental hazards
    this.environmentalHazardsService.update(deltaTime);

    // Check hazard collisions
    this.checkHazardCollisions();

    // Оновлення фізики
    this.physicsService.stepWorld('battle-arena', deltaTime);

    // Оновлення снарядів
    this.updateProjectiles(deltaTime);

    // Оновлення вибухів
    this.updateExplosions(deltaTime);

    // Оновлення кораблів
    this.updateShips(deltaTime);

    // Синхронізація візуальних моделей з фізичними тілами
    this.syncVisualWithPhysics();

    this.updateBattleState();
  }

  /**
   * Оновлення снарядів
   */
  private updateProjectiles(deltaTime: number): void {
    this.battleState.projectiles = this.battleState.projectiles.filter(projectile => {
      projectile.lifeTime += deltaTime * 1000;

      if (projectile.lifeTime >= projectile.maxLifeTime) {
        this.removeProjectile(projectile);
        return false;
      }

      return true;
    });
  }

  /**
   * Оновлення вибухів
   */
  private updateExplosions(deltaTime: number): void {
    this.battleState.explosions = this.battleState.explosions.filter(explosion => {
      explosion.duration += deltaTime * 1000;

      // Анімація зникнення
      const progress = explosion.duration / explosion.maxDuration;
      const material = explosion.particles.material as THREE.PointsMaterial;
      material.opacity = 1 - progress;

      if (explosion.duration >= explosion.maxDuration) {
        this.scene.remove(explosion.particles);
        return false;
      }

      return true;
    });
  }

  /**
   * Оновлення кораблів
   */
  private updateShips(deltaTime: number): void {
    const ships = [this.battleState.playerShip, ...this.battleState.enemyShips].filter(Boolean) as BattleShip[];

    ships.forEach(ship => {
      // Регенерація енергії
      ship.energy = Math.min(ship.maxEnergy, ship.energy + 20 * deltaTime);

      // Регенерація щитів
      if (!ship.shields.isActive && ship.shields.strength <= 0) {
        ship.shields.strength += ship.shields.rechargeRate * deltaTime;
        if (ship.shields.strength >= ship.shields.maxStrength * 0.25) {
          ship.shields.isActive = true;
        }
      } else if (ship.shields.isActive) {
        ship.shields.strength = Math.min(ship.shields.maxStrength, 
          ship.shields.strength + ship.shields.rechargeRate * deltaTime);
      }
    });
  }

  /**
   * Синхронізація візуальних моделей з фізичними тілами
   */
  private syncVisualWithPhysics(): void {
    // Синхронізація кораблів
    const ships = [this.battleState.playerShip, ...this.battleState.enemyShips].filter(Boolean) as BattleShip[];
    ships.forEach(ship => {
      this.physicsService.syncMeshWithBody(ship.starship3D.model as any, ship.physicsBody);
    });

    // Синхронізація снарядів
    this.battleState.projectiles.forEach(projectile => {
      this.physicsService.syncMeshWithBody(projectile.mesh as any, projectile.physicsBody);
    });
  }

  /**
   * Запуск бою
   */
  startBattle(): void {
    this.battleState.isActive = true;
    this.battleState.isPaused = false;
    this.battleState.timeElapsed = 0;
    this.clock.start();

    // Set player ship for AI system
    if (this.battleState.playerShip) {
      this.aiSystemService.setPlayerShip(this.battleState.playerShip);
    }

    // Start wave system
    this.waveSystemService.startWaveSystem();

    this.updateBattleState();
  }

  /**
   * Start enhanced battle with waves
   */
  startEnhancedBattle(): void {
    this.startBattle();
  }

  /**
   * Призупинення бою
   */
  pauseBattle(): void {
    this.battleState.isPaused = !this.battleState.isPaused;
    this.updateBattleState();
  }

  /**
   * Завершення бою
   */
  endBattle(): void {
    this.battleState.isActive = false;
    this.battleEventsSubject.next({
      type: 'battle_end',
      data: { 
        score: this.battleState.score, 
        timeElapsed: this.battleState.timeElapsed,
        wave: this.battleState.wave
      },
      timestamp: Date.now()
    });
    this.updateBattleState();
  }

  /**
   * Очищення ресурсів бою
   */
  cleanup(): void {
    // Stop wave system
    this.waveSystemService.stopWaveSystem();

    // Clear power-ups
    this.powerUpSystemService.clearAllPowerUps();

    // Clear AI ships
    this.battleState.enemyShips.forEach(ship => {
      this.aiSystemService.removeAIShip(ship.id);
    });

    this.battleState = {
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

    this.updateBattleState();
  }

  /**
   * Get wave system service
   */
  getWaveSystemService(): WaveSystemService {
    return this.waveSystemService;
  }

  /**
   * Get power-up system service
   */
  getPowerUpSystemService(): PowerUpSystemService {
    return this.powerUpSystemService;
  }

  /**
   * Get AI system service
   */
  getAISystemService(): AISystemService {
    return this.aiSystemService;
  }

  /**
   * Get weapon system service
   */
  getWeaponSystemService(): WeaponSystemService {
    return this.weaponSystemService;
  }

  /**
   * Get environmental hazards service
   */
  getEnvironmentalHazardsService(): EnvironmentalHazardsService {
    return this.environmentalHazardsService;
  }

  /**
   * Get achievement system service
   */
  getAchievementSystemService(): AchievementSystemService {
    return this.achievementSystemService;
  }

  /**
   * Check hazard collisions
   */
  private checkHazardCollisions(): void {
    if (!this.battleState.playerShip) return;

    const playerPosition = this.battleState.playerShip.starship3D.model.position;
    const hazards = this.environmentalHazardsService.checkCollision(playerPosition, 2);

    hazards.forEach(hazard => {
      this.applyHazardEffects(this.battleState.playerShip!, hazard);

      // Track achievement
      this.achievementSystemService.incrementStats({ hazardsSurvived: 1 });
    });
  }

  /**
   * Apply hazard effects to ship
   */
  private applyHazardEffects(ship: BattleShip, hazard: EnvironmentalHazard): void {
    hazard.effects.forEach(effect => {
      switch (effect.type) {
        case 'damage':
          ship.health -= effect.strength;
          this.achievementSystemService.incrementStats({ damageTaken: effect.strength });
          break;
        case 'slow':
          // Apply slow effect (would need ship speed modification)
          break;
        case 'drain_energy':
          ship.energy = Math.max(0, ship.energy - effect.strength);
          break;
        case 'disable':
          // Temporarily disable weapons
          break;
      }
    });

    if (ship.health <= 0) {
      this.destroyShip(ship);
    }
  }

  /**
   * Spawn random environmental hazard
   */
  spawnRandomHazard(): void {
    const hazardTypes: HazardType[] = ['asteroid_field', 'solar_flare', 'nebula_cloud', 'space_mine'];
    const randomType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 80
    );

    switch (randomType) {
      case 'asteroid_field':
        this.environmentalHazardsService.createAsteroidField(position);
        break;
      case 'solar_flare':
        this.environmentalHazardsService.createSolarFlare(position);
        break;
      case 'nebula_cloud':
        this.environmentalHazardsService.createNebulaCloud(position);
        break;
      case 'space_mine':
        this.environmentalHazardsService.createSpaceMine(position);
        break;
    }
  }
}
