import { Injectable } from '@angular/core';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PhysicsConfig {
  gravity?: CANNON.Vec3;
  broadphase?: CANNON.Broadphase;
  solver?: CANNON.Solver;
  allowSleep?: boolean;
}

export interface RigidBodyConfig {
  mass?: number;
  material?: CANNON.Material;
  shape?: CANNON.Shape;
  position?: CANNON.Vec3;
  velocity?: CANNON.Vec3;
  angularVelocity?: CANNON.Vec3;
  type?: CANNON.BodyType;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
  private worlds = new Map<string, CANNON.World>();
  private bodies = new Map<string, Map<string, CANNON.Body>>();
  private meshBodyMap = new Map<THREE.Mesh, CANNON.Body>();
  
  private isSimulatingSubject = new BehaviorSubject<boolean>(false);
  public isSimulating$: Observable<boolean> = this.isSimulatingSubject.asObservable();

  constructor() {}

  /**
   * Створює новий фізичний світ
   */
  createWorld(worldId: string, config: PhysicsConfig = {}): CANNON.World {
    const world = new CANNON.World();
    
    // Налаштування гравітації
    world.gravity.set(
      config.gravity?.x || 0,
      config.gravity?.y || -9.82,
      config.gravity?.z || 0
    );

    // Налаштування broadphase для оптимізації колізій
    world.broadphase = config.broadphase || new CANNON.NaiveBroadphase();
    
    // Налаштування solver
    world.solver = config.solver || new CANNON.GSSolver();
    (world.solver as any).iterations = 10;

    // Дозвіл на сон для оптимізації
    world.allowSleep = config.allowSleep !== undefined ? config.allowSleep : true;

    // Збереження світу
    this.worlds.set(worldId, world);
    this.bodies.set(worldId, new Map());

    return world;
  }

  /**
   * Отримує фізичний світ за ID
   */
  getWorld(worldId: string): CANNON.World | undefined {
    return this.worlds.get(worldId);
  }

  /**
   * Створює фізичне тіло
   */
  createRigidBody(
    worldId: string,
    bodyId: string,
    config: RigidBodyConfig = {}
  ): CANNON.Body | null {
    const world = this.worlds.get(worldId);
    if (!world) {
      console.error(`Physics world not found: ${worldId}`);
      return null;
    }

    const body = new CANNON.Body({
      mass: config.mass || 0,
      material: config.material,
      shape: config.shape,
      position: config.position,
      velocity: config.velocity,
      angularVelocity: config.angularVelocity,
      type: config.type || CANNON.Body.DYNAMIC
    });

    world.addBody(body);
    
    const worldBodies = this.bodies.get(worldId);
    if (worldBodies) {
      worldBodies.set(bodyId, body);
    }

    return body;
  }

  /**
   * Створює фізичне тіло для меша
   */
  createMeshRigidBody(
    worldId: string,
    bodyId: string,
    mesh: THREE.Mesh,
    config: RigidBodyConfig = {}
  ): CANNON.Body | null {
    // Автоматичне створення shape на основі геометрії меша
    let shape: CANNON.Shape;

    if (mesh.geometry instanceof THREE.BoxGeometry) {
      const geometry = mesh.geometry;
      const parameters = geometry.parameters;
      shape = new CANNON.Box(new CANNON.Vec3(
        parameters.width / 2,
        parameters.height / 2,
        parameters.depth / 2
      ));
    } else if (mesh.geometry instanceof THREE.SphereGeometry) {
      const geometry = mesh.geometry;
      shape = new CANNON.Sphere(geometry.parameters.radius);
    } else if (mesh.geometry instanceof THREE.CylinderGeometry) {
      const geometry = mesh.geometry;
      shape = new CANNON.Cylinder(
        geometry.parameters.radiusTop,
        geometry.parameters.radiusBottom,
        geometry.parameters.height,
        geometry.parameters.radialSegments
      );
    } else {
      // Для складних геометрій використовуємо ConvexPolyhedron
      const vertices: number[] = [];
      const faces: number[][] = [];
      
      const positionAttribute = mesh.geometry.getAttribute('position');
      for (let i = 0; i < positionAttribute.count; i++) {
        vertices.push(
          positionAttribute.getX(i),
          positionAttribute.getY(i),
          positionAttribute.getZ(i)
        );
      }

      // Спрощена версія для демонстрації - в реальності потрібен більш складний алгоритм
      shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    }

    // Копіювання позиції та ротації з меша
    const position = new CANNON.Vec3(
      mesh.position.x,
      mesh.position.y,
      mesh.position.z
    );

    const quaternion = new CANNON.Quaternion(
      mesh.quaternion.x,
      mesh.quaternion.y,
      mesh.quaternion.z,
      mesh.quaternion.w
    );

    const body = this.createRigidBody(worldId, bodyId, {
      ...config,
      shape,
      position
    });

    if (body) {
      body.quaternion = quaternion;
      this.meshBodyMap.set(mesh, body);
    }

    return body;
  }

