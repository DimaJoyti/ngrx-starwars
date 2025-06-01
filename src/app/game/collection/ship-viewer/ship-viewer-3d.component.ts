import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ThreeService } from '../../../shared/three/three.service';
import { AnimationService } from '../../../shared/three/animation.service';
import { Starship3DService, Starship3D, StarshipCustomization } from '../../../shared/three/starship-3d.service';
import { Starship } from '../../../characters/models/starship';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ship-viewer-3d',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatSliderModule,
    MatSelectModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div class="ship-viewer-container">
      <!-- 3D Canvas -->
      <div class="viewer-main">
        <div #shipContainer class="ship-canvas" 
             [style.width.px]="800" 
             [style.height.px]="600">
        </div>

        <!-- Canvas Controls -->
        <div class="canvas-controls">
          <button mat-mini-fab (click)="resetCamera()" matTooltip="Скинути камеру">
            <mat-icon>center_focus_strong</mat-icon>
          </button>
          <button mat-mini-fab (click)="toggleAutoRotate()" 
                  [color]="autoRotate ? 'accent' : 'primary'"
                  matTooltip="Автообертання">
            <mat-icon>{{ autoRotate ? 'pause' : 'play_arrow' }}</mat-icon>
          </button>
          <button mat-mini-fab (click)="toggleWireframe()" matTooltip="Каркас">
            <mat-icon>grid_on</mat-icon>
          </button>
          <button mat-mini-fab (click)="takeScreenshot()" matTooltip="Скріншот">
            <mat-icon>camera_alt</mat-icon>
          </button>
        </div>

        <!-- Loading -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Завантаження 3D моделі...</p>
        </div>
      </div>

      <!-- Side Panel -->
      <div class="side-panel">
        <!-- Ship Info -->
        <mat-card class="info-card" *ngIf="currentStarship3D">
          <mat-card-header>
            <mat-card-title>{{ currentStarship3D.name }}</mat-card-title>
            <mat-card-subtitle>{{ currentStarship3D.data.starship_class }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="ship-specs">
              <div class="spec-item">
                <strong>Модель:</strong> {{ currentStarship3D.data.model }}
              </div>
              <div class="spec-item">
                <strong>Виробник:</strong> {{ currentStarship3D.data.manufacturer }}
              </div>
              <div class="spec-item">
                <strong>Довжина:</strong> {{ currentStarship3D.data.length }} м
              </div>
              <div class="spec-item">
                <strong>Швидкість:</strong> {{ currentStarship3D.data.max_atmosphering_speed }} км/год
              </div>
              <div class="spec-item">
                <strong>Екіпаж:</strong> {{ currentStarship3D.data.crew }}
              </div>
              <div class="spec-item">
                <strong>Пасажири:</strong> {{ currentStarship3D.data.passengers }}
              </div>
            </div>

            <!-- Stats -->
            <div class="stats-section">
              <h4>Характеристики</h4>
              <div class="stat-bar">
                <span>Вогнева міць</span>
                <div class="bar">
                  <div class="fill" [style.width.%]="currentStarship3D.stats.firepower"></div>
                </div>
                <span>{{ currentStarship3D.stats.firepower }}/100</span>
              </div>
              <div class="stat-bar">
                <span>Щити</span>
                <div class="bar">
                  <div class="fill" [style.width.%]="currentStarship3D.stats.shields"></div>
                </div>
                <span>{{ currentStarship3D.stats.shields }}/100</span>
              </div>
              <div class="stat-bar">
                <span>Маневреність</span>
                <div class="bar">
                  <div class="fill" [style.width.%]="currentStarship3D.stats.maneuverability"></div>
                </div>
                <span>{{ currentStarship3D.stats.maneuverability }}/100</span>
              </div>
              <div class="stat-bar">
                <span>Швидкість</span>
                <div class="bar">
                  <div class="fill" [style.width.%]="currentStarship3D.stats.speed"></div>
                </div>
                <span>{{ currentStarship3D.stats.speed }}/100</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Customization Panel -->
        <mat-card class="customization-card" *ngIf="currentStarship3D && showCustomization">
          <mat-card-header>
            <mat-card-title>Кастомізація</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Color Selection -->
            <div class="customization-section">
              <h4>Кольори</h4>
              <div class="color-picker">
                <label>Основний колір:</label>
                <input type="color" 
                       [value]="getColorHex(customization.primaryColor)"
                       (change)="onPrimaryColorChange($event)">
              </div>
              <div class="color-picker">
                <label>Додатковий колір:</label>
                <input type="color" 
                       [value]="getColorHex(customization.secondaryColor)"
                       (change)="onSecondaryColorChange($event)">
              </div>
              <div class="color-picker">
                <label>Світло двигунів:</label>
                <input type="color" 
                       [value]="getColorHex(customization.engineGlow)"
                       (change)="onEngineColorChange($event)">
              </div>
            </div>

            <!-- Weapon Type -->
            <div class="customization-section">
              <h4>Тип зброї</h4>
              <mat-select [(value)]="customization.weaponType" 
                         (selectionChange)="onWeaponTypeChange()">
                <mat-option value="laser">Лазери</mat-option>
                <mat-option value="ion">Іонні гармати</mat-option>
                <mat-option value="turbolaser">Турболазери</mat-option>
              </mat-select>
            </div>

            <!-- Effects -->
            <div class="customization-section">
              <h4>Ефекти</h4>
              <div class="effect-toggle">
                <label>
                  <input type="checkbox" 
                         [(ngModel)]="customization.shieldEffect"
                         (change)="onEffectChange()">
                  Ефект щитів
                </label>
              </div>
              <div class="effect-toggle">
                <label>
                  <input type="checkbox" 
                         [(ngModel)]="customization.engineTrails"
                         (change)="onEffectChange()">
                  Сліди двигунів
                </label>
              </div>
            </div>

            <div class="customization-actions">
              <button mat-raised-button color="primary" (click)="applyCustomization()">
                Застосувати
              </button>
              <button mat-button (click)="resetCustomization()">
                Скинути
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions -->
        <div class="action-buttons">
          <button mat-raised-button color="primary" 
                  (click)="toggleCustomization()"
                  [disabled]="!currentStarship3D">
            <mat-icon>palette</mat-icon>
            {{ showCustomization ? 'Сховати' : 'Кастомізація' }}
          </button>
          
          <button mat-raised-button color="accent" 
                  (click)="addToFleet()"
                  [disabled]="!currentStarship3D">
            <mat-icon>add</mat-icon>
            Додати до флоту
          </button>
          
          <button mat-raised-button 
                  (click)="compareShips()"
                  [disabled]="!currentStarship3D">
            <mat-icon>compare</mat-icon>
            Порівняти
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ship-viewer-container {
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #0f0f23 0%, #000000 100%);
    }

    .viewer-main {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ship-canvas {
      border: 2px solid #ffd700;
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      background: radial-gradient(ellipse at center, #1a1a2e 0%, #000000 100%);
    }

    .canvas-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .canvas-controls button {
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

    .side-panel {
      width: 400px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.9);
      border-left: 1px solid #ffd700;
      overflow-y: auto;
    }

    .info-card, .customization-card {
      margin-bottom: 20px;
      background: rgba(26, 26, 46, 0.9);
      color: white;
      border: 1px solid #ffd700;
    }

    .info-card mat-card-title {
      color: #ffd700;
    }

    .ship-specs .spec-item {
      margin: 8px 0;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    }

    .ship-specs strong {
      color: #ffd700;
    }

    .stats-section {
      margin-top: 16px;
    }

    .stats-section h4 {
      color: #ffd700;
      margin-bottom: 12px;
    }

    .stat-bar {
      display: flex;
      align-items: center;
      margin: 8px 0;
      gap: 8px;
    }

    .stat-bar span:first-child {
      min-width: 80px;
      font-size: 12px;
    }

    .stat-bar span:last-child {
      min-width: 50px;
      font-size: 12px;
      text-align: right;
    }

    .bar {
      flex: 1;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: linear-gradient(90deg, #ff4444 0%, #ffaa00 50%, #00ff00 100%);
      transition: width 0.3s ease;
    }

    .customization-section {
      margin: 16px 0;
    }

    .customization-section h4 {
      color: #ffd700;
      margin-bottom: 8px;
    }

    .color-picker {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 8px 0;
    }

    .color-picker label {
      font-size: 14px;
    }

    .color-picker input[type="color"] {
      width: 40px;
      height: 30px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .effect-toggle {
      margin: 8px 0;
    }

    .effect-toggle label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .customization-actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-buttons button {
      width: 100%;
    }
  `]
})
export class ShipViewer3DComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('shipContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;
  
  @Input() starshipData: Starship | null = null;
  @Output() shipSelected = new EventEmitter<Starship3D>();
  @Output() customizationChanged = new EventEmitter<StarshipCustomization>();

  // 3D об'єкти
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;

  // Стан
  currentStarship3D: Starship3D | null = null;
  isLoading = false;
  autoRotate = true;
  showCustomization = false;
  customization: StarshipCustomization = {
    primaryColor: 0x888888,
    secondaryColor: 0x666666,
    engineGlow: 0x00aaff,
    weaponType: 'laser',
    shieldEffect: true,
    engineTrails: true
  };

  // Підписки
  private subscriptions: Subscription[] = [];

  constructor(
    private threeService: ThreeService,
    private animationService: AnimationService,
    private starship3DService: Starship3DService
  ) {}

  ngOnInit(): void {
    if (this.starshipData) {
      this.loadStarship(this.starshipData);
    }
  }

  ngAfterViewInit(): void {
    this.initializeViewer();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Ініціалізація 3D переглядача
   */
  private initializeViewer(): void {
    const components = this.threeService.createScene(
      'ship-viewer',
      this.containerRef,
      {
        backgroundColor: 0x000011,
        enableShadows: true
      },
      {
        fov: 45,
        near: 0.1,
        far: 1000,
        position: new THREE.Vector3(0, 0, 10)
      }
    );

    this.scene = components.scene;
    this.camera = components.camera;
    this.renderer = components.renderer;

    // Додавання освітлення
    this.setupLighting();

    // Запуск анімації
    this.animate();
  }

  /**
   * Налаштування освітлення
   */
  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    fillLight.position.set(-5, 0, 5);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 0, -5);
    this.scene.add(rimLight);
  }

  /**
   * Завантаження корабля
   */
  loadStarship(starshipData: Starship): void {
    this.isLoading = true;
    this.starshipData = starshipData;

    this.subscriptions.push(
      this.starship3DService.createStarship3D(starshipData).subscribe({
        next: (starship3D) => {
          this.displayStarship(starship3D);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading starship 3D model:', error);
          this.isLoading = false;
        }
      })
    );
  }

  /**
   * Відображення корабля в сцені
   */
  private displayStarship(starship3D: Starship3D): void {
    // Очищення попереднього корабля
    if (this.currentStarship3D) {
      this.scene.remove(this.currentStarship3D.model);
    }

    this.currentStarship3D = starship3D;
    this.customization = { ...starship3D.customization };

    // Додавання до сцени
    this.scene.add(starship3D.model);

    // Центрування камери
    this.centerCameraOnShip();

    // Емітування події
    this.shipSelected.emit(starship3D);
  }

  /**
   * Центрування камери на кораблі
   */
  private centerCameraOnShip(): void {
    if (!this.currentStarship3D) return;

    const box = new THREE.Box3().setFromObject(this.currentStarship3D.model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    this.camera.position.set(0, 0, maxDim * 2);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Анімаційний цикл
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Автоматичне обертання
    if (this.autoRotate && this.currentStarship3D) {
      this.currentStarship3D.model.rotation.y += 0.005;
    }

    // Оновлення анімацій
    this.animationService.update();

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Скидання камери
   */
  resetCamera(): void {
    this.centerCameraOnShip();
  }

  /**
   * Перемикання автообертання
   */
  toggleAutoRotate(): void {
    this.autoRotate = !this.autoRotate;
  }

  /**
   * Перемикання каркасного режиму
   */
  toggleWireframe(): void {
    if (!this.currentStarship3D) return;

    this.currentStarship3D.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        if ('wireframe' in child.material) {
          child.material.wireframe = !child.material.wireframe;
        }
      }
    });
  }

  /**
   * Створення скріншота
   */
  takeScreenshot(): void {
    const canvas = this.renderer.domElement;
    const link = document.createElement('a');
    link.download = `${this.currentStarship3D?.name || 'starship'}-screenshot.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  /**
   * Перемикання панелі кастомізації
   */
  toggleCustomization(): void {
    this.showCustomization = !this.showCustomization;
  }

  /**
   * Зміна основного кольору
   */
  onPrimaryColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.customization.primaryColor = parseInt(target.value.replace('#', '0x'));
  }

  /**
   * Зміна додаткового кольору
   */
  onSecondaryColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.customization.secondaryColor = parseInt(target.value.replace('#', '0x'));
  }

  /**
   * Зміна кольору двигунів
   */
  onEngineColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.customization.engineGlow = parseInt(target.value.replace('#', '0x'));
  }

  /**
   * Зміна типу зброї
   */
  onWeaponTypeChange(): void {
    // Логіка зміни типу зброї
  }

  /**
   * Зміна ефектів
   */
  onEffectChange(): void {
    // Логіка зміни ефектів
  }

  /**
   * Застосування кастомізації
   */
  applyCustomization(): void {
    if (!this.currentStarship3D) return;

    // Застосування змін до моделі
    // TODO: Реалізувати застосування кастомізації

    this.customizationChanged.emit(this.customization);
  }

  /**
   * Скидання кастомізації
   */
  resetCustomization(): void {
    if (!this.currentStarship3D) return;
    
    this.customization = { ...this.currentStarship3D.customization };
    this.applyCustomization();
  }

  /**
   * Конвертація кольору в hex
   */
  getColorHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  /**
   * Додавання до флоту
   */
  addToFleet(): void {
    if (this.currentStarship3D) {
      // TODO: Реалізувати додавання до флоту
      console.log('Adding to fleet:', this.currentStarship3D.name);
    }
  }

  /**
   * Порівняння кораблів
   */
  compareShips(): void {
    if (this.currentStarship3D) {
      // TODO: Реалізувати порівняння кораблів
      console.log('Comparing ships:', this.currentStarship3D.name);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.threeService.onWindowResize('ship-viewer', this.containerRef);
  }

  /**
   * Очищення ресурсів
   */
  private cleanup(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.threeService.disposeScene('ship-viewer');
    this.animationService.disposeAll();
  }
}
