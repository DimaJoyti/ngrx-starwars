import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BehaviorSubject } from 'rxjs';

export interface EnvironmentalHazard {
  id: string;
  type: HazardType;
  position: THREE.Vector3;
  mesh: THREE.Object3D;
  physicsBody?: CANNON.Body;
  damage: number;
  radius: number;
  duration: number;
  maxDuration: number;
  isActive: boolean;
  effects: HazardEffect[];
  movementPattern?: MovementPattern;
  velocity?: THREE.Vector3;
}

export type HazardType = 
  | 'asteroid_field'
  | 'solar_flare'
  | 'black_hole'
  | 'nebula_cloud'
  | 'electromagnetic_storm'
  | 'space_mine'
  | 'plasma_storm'
  | 'gravity_well'
  | 'radiation_field'
  | 'temporal_anomaly';

export interface HazardEffect {
  type: 'damage' | 'slow' | 'disable' | 'drain_energy' | 'scramble_controls' | 'reduce_visibility';
  strength: number;
  duration: number;
}

export interface MovementPattern {
  type: 'static' | 'orbit' | 'linear' | 'random' | 'spiral';
  speed: number;
  amplitude?: number;
  frequency?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentalHazardsService {
  private hazards: Map<string, EnvironmentalHazard> = new Map();
  private scene!: THREE.Scene;
  private physicsWorld!: CANNON.World;

  private hazardsSubject = new BehaviorSubject<EnvironmentalHazard[]>([]);
  public hazards$ = this.hazardsSubject.asObservable();

  /**
   * Initialize hazards system
   */
  initialize(scene: THREE.Scene, physicsWorld: CANNON.World): void {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  /**
   * Create asteroid field
   */
  createAsteroidField(position: THREE.Vector3, count: number = 20): EnvironmentalHazard {
    const group = new THREE.Group();
    const asteroids: THREE.Mesh[] = [];

    for (let i = 0; i < count; i++) {
      const size = 0.5 + Math.random() * 2;
      const geometry = new THREE.DodecahedronGeometry(size);
      const material = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        shininess: 10
      });
      
      const asteroid = new THREE.Mesh(geometry, material);
      asteroid.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 40
      );
      
      asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      asteroids.push(asteroid);
      group.add(asteroid);
    }

    group.position.copy(position);
    this.scene.add(group);

    const hazard: EnvironmentalHazard = {
      id: `asteroid-field-${Date.now()}`,
      type: 'asteroid_field',
      position: position.clone(),
      mesh: group,
      damage: 25,
      radius: 25,
      duration: 0,
      maxDuration: 60000, // 60 seconds
      isActive: true,
      effects: [
        { type: 'damage', strength: 25, duration: 0 }
      ],
      movementPattern: {
        type: 'random',
        speed: 0.5
      }
    };

