import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  EnhancedStarship, 
  EnhancedPlanet, 
  StarshipPhysicsConfig,
  Environment3D,
  Model3DConfig 
} from '../models/bright-data-models';

@Injectable({
  providedIn: 'root'
})
export class BrightData3DService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private world: CANNON.World | null = null;
  private loader: GLTFLoader = new GLTFLoader();
  
  // Observables for 3D state
  private sceneInitialized$ = new BehaviorSubject<boolean>(false);
  private loadedModels$ = new BehaviorSubject<Map<string, THREE.Object3D>>(new Map());
  private physicsObjects$ = new BehaviorSubject<Map<string, CANNON.Body>>(new Map());
  
  // Animation and rendering
  private animationId: number | null = null;
  private clock = new THREE.Clock();
  
  constructor() {}

  // ===== SCENE INITIALIZATION =====

  /**
   * Initialize 3D scene with Bright Data configurations
   */
  initializeScene(container: HTMLElement, sceneType: 'starship' | 'planet' | 'battle'): void {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      10000
    );
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    container.appendChild(this.renderer.domElement);
    
    // Initialize physics world
    this.initializePhysics();
    
    // Setup scene based on type
    this.setupSceneByType(sceneType);
    
    // Start render loop
    this.startRenderLoop();
    
    this.sceneInitialized$.next(true);
  }

  /**
   * Initialize Cannon.js physics world
   */
  private initializePhysics(): void {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    
    // Configure physics world
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    this.world.defaultContactMaterial.friction = 0.4;
    this.world.defaultContactMaterial.restitution = 0.3;
  }

  /**
   * Setup scene based on type (starship, planet, battle)
   */
  private setupSceneByType(sceneType: 'starship' | 'planet' | 'battle'): void {
    if (!this.scene) return;

    switch (sceneType) {
      case 'starship':
        this.setupStarshipScene();
        break;
      case 'planet':
        this.setupPlanetScene();
        break;
      case 'battle':
        this.setupBattleScene();
        break;
    }
  }

  // ===== STARSHIP 3D METHODS =====

  /**
   * Load and display a starship with Bright Data configuration
   */
  loadStarship(starship: EnhancedStarship): Observable<THREE.Object3D> {
    return new Observable(observer => {
      if (!starship.model3DConfig) {
        observer.error('No 3D model configuration found for starship');
        return;
      }

      const config = starship.model3DConfig;
      
      this.loader.load(
        config.modelPath,
        (gltf) => {
          const model = gltf.scene;
          
          // Apply configuration from Bright Data
          model.scale.setScalar(config.scale);
          model.rotation.set(config.rotationX, config.rotationY, config.rotationZ);
          
          // Add to scene
          if (this.scene) {
            this.scene.add(model);
          }
          
          // Setup physics if configuration exists
          if (starship.physicsConfig) {
            this.setupStarshipPhysics(model, starship.physicsConfig);
          }
          
          // Setup animations if available
          if (config.hasAnimations && gltf.animations.length > 0) {
            this.setupStarshipAnimations(model, gltf.animations);
          }
          
          // Cache the model
          const models = this.loadedModels$.value;
          models.set(starship.name, model);
          this.loadedModels$.next(models);
          
          observer.next(model);
          observer.complete();
        },
        (progress) => {
          // Loading progress
          console.log('Loading progress:', progress);
        },
        (error) => {
          observer.error(`Failed to load starship model: ${error}`);
        }
      );
    });
  }

  /**
   * Setup physics for starship based on Bright Data configuration
   */
  private setupStarshipPhysics(model: THREE.Object3D, config: StarshipPhysicsConfig): void {
    if (!this.world) return;

    // Create physics body based on configuration
    let shape: CANNON.Shape;
    
    switch (config.collisionShape) {
      case 'box':
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        shape = new CANNON.Box(new CANNON.Vec3(
          size.x * config.collisionScale / 2,
          size.y * config.collisionScale / 2,
          size.z * config.collisionScale / 2
        ));
        break;
      case 'sphere':
        const sphere = new THREE.Sphere();
        new THREE.Box3().setFromObject(model).getBoundingSphere(sphere);
        shape = new CANNON.Sphere(sphere.radius * config.collisionScale);
        break;
      default:
        // Default to box
        const defaultBox = new THREE.Box3().setFromObject(model);
        const defaultSize = defaultBox.getSize(new THREE.Vector3());
        shape = new CANNON.Box(new CANNON.Vec3(
          defaultSize.x / 2,
          defaultSize.y / 2,
          defaultSize.z / 2
        ));
    }

    // Create physics body
    const body = new CANNON.Body({
      mass: config.mass,
      shape: shape,
      material: new CANNON.Material({
        friction: config.friction,
        restitution: config.restitution
      })
    });

    // Set damping
    body.linearDamping = config.linearDamping;
    body.angularDamping = config.angularDamping;

    // Add to physics world
    this.world.addBody(body);

    // Cache physics body
    const physicsObjects = this.physicsObjects$.value;
    physicsObjects.set(model.uuid, body);
    this.physicsObjects$.next(physicsObjects);
  }

  /**
   * Setup starship animations
   */
  private setupStarshipAnimations(model: THREE.Object3D, animations: THREE.AnimationClip[]): void {
    const mixer = new THREE.AnimationMixer(model);
    
    animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      action.play();
    });

    // Store mixer for updates
    (model as any).mixer = mixer;
  }

  // ===== PLANET 3D METHODS =====

  /**
   * Load and display a planet with Bright Data environment configuration
   */
  loadPlanet(planet: EnhancedPlanet): Observable<THREE.Object3D> {
    return new Observable(observer => {
      if (!planet.environment3D) {
        observer.error('No 3D environment configuration found for planet');
        return;
      }

      const config = planet.environment3D;
      
      // Create planet sphere
      const geometry = new THREE.SphereGeometry(50, 64, 32);
      const material = new THREE.MeshPhongMaterial();
      
      // Load planet texture if available
      if (config.terrainTexture) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(config.terrainTexture, (texture) => {
          material.map = texture;
          material.needsUpdate = true;
        });
      }
      
      const planetMesh = new THREE.Mesh(geometry, material);
      planetMesh.scale.setScalar(config.terrainScale);
      
      // Setup environment
      this.setupPlanetEnvironment(config);
      
      // Add to scene
      if (this.scene) {
        this.scene.add(planetMesh);
      }
      
      // Cache the model
      const models = this.loadedModels$.value;
      models.set(planet.name, planetMesh);
      this.loadedModels$.next(models);
      
      observer.next(planetMesh);
      observer.complete();
    });
  }

  /**
   * Setup planet environment based on Bright Data configuration
   */
  private setupPlanetEnvironment(config: Environment3D): void {
    if (!this.scene) return;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(config.ambientColor, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(config.sunColor, config.sunIntensity);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Setup skybox if available
    if (config.skyboxTexture) {
      const loader = new THREE.CubeTextureLoader();
      const skyboxTexture = loader.load([
        config.skyboxTexture, config.skyboxTexture,
        config.skyboxTexture, config.skyboxTexture,
        config.skyboxTexture, config.skyboxTexture
      ]);
      this.scene.background = skyboxTexture;
    }

    // Setup fog
    if (config.fogDensity > 0) {
      this.scene.fog = new THREE.Fog(config.fogColor, 1, 1000 * config.fogDensity);
    }

    // Setup particle effects
    this.setupParticleEffects(config.particleEffects);
  }

  // ===== SCENE SETUP METHODS =====

  private setupStarshipScene(): void {
    if (!this.scene || !this.camera) return;

    // Position camera for starship viewing
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);
  }

  private setupPlanetScene(): void {
    if (!this.scene || !this.camera) return;

    // Position camera for planet viewing
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);
  }

  private setupBattleScene(): void {
    if (!this.scene || !this.camera) return;

    // Position camera for battle viewing
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    // Add dramatic lighting for battles
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 20, 10);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
  }

  private setupParticleEffects(effects: string[]): void {
    // Implementation for particle effects based on planet environment
    effects.forEach(effect => {
      switch (effect) {
        case 'sand':
          this.createSandParticles();
          break;
        case 'snow':
          this.createSnowParticles();
          break;
        case 'rain':
          this.createRainParticles();
          break;
      }
    });
  }

  private createSandParticles(): void {
    // Sand particle system implementation
  }

  private createSnowParticles(): void {
    // Snow particle system implementation
  }

  private createRainParticles(): void {
    // Rain particle system implementation
  }

  // ===== RENDER LOOP =====

  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      const delta = this.clock.getDelta();
      
      // Update physics
      if (this.world) {
        this.world.step(1/60, delta, 3);
      }
      
      // Update animations
      this.updateAnimations(delta);
      
      // Render scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    
    animate();
  }

  private updateAnimations(delta: number): void {
    const models = this.loadedModels$.value;
    models.forEach(model => {
      if ((model as any).mixer) {
        (model as any).mixer.update(delta);
      }
    });
  }

  // ===== PUBLIC OBSERVABLES =====

  isSceneInitialized(): Observable<boolean> {
    return this.sceneInitialized$.asObservable();
  }

  getLoadedModels(): Observable<Map<string, THREE.Object3D>> {
    return this.loadedModels$.asObservable();
  }

  // ===== CLEANUP =====

  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    
    this.sceneInitialized$.next(false);
    this.loadedModels$.next(new Map());
    this.physicsObjects$.next(new Map());
  }
}
