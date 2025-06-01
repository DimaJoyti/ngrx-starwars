import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
  renderTime: number;
}

export interface LODLevel {
  distance: number;
  model: THREE.Object3D;
  triangleCount: number;
}

export interface OptimizedModel {
  id: string;
  lodLevels: LODLevel[];
  boundingBox: THREE.Box3;
  isVisible: boolean;
  lastUsed: number;
}

@Injectable({
  providedIn: 'root'
})
export class Optimized3DRendererService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  
  // Performance optimization
  private performanceMetrics$ = new BehaviorSubject<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    drawCalls: 0,
    triangles: 0,
    memoryUsage: 0,
    renderTime: 0
  });
  
  // Model management
  private modelCache = new Map<string, OptimizedModel>();
  private loadingQueue: string[] = [];
  private maxCacheSize = 50; // Maximum models in cache
  
  // Loaders with optimization
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private ktx2Loader: KTX2Loader;
  
  // Frustum culling
  private frustum = new THREE.Frustum();
  private cameraMatrix = new THREE.Matrix4();
  
  // Performance monitoring
  private frameCount = 0;
  private lastTime = performance.now();
  private renderStartTime = 0;
  
  // Optimization settings
  private optimizationSettings = {
    enableFrustumCulling: true,
    enableLOD: true,
    enableInstancing: true,
    maxDrawCalls: 1000,
    targetFPS: 60,
    adaptiveQuality: true,
    shadowMapSize: 1024,
    antialias: true
  };

  constructor() {
    this.initializeLoaders();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize optimized 3D scene
   */
  initializeOptimizedScene(container: HTMLElement): void {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera with optimized settings
    this.camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      10000
    );
    
    // Create optimized renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.optimizationSettings.antialias,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    
    this.setupRendererOptimizations();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    
    // Start optimized render loop
    this.startOptimizedRenderLoop();
  }

  /**
   * Setup renderer optimizations
   */
  private setupRendererOptimizations(): void {
    if (!this.renderer) return;

    // Enable optimizations
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false; // Manual shadow updates
    
    // Set shadow map size based on performance
    this.renderer.shadowMap.setSize(
      this.optimizationSettings.shadowMapSize,
      this.optimizationSettings.shadowMapSize
    );
    
    // Enable tone mapping for better visuals
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // Enable output encoding
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Optimize rendering
    this.renderer.sortObjects = true;
    this.renderer.autoClear = true;
    this.renderer.autoClearColor = true;
    this.renderer.autoClearDepth = true;
    this.renderer.autoClearStencil = false;
  }

  /**
   * Initialize optimized loaders
   */
  private initializeLoaders(): void {
    // Setup DRACO loader for compressed geometry
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/libs/draco/');
    this.dracoLoader.preload();
    
    // Setup KTX2 loader for compressed textures
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/libs/basis/');
    
    // Setup GLTF loader with compression support
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.gltfLoader.setKTX2Loader(this.ktx2Loader);
  }

  // ===== MODEL LOADING AND MANAGEMENT =====

  /**
   * Load optimized model with LOD levels
   */
  loadOptimizedModel(modelPath: string, generateLOD: boolean = true): Promise<OptimizedModel> {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.modelCache.has(modelPath)) {
        const cached = this.modelCache.get(modelPath)!;
        cached.lastUsed = Date.now();
        resolve(cached);
        return;
      }

      // Add to loading queue
      this.loadingQueue.push(modelPath);

      this.gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          this.optimizeModel(model);
          
          const optimizedModel: OptimizedModel = {
            id: modelPath,
            lodLevels: generateLOD ? this.generateLODLevels(model) : [
              { distance: 0, model, triangleCount: this.getTriangleCount(model) }
            ],
            boundingBox: new THREE.Box3().setFromObject(model),
            isVisible: true,
            lastUsed: Date.now()
          };

          // Add to cache
          this.addToCache(modelPath, optimizedModel);
          
          // Remove from loading queue
          const index = this.loadingQueue.indexOf(modelPath);
          if (index > -1) {
            this.loadingQueue.splice(index, 1);
          }

          resolve(optimizedModel);
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Optimize individual model
   */
  private optimizeModel(model: THREE.Object3D): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
          
          // Merge vertices if possible
          if (child.geometry.index === null) {
            child.geometry = child.geometry.toNonIndexed();
          }
        }

        // Optimize materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(child.material);
          }
        }

        // Enable frustum culling
        child.frustumCulled = this.optimizationSettings.enableFrustumCulling;
        
        // Enable matrix auto update only when needed
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    });
  }

  /**
   * Optimize material settings
   */
  private optimizeMaterial(material: THREE.Material): void {
    // Enable side culling for performance
    material.side = THREE.FrontSide;
    
    // Optimize shadow settings
    material.shadowSide = THREE.FrontSide;
    
    // Enable depth testing
    material.depthTest = true;
    material.depthWrite = true;
    
    // Optimize transparency
    if (material.transparent) {
      material.alphaTest = 0.1; // Discard pixels below threshold
    }
  }

  /**
   * Generate LOD levels for model
   */
  private generateLODLevels(originalModel: THREE.Object3D): LODLevel[] {
    const lodLevels: LODLevel[] = [];
    
    // Original high-quality model
    lodLevels.push({
      distance: 0,
      model: originalModel.clone(),
      triangleCount: this.getTriangleCount(originalModel)
    });

    // Medium quality (50% triangles)
    const mediumLOD = this.createReducedModel(originalModel, 0.5);
    lodLevels.push({
      distance: 100,
      model: mediumLOD,
      triangleCount: this.getTriangleCount(mediumLOD)
    });

    // Low quality (25% triangles)
    const lowLOD = this.createReducedModel(originalModel, 0.25);
    lodLevels.push({
      distance: 500,
      model: lowLOD,
      triangleCount: this.getTriangleCount(lowLOD)
    });

    // Very low quality (10% triangles)
    const veryLowLOD = this.createReducedModel(originalModel, 0.1);
    lodLevels.push({
      distance: 1000,
      model: veryLowLOD,
      triangleCount: this.getTriangleCount(veryLowLOD)
    });

    return lodLevels;
  }

  /**
   * Create reduced quality model
   */
  private createReducedModel(originalModel: THREE.Object3D, quality: number): THREE.Object3D {
    const reducedModel = originalModel.clone();
    
    reducedModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        // Simple geometry reduction (in real implementation, use proper decimation)
        const geometry = child.geometry.clone();
        
        // Reduce vertex count by sampling
        if (geometry.attributes.position) {
          const positions = geometry.attributes.position.array;
          const reducedPositions = new Float32Array(Math.floor(positions.length * quality));
          
          for (let i = 0; i < reducedPositions.length; i += 3) {
            const sourceIndex = Math.floor((i / 3) / quality) * 3;
            reducedPositions[i] = positions[sourceIndex];
            reducedPositions[i + 1] = positions[sourceIndex + 1];
            reducedPositions[i + 2] = positions[sourceIndex + 2];
          }
          
          geometry.setAttribute('position', new THREE.BufferAttribute(reducedPositions, 3));
        }
        
        child.geometry = geometry;
      }
    });

    return reducedModel;
  }

  // ===== RENDERING OPTIMIZATION =====

  /**
   * Start optimized render loop
   */
  private startOptimizedRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      
      this.renderStartTime = performance.now();
      
      // Update performance metrics
      this.updatePerformanceMetrics();
      
      // Perform frustum culling
      if (this.optimizationSettings.enableFrustumCulling) {
        this.performFrustumCulling();
      }
      
      // Update LOD levels
      if (this.optimizationSettings.enableLOD) {
        this.updateLODLevels();
      }
      
      // Adaptive quality adjustment
      if (this.optimizationSettings.adaptiveQuality) {
        this.adjustQualityBasedOnPerformance();
      }
      
      // Render scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      
      // Update render time metric
      const renderTime = performance.now() - this.renderStartTime;
      const metrics = this.performanceMetrics$.value;
      this.performanceMetrics$.next({
        ...metrics,
        renderTime
      });
    };
    
    animate();
  }

  /**
   * Perform frustum culling
   */
  private performFrustumCulling(): void {
    if (!this.camera || !this.scene) return;

    this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Check if object is in frustum
        object.visible = this.frustum.intersectsObject(object);
      }
    });
  }

  /**
   * Update LOD levels based on distance
   */
  private updateLODLevels(): void {
    if (!this.camera) return;

    this.modelCache.forEach((optimizedModel) => {
      const distance = this.camera!.position.distanceTo(
        optimizedModel.boundingBox.getCenter(new THREE.Vector3())
      );

      // Find appropriate LOD level
      let selectedLOD = optimizedModel.lodLevels[0];
      for (const lod of optimizedModel.lodLevels) {
        if (distance >= lod.distance) {
          selectedLOD = lod;
        } else {
          break;
        }
      }

      // Update visibility of LOD levels
      optimizedModel.lodLevels.forEach((lod, index) => {
        lod.model.visible = lod === selectedLOD;
      });
    });
  }

  /**
   * Adjust quality based on performance
   */
  private adjustQualityBasedOnPerformance(): void {
    const metrics = this.performanceMetrics$.value;
    
    if (metrics.fps < this.optimizationSettings.targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.optimizationSettings.shadowMapSize = Math.max(512, this.optimizationSettings.shadowMapSize * 0.8);
      this.optimizationSettings.antialias = false;
    } else if (metrics.fps > this.optimizationSettings.targetFPS * 1.1) {
      // Performance is good, can increase quality
      this.optimizationSettings.shadowMapSize = Math.min(2048, this.optimizationSettings.shadowMapSize * 1.1);
      this.optimizationSettings.antialias = true;
    }
  }

  // ===== PERFORMANCE MONITORING =====

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    
    if (deltaTime >= 1000) { // Update every second
      const fps = Math.round((this.frameCount * 1000) / deltaTime);
      const frameTime = deltaTime / this.frameCount;
      
      const metrics: PerformanceMetrics = {
        fps,
        frameTime,
        drawCalls: this.renderer?.info.render.calls || 0,
        triangles: this.renderer?.info.render.triangles || 0,
        memoryUsage: this.getMemoryUsage(),
        renderTime: this.performanceMetrics$.value.renderTime
      };
      
      this.performanceMetrics$.next(metrics);
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Get memory usage estimation
   */
  private getMemoryUsage(): number {
    if (!this.renderer) return 0;
    
    const info = this.renderer.info;
    return info.memory.geometries + info.memory.textures;
  }

  /**
   * Get triangle count for model
   */
  private getTriangleCount(model: THREE.Object3D): number {
    let triangles = 0;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry;
        if (geometry.index) {
          triangles += geometry.index.count / 3;
        } else {
          triangles += geometry.attributes.position.count / 3;
        }
      }
    });
    
    return triangles;
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * Add model to cache with LRU eviction
   */
  private addToCache(id: string, model: OptimizedModel): void {
    // Remove oldest models if cache is full
    if (this.modelCache.size >= this.maxCacheSize) {
      const oldestId = this.findOldestCacheEntry();
      if (oldestId) {
        this.modelCache.delete(oldestId);
      }
    }
    
    this.modelCache.set(id, model);
  }

  /**
   * Find oldest cache entry
   */
  private findOldestCacheEntry(): string | null {
    let oldestId: string | null = null;
    let oldestTime = Date.now();
    
    this.modelCache.forEach((model, id) => {
      if (model.lastUsed < oldestTime) {
        oldestTime = model.lastUsed;
        oldestId = id;
      }
    });
    
    return oldestId;
  }

  // ===== PUBLIC API =====

  getPerformanceMetrics(): Observable<PerformanceMetrics> {
    return this.performanceMetrics$.asObservable();
  }

  updateOptimizationSettings(settings: Partial<typeof this.optimizationSettings>): void {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings };
  }

  clearCache(): void {
    this.modelCache.clear();
  }

  dispose(): void {
    this.clearCache();
    this.dracoLoader.dispose();
    this.ktx2Loader.dispose();
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
