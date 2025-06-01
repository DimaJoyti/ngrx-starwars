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
import * as THREE from 'three';
import { ThreeService, SceneConfig, CameraConfig } from './three.service';
import { PhysicsService, PhysicsConfig } from './physics.service';
import { AnimationService } from './animation.service';
import { ModelLoaderService } from './model-loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-base-three',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #threeContainer 
      class="three-container"
      [style.width.px]="width"
      [style.height.px]="height">
      
      <!-- Loading overlay -->
      <div 
        *ngIf="isLoading" 
        class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">Завантаження 3D сцени...</div>
        <div *ngIf="loadProgress.total > 0" class="loading-progress">
          {{ loadProgress.percentage.toFixed(0) }}%
        </div>
      </div>

      <!-- Controls overlay -->
      <div class="controls-overlay" *ngIf="showControls">
        <button (click)="resetCamera()" class="control-btn">
          🎯 Скинути камеру
        </button>
        <button (click)="toggleWireframe()" class="control-btn">
          📐 Каркас
        </button>
        <button (click)="toggleStats()" class="control-btn">
          📊 Статистика
        </button>
      </div>

      <!-- Stats overlay -->
      <div *ngIf="showStatsOverlay" class="stats-overlay">
        <div>FPS: {{ stats.fps }}</div>
        <div>Об'єкти: {{ stats.objects }}</div>
        <div>Трикутники: {{ stats.triangles }}</div>
      </div>
    </div>
  `,
  styles: [`
    .three-container {
      position: relative;
      overflow: hidden;
      background: #000;
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
      z-index: 1000;
      color: white;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #333;
      border-top: 4px solid #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 16px;
      margin-bottom: 8px;
    }

    .loading-progress {
      font-size: 14px;
      opacity: 0.8;
    }

    .controls-overlay {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 100;
    }

    .control-btn {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: 1px solid #333;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.2s;
    }

    .control-btn:hover {
      background: rgba(0, 0, 0, 0.9);
    }

    .stats-overlay {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      z-index: 100;
    }

    .stats-overlay div {
      margin-bottom: 4px;
    }
  `]
})
export class BaseThreeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

  @Input() width: number = 800;
  @Input() height: number = 600;
  @Input() sceneId: string = 'default';
  @Input() sceneConfig: SceneConfig = {};
  @Input() cameraConfig: CameraConfig = {};
  @Input() physicsConfig: PhysicsConfig = {};
  @Input() enablePhysics: boolean = false;
  @Input() showControls: boolean = true;
  @Input() autoStart: boolean = true;

  // 3D об'єкти
  protected scene!: THREE.Scene;
  protected camera!: THREE.PerspectiveCamera;
  protected renderer!: THREE.WebGLRenderer;

  // Стан
  isLoading = false;
  loadProgress = { loaded: 0, total: 0, percentage: 0 };
  showStatsOverlay = false;
  stats = { fps: 0, objects: 0, triangles: 0 };

  // Підписки
  private subscriptions: Subscription[] = [];
  private lastTime = 0;
  private frameCount = 0;

  constructor(
    protected threeService: ThreeService,
    protected physicsService: PhysicsService,
    protected animationService: AnimationService,
    protected modelLoader: ModelLoaderService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    if (this.autoStart) {
      this.initializeScene();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Налаштування підписок
   */
  private setupSubscriptions(): void {
    // Підписка на стан завантаження
    this.subscriptions.push(
      this.modelLoader.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    // Підписка на прогрес завантаження
    this.subscriptions.push(
      this.modelLoader.loadProgress$.subscribe(progress => {
        this.loadProgress = progress;
      })
    );
  }

  /**
   * Ініціалізація 3D сцени
   */
  protected initializeScene(): void {
    // Створення основних компонентів
    const components = this.threeService.createScene(
      this.sceneId,
      this.containerRef,
      this.sceneConfig,
      this.cameraConfig
    );

    this.scene = components.scene;
    this.camera = components.camera;
    this.renderer = components.renderer;

    // Додавання базового освітлення
    this.threeService.addBasicLighting(this.sceneId);

    // Ініціалізація фізики якщо потрібно
    if (this.enablePhysics) {
      this.physicsService.createWorld(this.sceneId, this.physicsConfig);
    }

    // Налаштування сцени (переопределяється в дочірніх компонентах)
    this.setupScene();

    // Запуск циклу рендерингу
    this.threeService.startRenderLoop(this.sceneId, () => {
      this.updateScene();
      this.updateStats();
    });
  }

  /**
   * Налаштування сцени (переопределяється в дочірніх компонентах)
   */
  protected setupScene(): void {
    // Базова реалізація - додавання простого куба
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // Анімація обертання
    this.animationService.createRotationAnimation('cube', cube, 'y', 0.5);
  }

  /**
   * Оновлення сцени (викликається кожен кадр)
   */
  protected updateScene(): void {
    // Оновлення анімацій
    this.animationService.update();

    // Оновлення фізики
    if (this.enablePhysics) {
      this.physicsService.stepWorld(this.sceneId, 1/60);
    }
  }

  /**
   * Оновлення статистики
   */
  private updateStats(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.stats.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.stats.objects = this.scene.children.length;
      this.stats.triangles = this.renderer.info.render.triangles;
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Обробка зміни розміру вікна
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.threeService.onWindowResize(this.sceneId, this.containerRef);
  }

  /**
   * Скидання позиції камери
   */
  resetCamera(): void {
    if (this.camera) {
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);
    }
  }

  /**
   * Перемикання режиму каркасу
   */
  toggleWireframe(): void {
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.Material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => {
            if ('wireframe' in material) {
              material.wireframe = !material.wireframe;
            }
          });
        } else {
          if ('wireframe' in object.material) {
            object.material.wireframe = !object.material.wireframe;
          }
        }
      }
    });
  }

  /**
   * Перемикання відображення статистики
   */
  toggleStats(): void {
    this.showStatsOverlay = !this.showStatsOverlay;
  }

  /**
   * Очищення ресурсів
   */
  private cleanup(): void {
    // Відписка від всіх підписок
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    // Очищення 3D ресурсів
    this.threeService.disposeScene(this.sceneId);
    
    if (this.enablePhysics) {
      this.physicsService.disposeWorld(this.sceneId);
    }

    this.animationService.disposeAll();
  }
}
