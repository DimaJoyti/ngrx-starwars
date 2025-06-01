import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BehaviorSubject } from 'rxjs';

export interface AdvancedWeapon {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;
  range: number;
  cooldown: number;
  energyCost: number;
  projectileSpeed: number;
  projectileCount: number;
  spread: number;
  penetration: number;
  explosionRadius: number;
  homing: boolean;
  chargeTime: number;
  burstCount: number;
  burstDelay: number;
  reloadTime: number;
  ammoCapacity: number;
  currentAmmo: number;
  lastFired: number;
  isCharging: boolean;
  chargeStartTime: number;
  level: number;
  experience: number;
  maxLevel: number;
}

export type WeaponType = 
  | 'laser_cannon'
  | 'plasma_rifle'
  | 'missile_launcher'
  | 'railgun'
  | 'ion_cannon'
  | 'photon_torpedo'
  | 'pulse_laser'
  | 'beam_weapon'
  | 'flak_cannon'
  | 'gravity_bomb';

export interface WeaponUpgrade {
  type: 'damage' | 'range' | 'cooldown' | 'energy' | 'ammo' | 'special';
  value: number;
  cost: number;
  description: string;
}

export interface ProjectileEffect {
  type: 'explosion' | 'emp' | 'pierce' | 'chain' | 'gravity';
  radius: number;
  duration: number;
  damage: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeaponSystemService {
  private weapons: Map<string, AdvancedWeapon> = new Map();
  private weaponTemplates: Map<WeaponType, Partial<AdvancedWeapon>> = new Map();
  
  private weaponsSubject = new BehaviorSubject<AdvancedWeapon[]>([]);
  public weapons$ = this.weaponsSubject.asObservable();

  constructor() {
    this.initializeWeaponTemplates();
  }

  /**
   * Initialize weapon templates
   */
  private initializeWeaponTemplates(): void {
    this.weaponTemplates.set('laser_cannon', {
      name: 'Laser Cannon',
      type: 'laser_cannon',
      damage: 25,
      range: 50,
      cooldown: 300,
      energyCost: 10,
      projectileSpeed: 80,
      projectileCount: 1,
      spread: 0,
      penetration: 1,
      explosionRadius: 0,
      homing: false,
      chargeTime: 0,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 0,
      ammoCapacity: -1, // Unlimited
      maxLevel: 10
    });

    this.weaponTemplates.set('plasma_rifle', {
      name: 'Plasma Rifle',
      type: 'plasma_rifle',
      damage: 35,
      range: 40,
      cooldown: 500,
      energyCost: 15,
      projectileSpeed: 60,
      projectileCount: 1,
      spread: 0.1,
      penetration: 2,
      explosionRadius: 2,
      homing: false,
      chargeTime: 0,
      burstCount: 3,
      burstDelay: 100,
      reloadTime: 0,
      ammoCapacity: -1,
      maxLevel: 10
    });

    this.weaponTemplates.set('missile_launcher', {
      name: 'Missile Launcher',
      type: 'missile_launcher',
      damage: 80,
      range: 70,
      cooldown: 2000,
      energyCost: 25,
      projectileSpeed: 40,
      projectileCount: 1,
      spread: 0,
      penetration: 1,
      explosionRadius: 8,
      homing: true,
      chargeTime: 0,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 3000,
      ammoCapacity: 20,
      maxLevel: 8
    });

    this.weaponTemplates.set('railgun', {
      name: 'Railgun',
      type: 'railgun',
      damage: 150,
      range: 100,
      cooldown: 3000,
      energyCost: 50,
      projectileSpeed: 200,
      projectileCount: 1,
      spread: 0,
      penetration: 10,
      explosionRadius: 0,
      homing: false,
      chargeTime: 1500,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 0,
      ammoCapacity: -1,
      maxLevel: 5
    });

    this.weaponTemplates.set('ion_cannon', {
      name: 'Ion Cannon',
      type: 'ion_cannon',
      damage: 60,
      range: 60,
      cooldown: 1500,
      energyCost: 40,
      projectileSpeed: 70,
      projectileCount: 1,
      spread: 0,
      penetration: 1,
      explosionRadius: 5,
      homing: false,
      chargeTime: 800,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 0,
      ammoCapacity: -1,
      maxLevel: 8
    });

    this.weaponTemplates.set('photon_torpedo', {
      name: 'Photon Torpedo',
      type: 'photon_torpedo',
      damage: 200,
      range: 80,
      cooldown: 4000,
      energyCost: 75,
      projectileSpeed: 30,
      projectileCount: 1,
      spread: 0,
      penetration: 1,
      explosionRadius: 15,
      homing: true,
      chargeTime: 2000,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 5000,
      ammoCapacity: 10,
      maxLevel: 5
    });

    this.weaponTemplates.set('pulse_laser', {
      name: 'Pulse Laser',
      type: 'pulse_laser',
      damage: 15,
      range: 45,
      cooldown: 150,
      energyCost: 5,
      projectileSpeed: 100,
      projectileCount: 1,
      spread: 0,
      penetration: 1,
      explosionRadius: 0,
      homing: false,
      chargeTime: 0,
      burstCount: 5,
      burstDelay: 50,
      reloadTime: 0,
      ammoCapacity: -1,
      maxLevel: 12
    });

    this.weaponTemplates.set('beam_weapon', {
      name: 'Beam Weapon',
      type: 'beam_weapon',
      damage: 40,
      range: 60,
      cooldown: 100,
      energyCost: 20,
      projectileSpeed: 300,
      projectileCount: 1,
      spread: 0,
      penetration: 5,
      explosionRadius: 0,
      homing: false,
      chargeTime: 0,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 0,
      ammoCapacity: -1,
      maxLevel: 8
    });

    this.weaponTemplates.set('flak_cannon', {
      name: 'Flak Cannon',
      type: 'flak_cannon',
      damage: 20,
      range: 35,
      cooldown: 800,
      energyCost: 30,
      projectileSpeed: 50,
      projectileCount: 8,
      spread: 0.5,
      penetration: 1,
      explosionRadius: 3,
      homing: false,
      chargeTime: 0,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 2000,
      ammoCapacity: 50,
      maxLevel: 8
    });

    this.weaponTemplates.set('gravity_bomb', {
      name: 'Gravity Bomb',
      type: 'gravity_bomb',
      damage: 100,
      range: 50,
      cooldown: 8000,
      energyCost: 100,
      projectileSpeed: 20,
      projectileCount: 1,
      spread: 0,
      penetration: 1,
      explosionRadius: 20,
      homing: false,
      chargeTime: 3000,
      burstCount: 1,
      burstDelay: 0,
      reloadTime: 10000,
      ammoCapacity: 5,
      maxLevel: 3
    });
  }

  /**
   * Create weapon from template
   */
  createWeapon(type: WeaponType, shipId: string): AdvancedWeapon {
    const template = this.weaponTemplates.get(type);
    if (!template) {
      throw new Error(`Unknown weapon type: ${type}`);
    }

    const weapon: AdvancedWeapon = {
      id: `${shipId}-${type}-${Date.now()}`,
      ...template,
      currentAmmo: template.ammoCapacity || -1,
      lastFired: 0,
      isCharging: false,
      chargeStartTime: 0,
      level: 1,
      experience: 0
    } as AdvancedWeapon;

    this.weapons.set(weapon.id, weapon);
    this.updateWeaponsSubject();
    return weapon;
  }

  /**
   * Can weapon fire
   */
  canFire(weapon: AdvancedWeapon): boolean {
    const currentTime = Date.now();
    const cooldownPassed = currentTime - weapon.lastFired >= weapon.cooldown;
    const hasAmmo = weapon.ammoCapacity === -1 || weapon.currentAmmo > 0;
    const notCharging = !weapon.isCharging;
    
    return cooldownPassed && hasAmmo && notCharging;
  }

  /**
   * Start charging weapon
   */
  startCharging(weapon: AdvancedWeapon): boolean {
    if (weapon.chargeTime === 0 || weapon.isCharging) {
      return false;
    }

    weapon.isCharging = true;
    weapon.chargeStartTime = Date.now();
    return true;
  }

  /**
   * Stop charging weapon
   */
  stopCharging(weapon: AdvancedWeapon): void {
    weapon.isCharging = false;
    weapon.chargeStartTime = 0;
  }

  /**
   * Get charge progress (0-1)
   */
  getChargeProgress(weapon: AdvancedWeapon): number {
    if (!weapon.isCharging || weapon.chargeTime === 0) {
      return 1;
    }

    const elapsed = Date.now() - weapon.chargeStartTime;
    return Math.min(1, elapsed / weapon.chargeTime);
  }

  /**
   * Is weapon fully charged
   */
  isFullyCharged(weapon: AdvancedWeapon): boolean {
    return this.getChargeProgress(weapon) >= 1;
  }

  /**
   * Fire weapon
   */
  fireWeapon(weapon: AdvancedWeapon): boolean {
    if (!this.canFire(weapon)) {
      return false;
    }

    if (weapon.chargeTime > 0 && !this.isFullyCharged(weapon)) {
      return false;
    }

    weapon.lastFired = Date.now();
    
    if (weapon.ammoCapacity !== -1) {
      weapon.currentAmmo--;
    }

    weapon.isCharging = false;
    weapon.chargeStartTime = 0;

    // Add experience
    weapon.experience += 1;
    this.checkLevelUp(weapon);

    this.updateWeaponsSubject();
    return true;
  }

  /**
   * Reload weapon
   */
  reloadWeapon(weapon: AdvancedWeapon): void {
    if (weapon.ammoCapacity === -1) {
      return; // Unlimited ammo
    }

    weapon.currentAmmo = weapon.ammoCapacity;
    this.updateWeaponsSubject();
  }

  /**
   * Check for level up
   */
  private checkLevelUp(weapon: AdvancedWeapon): void {
    const expNeeded = weapon.level * 10;
    if (weapon.experience >= expNeeded && weapon.level < weapon.maxLevel) {
      weapon.level++;
      weapon.experience = 0;
      this.applyLevelUpBonus(weapon);
    }
  }

  /**
   * Apply level up bonuses
   */
  private applyLevelUpBonus(weapon: AdvancedWeapon): void {
    const damageBonus = weapon.level * 0.1; // 10% per level
    const cooldownReduction = weapon.level * 0.05; // 5% per level
    
    weapon.damage *= (1 + damageBonus);
    weapon.cooldown *= (1 - cooldownReduction);
    
    // Special bonuses per weapon type
    switch (weapon.type) {
      case 'laser_cannon':
        weapon.range += weapon.level * 2;
        break;
      case 'plasma_rifle':
        weapon.burstCount += Math.floor(weapon.level / 3);
        break;
      case 'missile_launcher':
        weapon.ammoCapacity += weapon.level * 2;
        break;
      case 'railgun':
        weapon.penetration += weapon.level;
        break;
      case 'pulse_laser':
        weapon.projectileSpeed += weapon.level * 5;
        break;
    }
  }

  /**
   * Get weapon by ID
   */
  getWeapon(weaponId: string): AdvancedWeapon | null {
    return this.weapons.get(weaponId) || null;
  }

  /**
   * Get all weapons
   */
  getAllWeapons(): AdvancedWeapon[] {
    return Array.from(this.weapons.values());
  }

  /**
   * Remove weapon
   */
  removeWeapon(weaponId: string): void {
    this.weapons.delete(weaponId);
    this.updateWeaponsSubject();
  }

  /**
   * Update weapons subject
   */
  private updateWeaponsSubject(): void {
    this.weaponsSubject.next(this.getAllWeapons());
  }

  /**
   * Get weapon template
   */
  getWeaponTemplate(type: WeaponType): Partial<AdvancedWeapon> | null {
    return this.weaponTemplates.get(type) || null;
  }

  /**
   * Get available weapon types
   */
  getAvailableWeaponTypes(): WeaponType[] {
    return Array.from(this.weaponTemplates.keys());
  }
}
