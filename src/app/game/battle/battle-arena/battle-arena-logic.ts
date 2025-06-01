import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  HostListener
} from '@angular/core';
import * as THREE from 'three';
import { ThreeService } from '../../../shared/three/three.service';
import { PhysicsService } from '../../../shared/three/physics.service';
import { AnimationService } from '../../../shared/three/animation.service';
import { Battle3DService, BattleState, BattleEvent, BattleShip, BattleWeapon } from '../../../shared/three/battle-3d.service';
import { SwapiService } from '../../../characters/swapi.service';
import { Starship } from '../../../characters/models/starship';
import { Subscription } from 'rxjs';

export class BattleArenaLogic implements OnInit, AfterViewInit, OnDestroy {
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

  // Керування
  private keys: { [key: string]: boolean } = {};
  private mousePosition = new THREE.Vector2();

  // Підписки
  private subscriptions: Subscription[] = [];

  // Доступ до Math для шаблону
  Math = Math;

  constructor(
    private threeService: ThreeService,
    private physicsService: PhysicsService,
    private animationService: AnimationService,
    private battle3DService: Battle3DService,
    private swapiService: SwapiService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.setupKeyboardControls();
  }

  ngAfterViewInit(): void {
    this.initializeBattleArena();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Налаштування підписок
   */
  private setupSubscriptions(): void {
    // Підписка на стан бою
    this.subscriptions.push(
      this.battle3DService.battleState$.subscribe(state => {
        this.battleState = state;
        this.playerShip = state.playerShip;
      })
    );

    // Підписка на події бою
    this.subscriptions.push(
      this.battle3DService.battleEvents$.subscribe(event => {
        this.battleEvents.push(event);
        // Обмежуємо кількість подій в логу
        if (this.battleEvents.length > 50) {
          this.battleEvents = this.battleEvents.slice(-50);
        }
      })
    );
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
    }
  }

  /**
   * Ініціалізація бойової арени
   */
  private async initializeBattleArena(): Promise<void> {
    try {
      // Створення 3D сцени
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

      this.scene = components.scene;
      this.camera = components.camera;
      this.renderer = components.renderer;

      // Ініціалізація бойової системи
      this.battle3DService.initializeBattleArena('battle-arena');

      // Створення космічного фону
      this.createSpaceBackground();

      // Завантаження кораблів
      await this.loadShips();

      // Запуск анімаційного циклу
      this.animate();

      this.isLoading = false;
    } catch (error) {
      console.error('Error initializing battle arena:', error);
      this.isLoading = false;
    }
  }

  /**
   * Створення космічного фону
   */
  private createSpaceBackground(): void {
    // Зірки
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

    // Туманність
    const nebulaGeometry = new THREE.PlaneGeometry(200, 200);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444aa,
      transparent: true,
      opacity: 0.1
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(0, 0, 50);
    this.scene.add(nebula);
  }

  /**
   * Завантаження кораблів
   */
  private async loadShips(): Promise<void> {
    try {
      // Завантаження списку кораблів
      const starshipsResponse = await this.swapiService.getStarships().toPromise();
      const starships = starshipsResponse?.results || [];

      if (starships.length === 0) {
        throw new Error('No starships available');
      }

      // Створення корабля гравця - пошук найкращого корабля для гравця
      const playerStarship = this.findBestPlayerShip(starships);
      await this.createPlayerShip(playerStarship);

      // Створення ворожих кораблів
      await this.createEnemyWave();

    } catch (error) {
      console.error('Error loading ships:', error);
      // Fallback - створення тестових кораблів
      await this.createTestShips();
    }
  }

