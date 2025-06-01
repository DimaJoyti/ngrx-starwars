import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnInit, 
  OnDestroy, 
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-simple-three',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="three-container">
      <div #threeContainer class="three-canvas" [style.width.px]="800" [style.height.px]="600">
      </div>
      <div class="controls">
        <button (click)="resetCamera()" class="control-btn">🎯 Скинути камеру</button>
        <button (click)="toggleWireframe()" class="control-btn">📐 Каркас</button>
        <div class="info">
          <div>FPS: {{ fps }}</div>
          <div>Об'єкти: {{ objectCount }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .three-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .three-canvas {
      border: 2px solid #333;
      border-radius: 8px;
      overflow: hidden;
      background: #000;
    }

    .controls {
      margin-top: 16px;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .control-btn {
      padding: 8px 16px;
      background: #333;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .control-btn:hover {
      background: #555;
    }

    .info {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }

    .info div {
      margin-bottom: 4px;
    }
  `]
})
export class SimpleThreeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private animationId!: number;

  fps = 0;
  objectCount = 0;
  private lastTime = 0;
  private frameCount = 0;

  ngOnInit(): void {
    console.log('SimpleThreeComponent initialized');
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  private initThree(): void {
    const container = this.containerRef.nativeElement;
    
    // Сцена
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);

    // Камера
    this.camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 5;

    // Рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Освітлення
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    // Створення простого куба
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Додавання кількох об'єктів для тестування
    for (let i = 0; i < 5; i++) {
      const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({ 
        color: Math.random() * 0xffffff 
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      sphere.position.x = (Math.random() - 0.5) * 10;
      sphere.position.y = (Math.random() - 0.5) * 10;
      sphere.position.z = (Math.random() - 0.5) * 10;
      
      this.scene.add(sphere);
    }

    this.updateObjectCount();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Обертання куба
    if (this.cube) {
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
    }

    // Обертання сфер
    this.scene.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child !== this.cube) {
        child.rotation.x += 0.005 * (index + 1);
        child.rotation.y += 0.005 * (index + 1);
      }
    });

    this.renderer.render(this.scene, this.camera);
    this.updateFPS();
  };

  private updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  private updateObjectCount(): void {
    this.objectCount = this.scene.children.length;
  }

  resetCamera(): void {
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
  }

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

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (this.camera && this.renderer && this.containerRef) {
      const container = this.containerRef.nativeElement;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
  }
}
