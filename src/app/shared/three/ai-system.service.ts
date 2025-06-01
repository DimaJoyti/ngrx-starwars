import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BattleShip, BattleWeapon } from './battle-3d.service';

export interface AIBehavior {
  type: 'aggressive' | 'defensive' | 'patrol' | 'kamikaze' | 'support';
  aggressiveness: number; // 0-1
  accuracy: number; // 0-1
  reactionTime: number; // milliseconds
  preferredRange: number; // distance units
  flightPattern: 'direct' | 'circle' | 'zigzag' | 'evasive';
}

export interface AIState {
  currentTarget: BattleShip | null;
  lastTargetUpdate: number;
  currentWaypoint: THREE.Vector3 | null;
  lastFireTime: number;
  evasionVector: THREE.Vector3;
  patrolCenter: THREE.Vector3;
  patrolRadius: number;
  isEvading: boolean;
  lastDamageTime: number;
}

export interface AIShip extends BattleShip {
  aiBehavior: AIBehavior;
  aiState: AIState;
}

@Injectable({
  providedIn: 'root'
})
export class AISystemService {
  private aiShips: Map<string, AIShip> = new Map();
  private playerShip: BattleShip | null = null;

  /**
   * Register a ship with AI
   */
  registerAIShip(ship: BattleShip, behaviorType: AIBehavior['type'] = 'aggressive'): AIShip {
    const aiBehavior = this.createAIBehavior(behaviorType);
    const aiState = this.createInitialAIState(ship);
    
    const aiShip: AIShip = {
      ...ship,
      aiBehavior,
      aiState
    };

    this.aiShips.set(ship.id, aiShip);
    return aiShip;
  }

  /**
   * Set player ship reference
   */
  setPlayerShip(ship: BattleShip): void {
    this.playerShip = ship;
  }

  /**
   * Update all AI ships
   */
  updateAI(deltaTime: number, allShips: BattleShip[]): void {
    if (!this.playerShip) return;

    this.aiShips.forEach((aiShip) => {
      if (aiShip.isDestroyed) return;

      this.updateAIShip(aiShip, deltaTime, allShips);
    });
  }

  /**
   * Create AI behavior based on type
   */
  private createAIBehavior(type: AIBehavior['type']): AIBehavior {
    switch (type) {
      case 'aggressive':
        return {
          type: 'aggressive',
          aggressiveness: 0.8,
          accuracy: 0.7,
          reactionTime: 300,
          preferredRange: 15,
          flightPattern: 'direct'
        };
      
      case 'defensive':
        return {
          type: 'defensive',
          aggressiveness: 0.4,
          accuracy: 0.8,
          reactionTime: 200,
          preferredRange: 25,
          flightPattern: 'evasive'
        };
      
      case 'patrol':
        return {
          type: 'patrol',
          aggressiveness: 0.6,
          accuracy: 0.6,
          reactionTime: 500,
          preferredRange: 20,
          flightPattern: 'circle'
        };
      
      case 'kamikaze':
        return {
          type: 'kamikaze',
          aggressiveness: 1.0,
          accuracy: 0.5,
          reactionTime: 100,
          preferredRange: 5,
          flightPattern: 'direct'
        };
      
      case 'support':
        return {
          type: 'support',
          aggressiveness: 0.3,
          accuracy: 0.9,
          reactionTime: 400,
          preferredRange: 30,
          flightPattern: 'evasive'
        };
      
      default:
        return this.createAIBehavior('aggressive');
    }
  }

  /**
   * Create initial AI state
   */
  private createInitialAIState(ship: BattleShip): AIState {
    return {
      currentTarget: null,
      lastTargetUpdate: 0,
      currentWaypoint: null,
      lastFireTime: 0,
      evasionVector: new THREE.Vector3(),
      patrolCenter: ship.starship3D.model.position.clone(),
      patrolRadius: 20,
      isEvading: false,
      lastDamageTime: 0
    };
  }

  /**
   * Update individual AI ship
   */
  private updateAIShip(aiShip: AIShip, deltaTime: number, allShips: BattleShip[]): void {
    const currentTime = Date.now();
    
    // Update target
    this.updateTarget(aiShip, currentTime, allShips);
    
    // Update movement
    this.updateMovement(aiShip, deltaTime);
    
    // Update combat
    this.updateCombat(aiShip, currentTime);
    
    // Update evasion
    this.updateEvasion(aiShip, deltaTime);
  }

