import { Injectable, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'three';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SceneConfig {
  enableShadows?: boolean;
  backgroundColor?: number;
  fog?: {
    color: number;
    near: number;
    far: number;
  };
}

export interface CameraConfig {
  fov?: number;
  near?: number;
  far?: number;
  position?: THREE.Vector3;
}

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  private scenes = new Map<string, THREE.Scene>();
  private renderers = new Map<string, THREE.WebGLRenderer>();
  private cameras = new Map<string, THREE.PerspectiveCamera>();
  private animationFrames = new Map<string, number>();
  
  private isRenderingSubject = new BehaviorSubject<boolean>(false);
  public isRendering$: Observable<boolean> = this.isRenderingSubject.asObservable();

  constructor(private ngZone: NgZone) {}

  /**
   * Створює нову 3D сцену
   */
  createScene(
    sceneId: string,
    container: ElementRef<HTMLElement>,
    sceneConfig: SceneConfig = {},
    cameraConfig: CameraConfig = {}
  ): {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
  } {
    // Створення сцени
    const scene = new THREE.Scene();
    if (sceneConfig.backgroundColor !== undefined) {
      scene.background = new THREE.Color(sceneConfig.backgroundColor);
    }
    
    if (sceneConfig.fog) {
      scene.fog = new THREE.Fog(
        sceneConfig.fog.color,
        sceneConfig.fog.near,
        sceneConfig.fog.far
      );
    }

    // Створення камери
    const containerElement = container.nativeElement;
    const camera = new THREE.PerspectiveCamera(
      cameraConfig.fov || 75,
      containerElement.clientWidth / containerElement.clientHeight,
      cameraConfig.near || 0.1,
      cameraConfig.far || 1000
    );
    
    if (cameraConfig.position) {
      camera.position.copy(cameraConfig.position);
    }

    // Створення рендерера
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (sceneConfig.enableShadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Додавання до DOM
    containerElement.appendChild(renderer.domElement);

    // Збереження в мапах
    this.scenes.set(sceneId, scene);
    this.cameras.set(sceneId, camera);
    this.renderers.set(sceneId, renderer);

    return { scene, camera, renderer };
  }

  /**
   * Отримує сцену за ID
   */
  getScene(sceneId: string): THREE.Scene | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Отримує камеру за ID
   */
  getCamera(sceneId: string): THREE.PerspectiveCamera | undefined {
    return this.cameras.get(sceneId);
  }

  /**
   * Отримує рендерер за ID
   */
  getRenderer(sceneId: string): THREE.WebGLRenderer | undefined {
    return this.renderers.get(sceneId);
  }

  /**
   * Запускає цикл рендерингу для сцени
   */
  startRenderLoop(sceneId: string, updateCallback?: () => void): void {
    const scene = this.scenes.get(sceneId);
    const camera = this.cameras.get(sceneId);
    const renderer = this.renderers.get(sceneId);

    if (!scene || !camera || !renderer) {
      console.error(`Scene components not found for ID: ${sceneId}`);
      return;
    }

    this.isRenderingSubject.next(true);

    const animate = () => {
      this.ngZone.runOutsideAngular(() => {
        if (updateCallback) {
          updateCallback();
        }

        renderer.render(scene, camera);
        
        const frameId = requestAnimationFrame(animate);
        this.animationFrames.set(sceneId, frameId);
      });
    };

    animate();
  }

  /**
   * Зупиняє цикл рендерингу для сцени
   */
  stopRenderLoop(sceneId: string): void {
    const frameId = this.animationFrames.get(sceneId);
    if (frameId) {
      cancelAnimationFrame(frameId);
      this.animationFrames.delete(sceneId);
    }

    if (this.animationFrames.size === 0) {
      this.isRenderingSubject.next(false);
    }
  }

  /**
   * Оновлює розмір рендерера при зміні розміру контейнера
   */
  onWindowResize(sceneId: string, container: ElementRef<HTMLElement>): void {
    const camera = this.cameras.get(sceneId);
    const renderer = this.renderers.get(sceneId);
    
    if (!camera || !renderer) return;

    const containerElement = container.nativeElement;
    camera.aspect = containerElement.clientWidth / containerElement.clientHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
  }

  /**
   * Додає базове освітлення до сцени
   */
  addBasicLighting(sceneId: string): void {
    const scene = this.scenes.get(sceneId);
    if (!scene) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
  }

  /**
   * Очищує сцену та звільняє ресурси
   */
  disposeScene(sceneId: string): void {
    this.stopRenderLoop(sceneId);

    const scene = this.scenes.get(sceneId);
    const renderer = this.renderers.get(sceneId);

    if (scene) {
      // Очищення всіх об'єктів сцени
      while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
        
        // Очищення геометрії та матеріалів
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      }
    }

    if (renderer) {
      renderer.dispose();
      // Видалення canvas з DOM
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }

    // Видалення з мап
    this.scenes.delete(sceneId);
    this.cameras.delete(sceneId);
    this.renderers.delete(sceneId);
    this.animationFrames.delete(sceneId);
  }

  /**
   * Очищує всі сцени
   */
  disposeAll(): void {
    const sceneIds = Array.from(this.scenes.keys());
    sceneIds.forEach(sceneId => this.disposeScene(sceneId));
  }
}