    this.hazards.set(hazard.id, hazard);
    this.updateHazardsSubject();
    return hazard;
  }

  /**
   * Create solar flare
   */
  createSolarFlare(position: THREE.Vector3): EnvironmentalHazard {
    const geometry = new THREE.SphereGeometry(15, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFFAA00,
      transparent: true,
      opacity: 0.6
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    this.scene.add(mesh);

    // Add particle effect
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xFF6600,
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mesh.add(particles);

    const hazard: EnvironmentalHazard = {
      id: `solar-flare-${Date.now()}`,
      type: 'solar_flare',
      position: position.clone(),
      mesh,
      damage: 15,
      radius: 15,
      duration: 0,
      maxDuration: 10000, // 10 seconds
      isActive: true,
      effects: [
        { type: 'damage', strength: 15, duration: 1000 },
        { type: 'disable', strength: 0.5, duration: 2000 },
        { type: 'drain_energy', strength: 20, duration: 1000 }
      ]
    };

    this.hazards.set(hazard.id, hazard);
    this.updateHazardsSubject();
    return hazard;
  }

  /**
   * Create black hole
   */
  createBlackHole(position: THREE.Vector3): EnvironmentalHazard {
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    // Add accretion disk
    const diskGeometry = new THREE.RingGeometry(5, 15, 32);
    const diskMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444FF,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.rotation.x = Math.PI / 2;
    mesh.add(disk);

    this.scene.add(mesh);

    const hazard: EnvironmentalHazard = {
      id: `black-hole-${Date.now()}`,
      type: 'black_hole',
      position: position.clone(),
      mesh,
      damage: 50,
      radius: 20,
      duration: 0,
      maxDuration: 30000, // 30 seconds
      isActive: true,
      effects: [
        { type: 'damage', strength: 50, duration: 500 }
      ],
      movementPattern: {
        type: 'spiral',
        speed: 2,
        amplitude: 10,
        frequency: 0.1
      }
    };

    this.hazards.set(hazard.id, hazard);
    this.updateHazardsSubject();
    return hazard;
  }

  /**
   * Create nebula cloud
   */
  createNebulaCloud(position: THREE.Vector3): EnvironmentalHazard {
    const geometry = new THREE.SphereGeometry(20, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x9966FF,
      transparent: true,
      opacity: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    this.scene.add(mesh);

    const hazard: EnvironmentalHazard = {
      id: `nebula-cloud-${Date.now()}`,
      type: 'nebula_cloud',
      position: position.clone(),
      mesh,
      damage: 5,
      radius: 20,
      duration: 0,
      maxDuration: 45000, // 45 seconds
      isActive: true,
      effects: [
        { type: 'slow', strength: 0.5, duration: 2000 },
        { type: 'reduce_visibility', strength: 0.7, duration: 3000 },
        { type: 'scramble_controls', strength: 0.3, duration: 1000 }
      ]
    };

    this.hazards.set(hazard.id, hazard);
    this.updateHazardsSubject();
    return hazard;
  }

  /**
   * Create space mine
   */
  createSpaceMine(position: THREE.Vector3): EnvironmentalHazard {
    const geometry = new THREE.SphereGeometry(1, 12, 12);
    const material = new THREE.MeshPhongMaterial({
      color: 0xFF0000,
      emissive: 0x440000
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    // Add spikes
    for (let i = 0; i < 8; i++) {
      const spikeGeometry = new THREE.ConeGeometry(0.2, 1, 4);
      const spike = new THREE.Mesh(spikeGeometry, material);
      
      const phi = Math.acos(-1 + (2 * i) / 8);
      const theta = Math.sqrt(8 * Math.PI) * phi;
      
      spike.position.setFromSphericalCoords(1.5, phi, theta);
      spike.lookAt(0, 0, 0);
      mesh.add(spike);
    }

    this.scene.add(mesh);

    // Add physics body
    const shape = new CANNON.Sphere(2);
    const body = new CANNON.Body({
      mass: 0,
      shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      type: CANNON.Body.KINEMATIC
    });
    
    this.physicsWorld.addBody(body);

    const hazard: EnvironmentalHazard = {
      id: `space-mine-${Date.now()}`,
      type: 'space_mine',
      position: position.clone(),
      mesh,
      physicsBody: body,
      damage: 100,
      radius: 3,
      duration: 0,
      maxDuration: 120000, // 2 minutes
      isActive: true,
      effects: [
        { type: 'damage', strength: 100, duration: 0 }
      ]
    };

    // Add userData for collision detection
    (body as any).userData = { type: 'hazard', hazard };

    this.hazards.set(hazard.id, hazard);
    this.updateHazardsSubject();
    return hazard;
  }

  /**
   * Update hazards
   */
  update(deltaTime: number): void {
    const currentTime = Date.now();

    this.hazards.forEach((hazard, id) => {
      if (!hazard.isActive) return;

      hazard.duration += deltaTime * 1000;

      // Update movement
      this.updateHazardMovement(hazard, deltaTime);

      // Update visual effects
      this.updateHazardVisuals(hazard, deltaTime);

      // Check if hazard should be removed
      if (hazard.maxDuration > 0 && hazard.duration >= hazard.maxDuration) {
        this.removeHazard(id);
      }
    });

    this.updateHazardsSubject();
  }

  /**
   * Update hazard movement
   */
  private updateHazardMovement(hazard: EnvironmentalHazard, deltaTime: number): void {
    if (!hazard.movementPattern) return;

    const time = hazard.duration * 0.001;
    const pattern = hazard.movementPattern;

    switch (pattern.type) {
      case 'orbit':
        const orbitRadius = pattern.amplitude || 10;
        const orbitSpeed = pattern.speed * time;
        hazard.mesh.position.x = hazard.position.x + Math.cos(orbitSpeed) * orbitRadius;
        hazard.mesh.position.z = hazard.position.z + Math.sin(orbitSpeed) * orbitRadius;
        break;

      case 'random':
        if (Math.random() < 0.1) { // 10% chance to change direction
          hazard.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * pattern.speed,
            (Math.random() - 0.5) * pattern.speed * 0.5,
            (Math.random() - 0.5) * pattern.speed
          );
        }
        if (hazard.velocity) {
          hazard.mesh.position.add(hazard.velocity.clone().multiplyScalar(deltaTime));
        }
        break;

      case 'spiral':
        const spiralRadius = (pattern.amplitude || 5) * (1 + time * 0.1);
        const spiralSpeed = pattern.speed * time;
        hazard.mesh.position.x = hazard.position.x + Math.cos(spiralSpeed) * spiralRadius;
        hazard.mesh.position.z = hazard.position.z + Math.sin(spiralSpeed) * spiralRadius;
        break;
    }

    // Update physics body position if exists
    if (hazard.physicsBody) {
      hazard.physicsBody.position.set(
        hazard.mesh.position.x,
        hazard.mesh.position.y,
        hazard.mesh.position.z
      );
    }
  }

  /**
   * Update hazard visuals
   */
  private updateHazardVisuals(hazard: EnvironmentalHazard, deltaTime: number): void {
    const time = hazard.duration * 0.001;

    switch (hazard.type) {
      case 'solar_flare':
        // Pulsing effect
        const pulse = 0.6 + Math.sin(time * 5) * 0.4;
        (hazard.mesh as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: 0xFFAA00,
          transparent: true,
          opacity: pulse
        });
        break;

      case 'black_hole':
        // Rotating accretion disk
        const disk = hazard.mesh.children[0];
        if (disk) {
          disk.rotation.z += deltaTime * 2;
        }
        break;

      case 'space_mine':
        // Blinking warning light
        const blink = Math.sin(time * 10) > 0;
        (hazard.mesh as THREE.Mesh).material = new THREE.MeshPhongMaterial({
          color: blink ? 0xFF0000 : 0x880000,
          emissive: blink ? 0x440000 : 0x220000
        });
        break;

      case 'asteroid_field':
        // Rotate asteroids
        hazard.mesh.children.forEach((asteroid, index) => {
          asteroid.rotation.x += deltaTime * (0.5 + index * 0.1);
          asteroid.rotation.y += deltaTime * (0.3 + index * 0.05);
        });
        break;
    }
  }

  /**
   * Check collision with hazard
   */
  checkCollision(position: THREE.Vector3, radius: number = 1): EnvironmentalHazard[] {
    const collisions: EnvironmentalHazard[] = [];

    this.hazards.forEach(hazard => {
      if (!hazard.isActive) return;

      const distance = position.distanceTo(hazard.mesh.position);
      if (distance <= hazard.radius + radius) {
        collisions.push(hazard);
      }
    });

    return collisions;
  }

  /**
   * Remove hazard
   */
  removeHazard(hazardId: string): void {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return;

    this.scene.remove(hazard.mesh);
    
    if (hazard.physicsBody) {
      this.physicsWorld.removeBody(hazard.physicsBody);
    }

    this.hazards.delete(hazardId);
    this.updateHazardsSubject();
  }

  /**
   * Clear all hazards
   */
  clearAllHazards(): void {
    this.hazards.forEach((hazard, id) => {
      this.removeHazard(id);
    });
  }

  /**
   * Get hazard by physics body
   */
  getHazardByPhysicsBody(body: CANNON.Body): EnvironmentalHazard | null {
    const userData = (body as any).userData;
    return userData?.type === 'hazard' ? userData.hazard : null;
  }

  /**
   * Update hazards subject
   */
  private updateHazardsSubject(): void {
    this.hazardsSubject.next(Array.from(this.hazards.values()));
  }

  /**
   * Get all active hazards
   */
  getActiveHazards(): EnvironmentalHazard[] {
    return Array.from(this.hazards.values()).filter(h => h.isActive);
  }
}