  /**
   * Update AI target selection
   */
  private updateTarget(aiShip: AIShip, currentTime: number, allShips: BattleShip[]): void {
    // Update target every 500ms or if current target is destroyed
    if (currentTime - aiShip.aiState.lastTargetUpdate < 500 && 
        aiShip.aiState.currentTarget && 
        !aiShip.aiState.currentTarget.isDestroyed) {
      return;
    }

    aiShip.aiState.lastTargetUpdate = currentTime;
    
    // Find best target
    const potentialTargets = allShips.filter(ship => 
      !ship.isDestroyed && 
      ship.id !== aiShip.id && 
      ship.isPlayer !== aiShip.isPlayer
    );

    if (potentialTargets.length === 0) {
      aiShip.aiState.currentTarget = null;
      return;
    }

    // Select target based on behavior
    let bestTarget: BattleShip | null = null;
    let bestScore = -1;

    potentialTargets.forEach(target => {
      const distance = aiShip.starship3D.model.position.distanceTo(target.starship3D.model.position);
      const healthRatio = target.health / target.maxHealth;
      
      let score = 0;
      
      switch (aiShip.aiBehavior.type) {
        case 'aggressive':
        case 'kamikaze':
          // Prefer closer, weaker targets
          score = (1 / (distance + 1)) * (1 - healthRatio + 0.5);
          break;
        
        case 'defensive':
        case 'support':
          // Prefer targets that are threatening allies
          score = (1 / (distance + 1)) * (target.isPlayer ? 2 : 1);
          break;
        
        case 'patrol':
          // Prefer targets within patrol area
          const distanceFromPatrol = target.starship3D.model.position.distanceTo(aiShip.aiState.patrolCenter);
          score = distanceFromPatrol < aiShip.aiState.patrolRadius ? (1 / (distance + 1)) : 0;
          break;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    });

    aiShip.aiState.currentTarget = bestTarget;
  }

  /**
   * Update AI movement
   */
  private updateMovement(aiShip: AIShip, deltaTime: number): void {
    if (!aiShip.aiState.currentTarget) {
      this.performPatrolMovement(aiShip, deltaTime);
      return;
    }

    const targetPosition = aiShip.aiState.currentTarget.starship3D.model.position;
    const shipPosition = aiShip.starship3D.model.position;
    const distance = shipPosition.distanceTo(targetPosition);

    // Calculate desired position based on behavior
    let desiredPosition: THREE.Vector3;

    switch (aiShip.aiBehavior.flightPattern) {
      case 'direct':
        desiredPosition = this.calculateDirectApproach(aiShip, targetPosition, distance);
        break;
      
      case 'circle':
        desiredPosition = this.calculateCircleApproach(aiShip, targetPosition, distance);
        break;
      
      case 'zigzag':
        desiredPosition = this.calculateZigzagApproach(aiShip, targetPosition, distance);
        break;
      
      case 'evasive':
        desiredPosition = this.calculateEvasiveApproach(aiShip, targetPosition, distance);
        break;
      
      default:
        desiredPosition = targetPosition.clone();
    }

    // Apply movement forces
    this.applyMovementForces(aiShip, desiredPosition, deltaTime);
  }

  /**
   * Calculate direct approach movement
   */
  private calculateDirectApproach(aiShip: AIShip, targetPosition: THREE.Vector3, distance: number): THREE.Vector3 {
    const preferredRange = aiShip.aiBehavior.preferredRange;
    
    if (distance > preferredRange) {
      // Move towards target
      return targetPosition.clone();
    } else if (distance < preferredRange * 0.7) {
      // Move away from target
      const direction = aiShip.starship3D.model.position.clone().sub(targetPosition).normalize();
      return aiShip.starship3D.model.position.clone().add(direction.multiplyScalar(preferredRange));
    } else {
      // Maintain current position
      return aiShip.starship3D.model.position.clone();
    }
  }

  /**
   * Calculate circle approach movement
   */
  private calculateCircleApproach(aiShip: AIShip, targetPosition: THREE.Vector3, distance: number): THREE.Vector3 {
    const preferredRange = aiShip.aiBehavior.preferredRange;
    const time = Date.now() * 0.001;
    const angle = time + aiShip.id.charCodeAt(0); // Unique angle per ship
    
    const circlePosition = new THREE.Vector3(
      targetPosition.x + Math.cos(angle) * preferredRange,
      targetPosition.y + Math.sin(angle * 0.5) * (preferredRange * 0.3),
      targetPosition.z + Math.sin(angle) * preferredRange
    );
    
    return circlePosition;
  }

  /**
   * Calculate zigzag approach movement
   */
  private calculateZigzagApproach(aiShip: AIShip, targetPosition: THREE.Vector3, distance: number): THREE.Vector3 {
    const time = Date.now() * 0.002;
    const zigzagOffset = Math.sin(time + aiShip.id.charCodeAt(0)) * 5;
    
    const direction = targetPosition.clone().sub(aiShip.starship3D.model.position).normalize();
    const perpendicular = new THREE.Vector3(-direction.z, direction.y, direction.x);
    
    return targetPosition.clone().add(perpendicular.multiplyScalar(zigzagOffset));
  }

  /**
   * Calculate evasive approach movement
   */
  private calculateEvasiveApproach(aiShip: AIShip, targetPosition: THREE.Vector3, distance: number): THREE.Vector3 {
    const preferredRange = aiShip.aiBehavior.preferredRange;
    
    // If taking damage recently, evade more aggressively
    const timeSinceLastDamage = Date.now() - aiShip.aiState.lastDamageTime;
    const evasionMultiplier = timeSinceLastDamage < 2000 ? 2 : 1;
    
    const evasionRadius = 10 * evasionMultiplier;
    const time = Date.now() * 0.003;
    
    const evasionOffset = new THREE.Vector3(
      Math.sin(time) * evasionRadius,
      Math.cos(time * 1.3) * evasionRadius * 0.5,
      Math.cos(time * 0.7) * evasionRadius
    );
    
    return targetPosition.clone().add(evasionOffset);
  }

  /**
   * Perform patrol movement when no target
   */
  private performPatrolMovement(aiShip: AIShip, deltaTime: number): void {
    const time = Date.now() * 0.001;
    const patrolAngle = time * 0.5 + aiShip.id.charCodeAt(0);
    
    const patrolPosition = new THREE.Vector3(
      aiShip.aiState.patrolCenter.x + Math.cos(patrolAngle) * aiShip.aiState.patrolRadius,
      aiShip.aiState.patrolCenter.y + Math.sin(patrolAngle * 0.3) * (aiShip.aiState.patrolRadius * 0.2),
      aiShip.aiState.patrolCenter.z + Math.sin(patrolAngle) * aiShip.aiState.patrolRadius
    );
    
    this.applyMovementForces(aiShip, patrolPosition, deltaTime);
  }

  /**
   * Apply movement forces to ship
   */
  private applyMovementForces(aiShip: AIShip, targetPosition: THREE.Vector3, deltaTime: number): void {
    const shipPosition = aiShip.starship3D.model.position;
    const direction = targetPosition.clone().sub(shipPosition).normalize();
    
    // Apply some randomness based on AI accuracy
    const accuracy = aiShip.aiBehavior.accuracy;
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * (1 - accuracy),
      (Math.random() - 0.5) * (1 - accuracy),
      (Math.random() - 0.5) * (1 - accuracy)
    );
    
    direction.add(randomOffset).normalize();
    
    // Calculate force magnitude based on distance and behavior
    const distance = shipPosition.distanceTo(targetPosition);
    const maxForce = 30;
    const forceMagnitude = Math.min(maxForce, distance * 2);
    
    const force = direction.multiplyScalar(forceMagnitude);
    
    // Apply force to physics body
    aiShip.physicsBody.force.set(force.x, force.y, force.z);
    
    // Apply rotation to face movement direction
    const lookDirection = direction.clone();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      lookDirection
    );
    