  /**
   * Знаходить найкращий корабель для гравця
   */
  private findBestPlayerShip(starships: Starship[]): Starship {
    // Пріоритетний список кораблів для гравця
    const preferredShips = [
      'X-wing',
      'T-65',
      'Incom',
      'Starfighter',
      'Fighter',
      'Rebel',
      'Alliance'
    ];

    // Спочатку шукаємо за пріоритетними назвами
    for (const preferred of preferredShips) {
      const found = starships.find(s =>
        s.name.toLowerCase().includes(preferred.toLowerCase()) ||
        s.model.toLowerCase().includes(preferred.toLowerCase()) ||
        s.manufacturer.toLowerCase().includes(preferred.toLowerCase()) ||
        s.starship_class.toLowerCase().includes(preferred.toLowerCase())
      );
      if (found) {
        console.log(`🎯 Found preferred player ship: ${found.name}`);
        return found;
      }
    }

    // Якщо не знайшли пріоритетний, шукаємо будь-який винищувач
    const fighter = starships.find(s =>
      s.starship_class.toLowerCase().includes('fighter') ||
      s.starship_class.toLowerCase().includes('starfighter')
    );
    if (fighter) {
      console.log(`⚔️ Found fighter ship: ${fighter.name}`);
      return fighter;
    }

    // Якщо нічого не знайшли, беремо перший доступний
    console.log(`🚀 Using first available ship: ${starships[0].name}`);
    return starships[0];
  }

  /**
   * Створення корабля гравця
   */
  private async createPlayerShip(starshipData: Starship): Promise<void> {
    return new Promise((resolve, reject) => {
      this.battle3DService.createPlayerShip(starshipData).subscribe({
        next: (battleShip) => {
          this.playerShip = battleShip;
          console.log(`✅ Player ship created: ${starshipData.name}`);
          resolve();
        },
        error: (error) => {
          console.error(`❌ Failed to create player ship: ${starshipData.name}`, error);
          reject(error);
        }
      });
    });
  }

