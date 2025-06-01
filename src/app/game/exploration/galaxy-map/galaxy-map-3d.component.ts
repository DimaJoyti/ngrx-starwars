import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  HostListener,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as THREE from 'three';
import { ThreeService } from '../../../shared/three/three.service';
import { AnimationService } from '../../../shared/three/animation.service';
import { SwapiService } from '../../../characters/swapi.service';
import { RouterModule } from '@angular/router';
import { Planet } from '../../../characters/models/planet';
import { Observable, Subscription } from 'rxjs';

interface Planet3D {
  id: number;
  name: string;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  data: Planet;
  system: string;
  isUnlocked: boolean;
}

interface StarSystem3D {
  id: number;
  name: string;
  position: THREE.Vector3;
  planets: Planet3D[];
  star: THREE.Mesh;
}

@Component({
  selector: 'app-galaxy-map-3d',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule],
  template: `
    <div class="galaxy-container">
      <!-- 3D Canvas -->
      <div #galaxyContainer class="galaxy-canvas" 
           [style.width.px]="1200" 
           [style.height.px]="800">
      </div>

      <!-- UI Overlay -->
      <div class="galaxy-ui">
        <!-- Controls -->
        <div class="controls-panel">
          <h3>🌌 Галактична карта</h3>
          <button mat-raised-button color="primary" (click)="resetCamera()">
            <mat-icon>center_focus_strong</mat-icon>
            Центрувати
          </button>
          <button mat-raised-button (click)="toggleAutoRotate()">
            <mat-icon>{{ autoRotate ? 'pause' : 'play_arrow' }}</mat-icon>
            {{ autoRotate ? 'Зупинити' : 'Обертати' }}
          </button>
          <button mat-raised-button (click)="toggleLabels()">
            <mat-icon>label</mat-icon>
            {{ showLabels ? 'Сховати' : 'Показати' }} назви
          </button>
        </div>

        <!-- Planet Info Panel -->
        <div class="info-panel" *ngIf="selectedPlanet">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ selectedPlanet.name }}</mat-card-title>
              <mat-card-subtitle>{{ selectedPlanet.system }} система</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="planet-details">
                <div><strong>Клімат:</strong> {{ selectedPlanet.data.climate }}</div>
                <div><strong>Рельєф:</strong> {{ selectedPlanet.data.terrain }}</div>
                <div><strong>Населення:</strong> {{ selectedPlanet.data.population }}</div>
                <div><strong>Діаметр:</strong> {{ selectedPlanet.data.diameter }} км</div>
                <div><strong>Гравітація:</strong> {{ selectedPlanet.data.gravity }}</div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" 
                      [disabled]="!selectedPlanet.isUnlocked"
                      (click)="visitPlanet(selectedPlanet)">
                <mat-icon>rocket_launch</mat-icon>
                {{ selectedPlanet.isUnlocked ? 'Відвідати' : 'Заблоковано' }}
              </button>
              <button mat-button (click)="selectedPlanet = null">
                <mat-icon>close</mat-icon>
                Закрити
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Loading -->
        <div class="loading-panel" *ngIf="isLoading">
          <mat-card>
            <mat-card-content>
              <div class="loading-content">
                <div class="spinner"></div>
                <p>Завантаження галактики...</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Navigation -->
        <div class="navigation-panel">
          <button mat-fab color="accent" routerLink="/game" matTooltip="Повернутися до меню">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .galaxy-container {
      position: relative;
      width: 100%;
      height: 100vh;
      background: radial-gradient(ellipse at center, #0f0f23 0%, #000000 100%);
      overflow: hidden;
    }

    .galaxy-canvas {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px solid #ffd700;
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
    }

    .galaxy-ui {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    }

    .controls-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #ffd700;
      pointer-events: auto;
      min-width: 200px;
    }

    .controls-panel h3 {
      color: #ffd700;
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .controls-panel button {
      width: 100%;
      margin-bottom: 8px;
    }

    .info-panel {
      position: absolute;
      top: 20px;
      right: 20px;
      max-width: 350px;
      pointer-events: auto;
    }

    .info-panel mat-card {
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border: 1px solid #ffd700;
    }

    .info-panel mat-card-title {
      color: #ffd700;
    }

    .planet-details div {
      margin: 8px 0;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    }

    .planet-details strong {
      color: #ffd700;
    }

    .loading-panel {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: auto;
    }

    .loading-panel mat-card {
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border: 1px solid #ffd700;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
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

    .navigation-panel {
      position: absolute;
      bottom: 20px;
      left: 20px;
      pointer-events: auto;
    }

    .navigation-panel button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
    }
  `]
})
export class GalaxyMap3DComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('galaxyContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

  // 3D об'єкти
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls: any; // OrbitControls
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Дані
  private starSystems: StarSystem3D[] = [];
  private planets: Planet3D[] = [];
  selectedPlanet: Planet3D | null = null;

  // Стан
  isLoading = true;
  autoRotate = true;
  showLabels = true;

  // Підписки
  private subscriptions: Subscription[] = [];
  private animationId!: number;

  constructor(
    private threeService: ThreeService,
    private animationService: AnimationService,
    private swapiService: SwapiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlanetsData();
  }

  ngAfterViewInit(): void {
    this.initializeGalaxy();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private loadPlanetsData(): void {
    this.subscriptions.push(
      this.swapiService.getPlanets().subscribe({
        next: (response) => {
          this.createGalaxyFromPlanets(response.results);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading planets:', error);
          this.createMockGalaxy(); // Fallback
          this.isLoading = false;
        }
      })
    );
  }

  private initializeGalaxy(): void {
    const container = this.containerRef.nativeElement;
    
    // Створення основних компонентів
    const components = this.threeService.createScene(
      'galaxy-map',
      this.containerRef,
      {
        backgroundColor: 0x000011,
        fog: { color: 0x000011, near: 50, far: 2000 }
      },
      {
        fov: 60,
        near: 0.1,
        far: 2000,
        position: new THREE.Vector3(0, 50, 100)
      }
    );

    this.scene = components.scene;
    this.camera = components.camera;
    this.renderer = components.renderer;

    // Додавання зірок на фон
    this.createStarField();

    // Додавання освітлення
    this.setupLighting();

    // Налаштування контролів (імітація OrbitControls)
    this.setupControls();

    // Обробники подій
    this.setupEventListeners();

    // Запуск анімації
    this.animate();
  }

  private createStarField(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Directional light (головне сонце галактики)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 100, 0);
    this.scene.add(directionalLight);
  }

  private setupControls(): void {
    // Простий контроль камери без OrbitControls
    this.camera.lookAt(0, 0, 0);
  }

  private setupEventListeners(): void {
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private createGalaxyFromPlanets(planets: Planet[]): void {
    // Створення зіркових систем на основі реальних планет
    const systemNames = ['Core Worlds', 'Inner Rim', 'Mid Rim', 'Outer Rim', 'Unknown Regions'];
    
    planets.forEach((planet, index) => {
      const systemIndex = index % systemNames.length;
      const systemName = systemNames[systemIndex];
      
      // Позиція планети в галактиці
      const angle = (index / planets.length) * Math.PI * 2;
      const radius = 20 + (systemIndex * 15);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 10;

      const planet3D = this.createPlanet3D(planet, new THREE.Vector3(x, y, z), systemName, index);
      this.planets.push(planet3D);
    });

    // Створення зірок для систем
    this.createSystemStars();
  }

  private createPlanet3D(planetData: Planet, position: THREE.Vector3, system: string, index: number): Planet3D {
    // Визначення розміру планети на основі діаметра
    let radius = 1;
    if (planetData.diameter && planetData.diameter !== 'unknown') {
      const diameter = parseInt(planetData.diameter.replace(/,/g, ''));
      radius = Math.max(0.5, Math.min(3, diameter / 5000)); // Масштабування
    }

    // Визначення кольору на основі клімату
    let color = 0x888888; // За замовчуванням
    if (planetData.climate.includes('desert')) color = 0xdaa520;
    else if (planetData.climate.includes('temperate')) color = 0x228b22;
    else if (planetData.climate.includes('frozen')) color = 0x87ceeb;
    else if (planetData.climate.includes('tropical')) color = 0x32cd32;
    else if (planetData.terrain.includes('ocean')) color = 0x4169e1;
    else if (planetData.terrain.includes('mountain')) color = 0x696969;

    // Створення меша планети
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshPhongMaterial({ 
      color,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData = { type: 'planet', planetId: index };

    // Додавання до сцени
    this.scene.add(mesh);

    // Анімація обертання
    this.animationService.createRotationAnimation(`planet-${index}`, mesh, 'y', 0.2);

    return {
      id: index,
      name: planetData.name,
      position,
      mesh,
      data: planetData,
      system,
      isUnlocked: index < 5 // Перші 5 планет розблоковані
    };
  }

  private createSystemStars(): void {
    const systemPositions = new Map<string, THREE.Vector3>();
    
    // Групування планет по системах
    this.planets.forEach(planet => {
      if (!systemPositions.has(planet.system)) {
        systemPositions.set(planet.system, new THREE.Vector3());
      }
      const systemPos = systemPositions.get(planet.system)!;
      systemPos.add(planet.position);
    });

    // Створення зірок для кожної системи
    systemPositions.forEach((totalPos, systemName) => {
      const planetCount = this.planets.filter(p => p.system === systemName).length;
      const avgPos = totalPos.divideScalar(planetCount);
      
      // Створення зірки
      const starGeometry = new THREE.SphereGeometry(2, 16, 16);
      const starMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
      });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.copy(avgPos);
      this.scene.add(star);

      // Ефект світіння
      const glowGeometry = new THREE.SphereGeometry(3, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(avgPos);
      this.scene.add(glow);

      // Анімація пульсації
      this.animationService.createPulseAnimation(`star-${systemName}`, glow, 0.8, 1.2, 2000);
    });
  }

  private createMockGalaxy(): void {
    // Fallback - створення тестової галактики
    const mockPlanets: Planet[] = [
      { name: 'Tatooine', climate: 'desert', terrain: 'desert', population: '200000', diameter: '10465' } as Planet,
      { name: 'Alderaan', climate: 'temperate', terrain: 'grasslands', population: '2000000000', diameter: '12500' } as Planet,
      { name: 'Hoth', climate: 'frozen', terrain: 'tundra', population: 'unknown', diameter: '7200' } as Planet
    ];
    
    this.createGalaxyFromPlanets(mockPlanets);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Автоматичне обертання камери
    if (this.autoRotate) {
      const time = Date.now() * 0.0005;
      this.camera.position.x = Math.cos(time) * 100;
      this.camera.position.z = Math.sin(time) * 100;
      this.camera.lookAt(0, 0, 0);
    }

    // Оновлення анімацій
    this.animationService.update();

    this.renderer.render(this.scene, this.camera);
  };

  private onMouseClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData['type'] === 'planet') {
        const planetId = object.userData['planetId'];
        this.selectedPlanet = this.planets[planetId];
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    // Можна додати hover ефекти
  }

  resetCamera(): void {
    this.camera.position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);
  }

  toggleAutoRotate(): void {
    this.autoRotate = !this.autoRotate;
  }

  toggleLabels(): void {
    this.showLabels = !this.showLabels;
    // TODO: Додати/приховати текстові лейбли
  }

  visitPlanet(planet: Planet3D): void {
    if (planet.isUnlocked) {
      this.router.navigate(['/game/exploration/planet', planet.id]);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.threeService.onWindowResize('galaxy-map', this.containerRef);
  }

  private cleanup(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.threeService.disposeScene('galaxy-map');
    this.animationService.disposeAll();
  }
}