    // Smooth rotation
    const currentQuaternion = aiShip.starship3D.model.quaternion;
    currentQuaternion.slerp(targetQuaternion, deltaTime * 2);
  }

  /**
   * Update AI combat behavior
   */
  private updateCombat(aiShip: AIShip, currentTime: number): void {
    if (!aiShip.aiState.currentTarget) return;
    
    const distance = aiShip.starship3D.model.position.distanceTo(
      aiShip.aiState.currentTarget.starship3D.model.position
    );
    
    // Check if target is in range and we can fire
    const primaryWeapon = aiShip.weapons.find(w => w.id === 'primary');
    if (!primaryWeapon) return;
    
    const canFire = currentTime - aiShip.aiState.lastFireTime > primaryWeapon.cooldown;
    const inRange = distance <= primaryWeapon.range;
    const hasEnergy = aiShip.energy >= primaryWeapon.energyCost;
    
    if (canFire && inRange && hasEnergy) {
      // Calculate firing probability based on behavior
      const reactionDelay = currentTime - aiShip.aiState.lastTargetUpdate;
      const hasReacted = reactionDelay > aiShip.aiBehavior.reactionTime;
      
      if (hasReacted) {
        const fireChance = aiShip.aiBehavior.aggressiveness * aiShip.aiBehavior.accuracy;
        
        if (Math.random() < fireChance) {
          this.fireAtTarget(aiShip, currentTime);
        }
      }
    }
  }

  /**
   * Fire weapon at current target
   */
  private fireAtTarget(aiShip: AIShip, currentTime: number): void {
    if (!aiShip.aiState.currentTarget) return;
    
    // Calculate lead target position for better accuracy
    const targetPosition = this.calculateLeadTarget(aiShip, aiShip.aiState.currentTarget);
    
    // Fire weapon (this would need to be connected to the battle service)
    aiShip.aiState.lastFireTime = currentTime;
    
    // Emit fire event (to be handled by battle service)
    this.onAIFireWeapon?.(aiShip, 'primary', targetPosition);
  }

  /**
   * Calculate lead target position for projectile interception
   */
  private calculateLeadTarget(aiShip: AIShip, target: BattleShip): THREE.Vector3 {
    const weapon = aiShip.weapons.find(w => w.id === 'primary');
    if (!weapon) return target.starship3D.model.position.clone();
    
    const targetPosition = target.starship3D.model.position;
    const targetVelocity = target.physicsBody.velocity;
    const projectileSpeed = weapon.projectileSpeed;
    
    const distance = aiShip.starship3D.model.position.distanceTo(targetPosition);
    const timeToTarget = distance / projectileSpeed;
    
    // Predict where target will be
    const predictedPosition = targetPosition.clone().add(
      new THREE.Vector3(
        targetVelocity.x * timeToTarget,
        targetVelocity.y * timeToTarget,
        targetVelocity.z * timeToTarget
      )
    );
    
    // Add some inaccuracy based on AI accuracy
    const inaccuracy = (1 - aiShip.aiBehavior.accuracy) * 5;
    predictedPosition.add(new THREE.Vector3(
      (Math.random() - 0.5) * inaccuracy,
      (Math.random() - 0.5) * inaccuracy,
      (Math.random() - 0.5) * inaccuracy
    ));
    
    return predictedPosition;
  }

  /**
   * Update evasion behavior
   */
  private updateEvasion(aiShip: AIShip, deltaTime: number): void {
    // Check if ship should evade (low health, recent damage, etc.)
    const healthRatio = aiShip.health / aiShip.maxHealth;
    const timeSinceLastDamage = Date.now() - aiShip.aiState.lastDamageTime;
    
    const shouldEvade = healthRatio < 0.3 || timeSinceLastDamage < 1000;
    
    if (shouldEvade && !aiShip.aiState.isEvading) {
      aiShip.aiState.isEvading = true;
      // Generate random evasion vector
      aiShip.aiState.evasionVector = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      );
    } else if (!shouldEvade && aiShip.aiState.isEvading) {
      aiShip.aiState.isEvading = false;
    }
  }

  /**
   * Notify AI that ship took damage
   */
  notifyDamage(shipId: string): void {
    const aiShip = this.aiShips.get(shipId);
    if (aiShip) {
      aiShip.aiState.lastDamageTime = Date.now();
    }
  }

  /**
   * Remove AI ship
   */
  removeAIShip(shipId: string): void {
    this.aiShips.delete(shipId);
  }

  /**
   * Get all AI ships
   */
  getAIShips(): AIShip[] {
    return Array.from(this.aiShips.values());
  }

  /**
   * Callback for AI weapon firing (to be set by battle service)
   */
  onAIFireWeapon?: (ship: AIShip, weaponId: string, target: THREE.Vector3) => void;
}
