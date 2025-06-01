import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export interface GLTF {
  scene: THREE.Group;
  scenes: THREE.Group[];
  cameras: THREE.Camera[];
  animations: THREE.AnimationClip[];
  asset: any;
}
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ModelLoadOptions {
  scale?: THREE.Vector3;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  castShadow?: boolean;
  receiveShadow?: boolean;
  enableDraco?: boolean;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModelLoaderService {
  private gltfLoader!: GLTFLoader;
  private dracoLoader!: DRACOLoader;
  private fbxLoader!: FBXLoader;
  private objLoader!: OBJLoader;
  private textureLoader!: THREE.TextureLoader;
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();
  
  private progressSubject = new BehaviorSubject<LoadProgress>({ loaded: 0, total: 0, percentage: 0 });
  public loadProgress$: Observable<LoadProgress> = this.progressSubject.asObservable();

  // Кеш для завантажених моделей
  private modelCache = new Map<string, THREE.Object3D>();
  private textureCache = new Map<string, THREE.Texture>();

  constructor() {
    this.initializeLoaders();
  }

  private initializeLoaders(): void {
    // GLTF Loader
    this.gltfLoader = new GLTFLoader();
    
    // DRACO Loader для стиснених моделей
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // FBX Loader
    this.fbxLoader = new FBXLoader();

    // OBJ Loader
    this.objLoader = new OBJLoader();

    // Texture Loader
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Завантажує GLTF/GLB модель
   */
  loadGLTF(url: string, options: ModelLoadOptions = {}): Observable<THREE.Group> {
    // Перевірка кешу
    const cachedModel = this.modelCache.get(url);
    if (cachedModel) {
      return new Observable(observer => {
        const clonedModel = cachedModel.clone();
        this.applyModelOptions(clonedModel, options);
        observer.next(clonedModel as THREE.Group);
        observer.complete();
      });
    }

    this.loadingSubject.next(true);

    return new Observable<THREE.Group>(observer => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          
          // Кешування моделі
          this.modelCache.set(url, model.clone());
          
          // Застосування опцій
          this.applyModelOptions(model, options);
          
          this.loadingSubject.next(false);
          observer.next(model);
          observer.complete();
        },
        (progress) => {
          const loadProgress: LoadProgress = {
            loaded: progress.loaded,
            total: progress.total,
            percentage: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0
          };
          this.progressSubject.next(loadProgress);
        },
        (error) => {
          this.loadingSubject.next(false);
          console.error('Error loading GLTF model:', error);
          observer.error(error);
        }
      );
    });
  }

  /**
   * Завантажує FBX модель
   */
  loadFBX(url: string, options: ModelLoadOptions = {}): Observable<THREE.Group> {
    const cachedModel = this.modelCache.get(url);
    if (cachedModel) {
      return new Observable(observer => {
        const clonedModel = cachedModel.clone();
        this.applyModelOptions(clonedModel, options);
        observer.next(clonedModel as THREE.Group);
        observer.complete();
      });
    }

    this.loadingSubject.next(true);

    return new Observable<THREE.Group>(observer => {
      this.fbxLoader.load(
        url,
        (fbx) => {
          this.modelCache.set(url, fbx.clone());
          this.applyModelOptions(fbx, options);
          
          this.loadingSubject.next(false);
          observer.next(fbx);
          observer.complete();
        },
        (progress) => {
          const loadProgress: LoadProgress = {
            loaded: progress.loaded,
            total: progress.total,
            percentage: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0
          };
          this.progressSubject.next(loadProgress);
        },
        (error) => {
          this.loadingSubject.next(false);
          console.error('Error loading FBX model:', error);
          observer.error(error);
        }
      );
    });
  }

  /**
   * Завантажує OBJ модель
   */
  loadOBJ(url: string, options: ModelLoadOptions = {}): Observable<THREE.Group> {
    const cachedModel = this.modelCache.get(url);
    if (cachedModel) {
      return new Observable(observer => {
        const clonedModel = cachedModel.clone();
        this.applyModelOptions(clonedModel, options);
        observer.next(clonedModel as THREE.Group);
        observer.complete();
      });
    }

    this.loadingSubject.next(true);

    return new Observable<THREE.Group>(observer => {
      this.objLoader.load(
        url,
        (obj) => {
          this.modelCache.set(url, obj.clone());
          this.applyModelOptions(obj, options);
          
          this.loadingSubject.next(false);
          observer.next(obj);
          observer.complete();
        },
        (progress) => {
          const loadProgress: LoadProgress = {
            loaded: progress.loaded,
            total: progress.total,
            percentage: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0
          };
          this.progressSubject.next(loadProgress);
        },
        (error) => {
          this.loadingSubject.next(false);
          console.error('Error loading OBJ model:', error);
          observer.error(error);
        }
      );
    });
  }

  /**
   * Завантажує текстуру
   */
  loadTexture(url: string): Observable<THREE.Texture> {
    const cachedTexture = this.textureCache.get(url);
    if (cachedTexture) {
      return new Observable(observer => {
        observer.next(cachedTexture);
        observer.complete();
      });
    }

    return new Observable<THREE.Texture>(observer => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.textureCache.set(url, texture);
          observer.next(texture);
          observer.complete();
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          observer.error(error);
        }
      );
    });
  }

  /**
   * Застосовує опції до завантаженої моделі
   */
  private applyModelOptions(model: THREE.Object3D, options: ModelLoadOptions): void {
    if (options.scale) {
      model.scale.copy(options.scale);
    }

    if (options.position) {
      model.position.copy(options.position);
    }

    if (options.rotation) {
      model.rotation.copy(options.rotation);
    }

    // Налаштування тіней
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (options.castShadow !== undefined) {
          child.castShadow = options.castShadow;
        }
        if (options.receiveShadow !== undefined) {
          child.receiveShadow = options.receiveShadow;
        }
      }
    });
  }

  /**
   * Створює простий корабель (placeholder)
   */
  createSimpleSpaceship(): THREE.Group {
    const group = new THREE.Group();

    // Основний корпус
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.8, 3, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    group.add(body);

    // Крила
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(0, 0.5, 0);
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0, -0.5, 0);
    group.add(rightWing);

    // Двигуни
    const engineGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 6);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    leftEngine.position.set(-1.2, 0.8, 0);
    leftEngine.rotation.z = Math.PI / 2;
    group.add(leftEngine);

    const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    rightEngine.position.set(-1.2, -0.8, 0);
    rightEngine.rotation.z = Math.PI / 2;
    group.add(rightEngine);

    return group;
  }

  /**
   * Створює простий персонаж (placeholder)
   */
  createSimpleCharacter(): THREE.Group {
    const group = new THREE.Group();

    // Голова
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    group.add(head);

    // Тіло
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    group.add(body);

    // Руки
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 6);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0.8, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0.8, 0);
    group.add(rightArm);

    // Ноги
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1, 6);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.5, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.5, 0);
    group.add(rightLeg);

    return group;
  }

  /**
   * Очищає кеш моделей
   */
  clearCache(): void {
    this.modelCache.clear();
    this.textureCache.clear();
  }

  /**
   * Отримує розмір кешу
   */
  getCacheSize(): { models: number; textures: number } {
    return {
      models: this.modelCache.size,
      textures: this.textureCache.size
    };
  }
}