  /**
   * Отримує фізичне тіло за ID
   */
  getBody(worldId: string, bodyId: string): CANNON.Body | undefined {
    const worldBodies = this.bodies.get(worldId);
    return worldBodies?.get(bodyId);
  }

  /**
   * Отримує фізичне тіло для меша
   */
  getBodyForMesh(mesh: THREE.Mesh): CANNON.Body | undefined {
    return this.meshBodyMap.get(mesh);
  }

  /**
   * Синхронізує позицію та ротацію меша з фізичним тілом
   */
  syncMeshWithBody(mesh: THREE.Mesh, body: CANNON.Body): void {
    mesh.position.copy(body.position as any);
    mesh.quaternion.copy(body.quaternion as any);
  }

  /**
   * Синхронізує всі меші з їх фізичними тілами
   */
  syncAllMeshes(): void {
    this.meshBodyMap.forEach((body, mesh) => {
      this.syncMeshWithBody(mesh, body);
    });
  }

  /**
   * Додає силу до тіла
   */
  applyForce(worldId: string, bodyId: string, force: CANNON.Vec3, worldPoint?: CANNON.Vec3): void {
    const body = this.getBody(worldId, bodyId);
    if (body) {
      body.applyForce(force, worldPoint);
    }
  }

  /**
   * Додає імпульс до тіла
   */
  applyImpulse(worldId: string, bodyId: string, impulse: CANNON.Vec3, worldPoint?: CANNON.Vec3): void {
    const body = this.getBody(worldId, bodyId);
    if (body) {
      body.applyImpulse(impulse, worldPoint);
    }
  }

  /**
   * Оновлює фізичний світ
   */
  stepWorld(worldId: string, deltaTime: number): void {
    const world = this.worlds.get(worldId);
    if (world) {
      world.step(deltaTime);
      this.syncAllMeshes();
    }
  }

  /**
   * Створює матеріал для фізичних тіл
   */
  createMaterial(name: string, options: {
    friction?: number;
    restitution?: number;
    contactEquationStiffness?: number;
    contactEquationRelaxation?: number;
  } = {}): CANNON.Material {
    const material = new CANNON.Material(name);
    material.friction = options.friction || 0.3;
    material.restitution = options.restitution || 0.3;
    return material;
  }

  /**
   * Створює контактний матеріал між двома матеріалами
   */
  createContactMaterial(
    materialA: CANNON.Material,
    materialB: CANNON.Material,
    options: {
      friction?: number;
      restitution?: number;
      contactEquationStiffness?: number;
      contactEquationRelaxation?: number;
    } = {}
  ): CANNON.ContactMaterial {
    return new CANNON.ContactMaterial(materialA, materialB, {
      friction: options.friction || 0.3,
      restitution: options.restitution || 0.3,
      contactEquationStiffness: options.contactEquationStiffness || 1e8,
      contactEquationRelaxation: options.contactEquationRelaxation || 3
    });
  }

  /**
   * Видаляє фізичне тіло зі світу
   */
  removeBody(worldId: string, bodyId: string): void {
    const world = this.worlds.get(worldId);
    const body = this.getBody(worldId, bodyId);
    
    if (world && body) {
      world.removeBody(body);
      
      const worldBodies = this.bodies.get(worldId);
      if (worldBodies) {
        worldBodies.delete(bodyId);
      }

      // Видалення з map меш-тіло
      for (const [mesh, mappedBody] of this.meshBodyMap.entries()) {
        if (mappedBody === body) {
          this.meshBodyMap.delete(mesh);
          break;
        }
      }
    }
  }

  /**
   * Очищує фізичний світ
   */
  disposeWorld(worldId: string): void {
    const world = this.worlds.get(worldId);
    if (world) {
      // Видалення всіх тіл
      const worldBodies = this.bodies.get(worldId);
      if (worldBodies) {
        worldBodies.forEach((body, bodyId) => {
          world.removeBody(body);
        });
        worldBodies.clear();
      }

      this.worlds.delete(worldId);
      this.bodies.delete(worldId);
    }

    if (this.worlds.size === 0) {
      this.isSimulatingSubject.next(false);
    }
  }

  /**
   * Очищує всі фізичні світи
   */
  disposeAll(): void {
    const worldIds = Array.from(this.worlds.keys());
    worldIds.forEach(worldId => this.disposeWorld(worldId));
    this.meshBodyMap.clear();
  }
}