  /**
   * Створення хвилі ворогів
   */
  private async createEnemyWave(): Promise<void> {
    try {
      const starshipsResponse = await this.swapiService.getStarships().toPromise();
      const starships = starshipsResponse?.results || [];

      // Знаходимо ворожі кораблі
      const enemyShips = this.findEnemyShips(starships);
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
              resolve();
            },
            error: (error) => {
              console.error(`❌ Failed to create enemy ${i + 1}:`, error);
              resolve(); // Продовжуємо навіть при помилці
            }
          });
        });
      }
      console.log('✅ Enemy wave creation completed');
    } catch (error) {
      console.error('❌ Error creating enemy wave:', error);
      // Fallback - створюємо тестових ворогів
      await this.createTestEnemies();
    }
  }

  /**
   * Знаходить ворожі кораблі
   */
  private findEnemyShips(starships: Starship[]): Starship[] {
    // Пріоритетні ворожі кораблі
    const enemyPriorities = [
      'TIE',
      'Imperial',
      'Destroyer',
      'Empire',
      'Sith',
      'Death Star',
      'Dreadnought'
    ];

    const enemyShips: Starship[] = [];

    // Шукаємо за пріоритетними назвами
    for (const priority of enemyPriorities) {
      const found = starships.filter((s: Starship) =>
        s.name.toLowerCase().includes(priority.toLowerCase()) ||
        s.model.toLowerCase().includes(priority.toLowerCase()) ||
        s.manufacturer.toLowerCase().includes(priority.toLowerCase())
      );
      enemyShips.push(...found);

      // Обмежуємо кількість ворогів
      if (enemyShips.length >= 3) break;
    }

    // Якщо не знайшли достатньо ворогів, додаємо випадкові кораблі
    if (enemyShips.length < 3) {
      const remaining = starships.filter((s: Starship) => !enemyShips.includes(s));
      const needed = 3 - enemyShips.length;
      enemyShips.push(...remaining.slice(0, needed));
    }

    return enemyShips.slice(0, 3); // Максимум 3 вороги
  }

  /**
   * Створення тестових ворогів
   */
  private async createTestEnemies(): Promise<void> {
    console.log('🧪 Creating test enemies...');

    const enemyTypes = [
      { name: 'TIE Fighter', model: 'Twin Ion Engine Fighter' },
      { name: 'TIE Interceptor', model: 'TIE/IN Interceptor' },
      { name: 'Imperial Shuttle', model: 'Lambda-class Shuttle' }
    ];

    for (let i = 0; i < enemyTypes.length; i++) {
      const enemyData: Starship = {
        name: enemyTypes[i].name,
        model: enemyTypes[i].model,
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
        url: `test-enemy-${i}`
      };

      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 15,
        25 + i * 12
      );

      await new Promise<void>((resolve) => {
        this.battle3DService.createEnemyShip(enemyData, position).subscribe({
          next: (battleShip) => {
            console.log(`✅ Test enemy created: ${battleShip.starship3D.name}`);
            resolve();
          },
          error: (error) => {
            console.error(`❌ Failed to create test enemy ${i + 1}:`, error);
            resolve();
          }
        });
      });
    }
    console.log('✅ Test enemies creation completed');
  }

  /**
   * Створення тестових кораблів
   */
  private async createTestShips(): Promise<void> {
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

    await this.createPlayerShip(mockStarship);

    // Створення тестових ворогів
    for (let i = 0; i < 2; i++) {
      const enemyMock = { ...mockStarship, name: `Enemy ${i + 1}` };
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15,
        20 + i * 10
      );

      await new Promise<void>((resolve) => {
        this.battle3DService.createEnemyShip(enemyMock, position).subscribe({
          next: () => resolve(),
          error: () => resolve()
        });
      });
    }
  }

  /**
   * Анімаційний цикл
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Оновлення керування кораблем
    this.updatePlayerControls();

    // Оновлення камери
    this.updateCamera();

    // Оновлення бойової системи
    this.battle3DService.update(1/60);

    // Оновлення анімацій
    this.animationService.update();

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Оновлення керування кораблем гравця
   */
  private updatePlayerControls(): void {
    if (!this.playerShip || !this.battleState.isActive) return;

    const force = new THREE.Vector3();
    const torque = new THREE.Vector3();
    const moveSpeed = 50;
    const rotateSpeed = 2;

    // Рух
    if (this.keys['KeyW'] || this.keys['ArrowUp']) force.z += moveSpeed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) force.z -= moveSpeed;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) force.x -= moveSpeed;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) force.x += moveSpeed;
    if (this.keys['KeyQ']) force.y += moveSpeed;
    if (this.keys['KeyE']) force.y -= moveSpeed;

    // Обертання
    if (this.keys['KeyJ']) torque.y += rotateSpeed;
    if (this.keys['KeyL']) torque.y -= rotateSpeed;
    if (this.keys['KeyI']) torque.x += rotateSpeed;
    if (this.keys['KeyK']) torque.x -= rotateSpeed;

    // Застосування сил
    if (force.length() > 0) {
      this.physicsService.applyForce('battle-arena', this.playerShip.id, force as any);
    }

    if (torque.length() > 0) {
      this.playerShip.physicsBody.angularVelocity.set(torque.x, torque.y, torque.z);
    }
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
    } else {
      this.battle3DService.startBattle();
    }
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
   * Форматування подій бою
   */
  formatBattleEvent(event: BattleEvent): string {
    switch (event.type) {
      case 'ship_hit':
        return `Корабель отримав ${event.data.damage} пошкоджень`;
      case 'ship_destroyed':
        return `Корабель знищено!`;
      case 'weapon_fired':
        return `Постріл з ${event.data.weaponId}`;
      case 'shield_down':
        return `Щити відключені!`;
      case 'wave_complete':
        return `Хвиля завершена!`;
      case 'battle_end':
        return `Бій завершено. Рахунок: ${event.data.score}`;
      default:
        return `Невідома подія: ${event.type}`;
    }
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

    // Видалення обробників подій
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyDown);
  }
}
