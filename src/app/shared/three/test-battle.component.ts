import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as THREE from 'three';
import { ThreeService } from './three.service';

@Component({
  selector: 'app-test-battle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="test-battle-container">
      <div class="test-main">
        <div #testContainer class="test-canvas"
             [style.width.px]="800"
             [style.height.px]="600">
        </div>
        
        <div class="test-controls">
          <button mat-raised-button color="primary" (click)="addCube()">
            <mat-icon>add</mat-icon>
            Add Cube
          </button>
          <button mat-raised-button color="warn" (click)="reset()">
            <mat-icon>refresh</mat-icon>
            Reset
          </button>
        </div>
        
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Loading Test Battle...</p>
        </div>
      </div>
      
      <div class="test-info">
        <h3>Test Battle Arena</h3>
        <p>Status: {{ status }}</p>
        <p>Cubes: {{ cubeCount }}</p>
        <div class="navigation">
          <button mat-fab color="accent" routerLink="/battle-3d">
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-battle-container {
      height: 100vh;
      background: radial-gradient(ellipse at center, #0f0f23 0%, #000000 100%);
      display: flex;
      overflow: hidden;
    }

    .test-main {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }

    .test-canvas {
      border: 2px solid #ffd700;
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      background: radial-gradient(ellipse at center, #1a1a2e 0%, #000000 100%);
    }

    .test-controls {
      display: flex;
      gap: 12px;
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

    .test-info {
      width: 300px;
      background: rgba(0, 0, 0, 0.9);
      border-left: 1px solid #ffd700;
      padding: 20px;
      color: white;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .test-info h3 {
      color: #ffd700;
      margin: 0;
    }

    .navigation {
      margin-top: auto;
    }
  `]
})
export class TestBattleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('testContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;

  isLoading = true;
  status = 'Initializing...';
  cubeCount = 0;

  constructor(private threeService: ThreeService) {}

  ngOnInit(): void {
    console.log('🧪 TestBattleComponent: ngOnInit started');
    this.status = 'Component initialized';
  }

  ngAfterViewInit(): void {
    console.log('🧪 TestBattleComponent: ngAfterViewInit started');
    this.initializeTest();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeTest(): Promise<void> {
    try {
      console.log('🧪 Starting test initialization...');
      this.status = 'Creating scene...';

      const components = this.threeService.createScene(
        'test-battle',
        this.containerRef,
        {
          backgroundColor: 0x000011,
          enableShadows: true
        },
        {
          fov: 60,
          near: 0.1,
          far: 1000,
          position: new THREE.Vector3(0, 5, 10)
        }
      );

      this.scene = components.scene;
      this.camera = components.camera;
      this.renderer = components.renderer;

      console.log('✅ Scene created successfully');
      this.status = 'Adding lighting...';

      // Add basic lighting
      this.threeService.addBasicLighting('test-battle');

      console.log('✅ Lighting added');
      this.status = 'Creating test objects...';

      // Add a test cube
      this.addCube();

      console.log('✅ Test objects created');
      this.status = 'Starting animation...';

      // Start animation loop
      this.animate();

      this.isLoading = false;
      this.status = 'Ready!';
      console.log('🎉 Test initialization completed successfully!');

    } catch (error) {
      console.error('❌ Error initializing test:', error);
      this.status = `Error: ${error}`;
      this.isLoading = false;
    }
  }

  addCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: Math.random() * 0xffffff 
    });
    const cube = new THREE.Mesh(geometry, material);

    // Random position
    cube.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 10
    );

    // Random rotation
    cube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    cube.castShadow = true;
    cube.receiveShadow = true;

    this.scene.add(cube);
    this.cubeCount++;

    console.log(`🧊 Added cube #${this.cubeCount}`);
  }

  reset(): void {
    // Remove all cubes
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry instanceof THREE.BoxGeometry) {
        objectsToRemove.push(object);
      }
    });

    objectsToRemove.forEach((object) => {
      this.scene.remove(object);
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });

    this.cubeCount = 0;
    console.log('🧹 Reset scene');
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate all cubes
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.geometry instanceof THREE.BoxGeometry) {
        object.rotation.x += 0.01;
        object.rotation.y += 0.01;
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  private cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.threeService.disposeScene('test-battle');
  }
}
