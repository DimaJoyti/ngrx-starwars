import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ModelLoaderService } from './model-loader.service';
import { AnimationService } from './animation.service';
import { Starship } from '../../characters/models/starship';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Starship3D {
  id: string;
  name: string;
  model: THREE.Group;
  data: Starship;
  stats: StarshipStats;
  customization: StarshipCustomization;
  animations: StarshipAnimations;
}

export interface StarshipStats {
  length: number;
  speed: number;
  firepower: number;
  shields: number;
  maneuverability: number;
  hyperdriveRating: number;
}

export interface StarshipCustomization {
  primaryColor: number;
  secondaryColor: number;
  engineGlow: number;
  weaponType: 'laser' | 'ion' | 'turbolaser';
  shieldEffect: boolean;
  engineTrails: boolean;
}

export interface StarshipAnimations {
  idle: THREE.AnimationAction | null;
  flying: THREE.AnimationAction | null;
  attacking: THREE.AnimationAction | null;
  hyperdrive: THREE.AnimationAction | null;
}

@Injectable({
  providedIn: 'root'
})
export class Starship3DService {
  private starshipCache = new Map<string, Starship3D>();
  private starshipTemplates = new Map<string, THREE.Group>();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();

  constructor(
    private modelLoader: ModelLoaderService,
    private animationService: AnimationService
  ) {
    this.initializeStarshipTemplates();
  }

  /**
   * Ініціалізація шаблонів кораблів
   */
  private initializeStarshipTemplates(): void {
    // Створення базових шаблонів для різних класів кораблів
    this.createFighterTemplate();
    this.createFreighterTemplate();
    this.createDestroyerTemplate();
    this.createCorvetteTemplate();
    this.createBattlestationTemplate();
  }

  /**
   * Створює 3D модель корабля на основі даних SWAPI
   */
  createStarship3D(starshipData: Starship): Observable<Starship3D> {
    return new Observable(observer => {
      const starshipId = this.generateStarshipId(starshipData);

      // Перевірка кешу
      const cached = this.starshipCache.get(starshipId);
      if (cached) {
        observer.next(this.cloneStarship3D(cached));
        observer.complete();
        return;
      }

      this.loadingSubject.next(true);

      // Спочатку перевіряємо, чи це відомий корабель
      const specificShip = this.getSpecificShipTemplate(starshipData.name);
      let template: THREE.Group | undefined;
      let starshipClass: string;

      if (specificShip) {
        template = specificShip.template;
        starshipClass = specificShip.class;
      } else {
        // Визначення типу корабля та створення моделі
        starshipClass = this.getStarshipClass(starshipData.starship_class);
        template = this.getStarshipTemplate(starshipClass);
      }

      if (template) {
        const model = template.clone();
        const stats = this.calculateStarshipStats(starshipData);
        const customization = this.getDefaultCustomization(starshipClass);

        // Застосування кастомізації
        this.applyCustomization(model, customization);

        // Створення анімацій
        const animations = this.createStarshipAnimations(model, starshipClass);

        const starship3D: Starship3D = {
          id: starshipId,
          name: starshipData.name,
          model,
          data: starshipData,
          stats,
          customization,
          animations
        };

        // Кешування
        this.starshipCache.set(starshipId, starship3D);

        this.loadingSubject.next(false);
        observer.next(this.cloneStarship3D(starship3D));
        observer.complete();
      } else {
        this.loadingSubject.next(false);
        observer.error(new Error(`Unknown starship class: ${starshipData.starship_class}`));
      }
    });
  }

  /**
   * Створює шаблон винищувача (X-wing style)
   */
  private createFighterTemplate(): void {
    const group = new THREE.Group();

    // Покращені матеріали
    const hullMaterial = this.createMetallicMaterial(0xcccccc, 0.3, 0.7);
    const wingMaterial = this.createMetallicMaterial(0x999999, 0.4, 0.6);
    const engineMaterial = this.createMetallicMaterial(0x444444, 0.2, 0.8);
    const cockpitMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });

    // Основний корпус (більш деталізований)
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.25, 1.8, 8);
    const body = new THREE.Mesh(bodyGeometry, hullMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Носова частина
    const noseGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const nose = new THREE.Mesh(noseGeometry, hullMaterial);
    nose.position.set(0, 0, 1.1);
    nose.rotation.x = Math.PI / 2;
    group.add(nose);

    // Кокпіт
    const cockpitGeometry = new THREE.SphereGeometry(0.2, 8, 6);
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.1, 0.3);
    cockpit.scale.set(1, 0.8, 1.2);
    group.add(cockpit);

    // X-wing крила (4 крила)
    const wingGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.25);

    // Верхні крила
    const topLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    topLeftWing.position.set(-0.6, 0.3, -0.2);
    topLeftWing.rotation.z = Math.PI / 6;
    group.add(topLeftWing);

    const topRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    topRightWing.position.set(0.6, 0.3, -0.2);
    topRightWing.rotation.z = -Math.PI / 6;
    group.add(topRightWing);

    // Нижні крила
    const bottomLeftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    bottomLeftWing.position.set(-0.6, -0.3, -0.2);
    bottomLeftWing.rotation.z = -Math.PI / 6;
    group.add(bottomLeftWing);

    const bottomRightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    bottomRightWing.position.set(0.6, -0.3, -0.2);
    bottomRightWing.rotation.z = Math.PI / 6;
    group.add(bottomRightWing);

    // Лазерні гармати на кінцях крил
    this.addLaserCannons(group, [
      new THREE.Vector3(-1, 0.4, -0.2),
      new THREE.Vector3(1, 0.4, -0.2),
      new THREE.Vector3(-1, -0.4, -0.2),
      new THREE.Vector3(1, -0.4, -0.2)
    ]);

    // Двигуни (4 двигуни для X-wing)
    const engineGeometry = new THREE.CylinderGeometry(0.06, 0.1, 0.3, 6);

    const engines = [
      { pos: new THREE.Vector3(-0.8, 0.35, -0.7), wing: topLeftWing },
      { pos: new THREE.Vector3(0.8, 0.35, -0.7), wing: topRightWing },
      { pos: new THREE.Vector3(-0.8, -0.35, -0.7), wing: bottomLeftWing },
      { pos: new THREE.Vector3(0.8, -0.35, -0.7), wing: bottomRightWing }
    ];

    engines.forEach(engineData => {
      const engine = new THREE.Mesh(engineGeometry, engineMaterial);
      engine.position.copy(engineData.pos);
      engine.rotation.x = Math.PI / 2;
      group.add(engine);
    });

    // Покращене світіння двигунів
    this.addAdvancedEngineGlow(group, engines.map(e => e.pos));

    // Додаткові деталі
    this.addShipDetails(group, 'fighter');

    group.userData = { type: 'starship', class: 'fighter' };
    this.starshipTemplates.set('fighter', group);
  }

  /**
   * Створює шаблон вантажного корабля (Millennium Falcon style)
   */
  private createFreighterTemplate(): void {
    const group = new THREE.Group();

    // Покращені матеріали
    const hullMaterial = this.createMetallicMaterial(0xaaaaaa, 0.4, 0.6);
    const detailMaterial = this.createMetallicMaterial(0x888888, 0.3, 0.7);
    const engineMaterial = this.createMetallicMaterial(0x444444, 0.2, 0.8);
    const cockpitMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });

    // Основний круглий корпус (як у Millennium Falcon)
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16);
    const body = new THREE.Mesh(bodyGeometry, hullMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Передня "мандибула" частина
    const mandibleGeometry = new THREE.BoxGeometry(0.4, 0.2, 1.2);
    const leftMandible = new THREE.Mesh(mandibleGeometry, hullMaterial);
    leftMandible.position.set(-0.3, 0, 0.8);
    group.add(leftMandible);

    const rightMandible = new THREE.Mesh(mandibleGeometry, hullMaterial);
    rightMandible.position.set(0.3, 0, 0.8);
    group.add(rightMandible);

    // Кокпіт збоку (як у Millennium Falcon)
    const cockpitGeometry = new THREE.SphereGeometry(0.15, 8, 6);
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0.6, 0.1, 0.2);
    cockpit.scale.set(1.2, 0.8, 1);
    group.add(cockpit);

    // Радарна антена
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
    const antennaMaterial = this.createMetallicMaterial(0x666666, 0.1, 0.9);
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 0.25, 0);
    group.add(antenna);

    // Антенна тарілка
    const dishGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
    const dish = new THREE.Mesh(dishGeometry, antennaMaterial);
    dish.position.set(0, 0.35, 0);
    group.add(dish);

    // Бічні двигуни (як у Millennium Falcon)
    const engineGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.4);

    const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    leftEngine.position.set(-0.7, 0, -0.6);
    group.add(leftEngine);

    const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    rightEngine.position.set(0.7, 0, -0.6);
    group.add(rightEngine);

    // Сопла двигунів
    const nozzleGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.15, 6);

    const leftNozzle = new THREE.Mesh(nozzleGeometry, engineMaterial);
    leftNozzle.position.set(-0.7, 0, -0.85);
    leftNozzle.rotation.x = Math.PI / 2;
    group.add(leftNozzle);

    const rightNozzle = new THREE.Mesh(nozzleGeometry, engineMaterial);
    rightNozzle.position.set(0.7, 0, -0.85);
    rightNozzle.rotation.x = Math.PI / 2;
    group.add(rightNozzle);

    // Деталі на корпусі
    this.addFreighterDetails(group);

    // Покращене світіння двигунів
    this.addAdvancedEngineGlow(group, [
      new THREE.Vector3(-0.7, 0, -0.95),
      new THREE.Vector3(0.7, 0, -0.95)
    ]);

    // Додаткові деталі
    this.addShipDetails(group, 'freighter');

    group.userData = { type: 'starship', class: 'freighter' };
    this.starshipTemplates.set('freighter', group);
  }

  /**
   * Створює шаблон знищувача
   */
  private createDestroyerTemplate(): void {
    const group = new THREE.Group();
    
    // Основний корпус (трикутна форма)
    const bodyGeometry = new THREE.ConeGeometry(1.5, 4, 3);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Командний міст
    const bridgeGeometry = new THREE.BoxGeometry(0.8, 0.3, 1);
    const bridgeMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(0, 0.8, 0.5);
    group.add(bridge);

    // Турболазерні башти
    for (let i = 0; i < 6; i++) {
      const turretGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
      const turretMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const turret = new THREE.Mesh(turretGeometry, turretMaterial);
      
      const angle = (i / 6) * Math.PI * 2;
      turret.position.set(
        Math.cos(angle) * 0.8,
        Math.sin(angle) * 0.8,
        (i % 2) * 0.5
      );
      group.add(turret);
    }

    // Двигуни
    const engineGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    for (let i = 0; i < 3; i++) {
      const engine = new THREE.Mesh(engineGeometry, engineMaterial);
      const angle = (i / 3) * Math.PI * 2;
      engine.position.set(
        Math.cos(angle) * 0.8,
        Math.sin(angle) * 0.8,
        -2.2
      );
      engine.rotation.x = Math.PI / 2;
      group.add(engine);
    }

    this.addEngineGlow(group, [
      new THREE.Vector3(0.8, 0, -2.7),
      new THREE.Vector3(-0.4, 0.7, -2.7),
      new THREE.Vector3(-0.4, -0.7, -2.7)
    ]);

    group.userData = { type: 'starship', class: 'destroyer' };
    this.starshipTemplates.set('destroyer', group);
  }

  /**
   * Створює шаблон корвета
   */
  private createCorvetteTemplate(): void {
    const group = new THREE.Group();
    
    // Основний корпус
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 2.5, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Бічні стабілізатори
    const stabGeometry = new THREE.BoxGeometry(0.2, 1.2, 0.8);
    const stabMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    
    const leftStab = new THREE.Mesh(stabGeometry, stabMaterial);
    leftStab.position.set(-0.6, 0, -0.5);
    group.add(leftStab);

    const rightStab = new THREE.Mesh(stabGeometry, stabMaterial);
    rightStab.position.set(0.6, 0, -0.5);
    group.add(rightStab);

    // Двигуни
    const engineGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.5, 6);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(0, 0, -1.5);
    engine.rotation.x = Math.PI / 2;
    group.add(engine);

    this.addEngineGlow(group, [new THREE.Vector3(0, 0, -1.8)]);

    group.userData = { type: 'starship', class: 'corvette' };
    this.starshipTemplates.set('corvette', group);
  }

  /**
   * Створює шаблон бойової станції
   */
  private createBattlestationTemplate(): void {
    const group = new THREE.Group();
    
    // Основна сфера
    const bodyGeometry = new THREE.SphereGeometry(2, 16, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Супер лазер
    const laserGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 8);
    const laserMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.set(0, 0, 2.5);
    laser.rotation.x = Math.PI / 2;
    group.add(laser);

    // Поверхневі деталі
    for (let i = 0; i < 20; i++) {
      const detailGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
      const detailMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const detail = new THREE.Mesh(detailGeometry, detailMaterial);
      
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 2.1;
      
      detail.position.set(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
      );
      group.add(detail);
    }

    group.userData = { type: 'starship', class: 'battlestation' };
    this.starshipTemplates.set('battlestation', group);
  }

  /**
   * Створює металевий матеріал з відблисками
   */
  private createMetallicMaterial(color: number, roughness: number = 0.3, metalness: number = 0.7): THREE.MeshPhongMaterial {
    return new THREE.MeshPhongMaterial({
      color: color,
      shininess: 100 * (1 - roughness),
      specular: new THREE.Color(0x444444),
      reflectivity: metalness
    });
  }

  /**
   * Додає лазерні гармати
   */
  private addLaserCannons(group: THREE.Group, positions: THREE.Vector3[]): void {
    const cannonMaterial = this.createMetallicMaterial(0x333333, 0.2, 0.8);

    positions.forEach(position => {
      const cannonGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.15, 6);
      const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
      cannon.position.copy(position);
      cannon.rotation.x = Math.PI / 2;
      group.add(cannon);

      // Додаємо червоне світло для лазерних гармат
      const cannonLight = new THREE.PointLight(0xff0000, 0.2, 1);
      cannonLight.position.copy(position);
      cannonLight.position.z += 0.1;
      group.add(cannonLight);
    });
  }

  /**
   * Покращене світіння двигунів з частинками
   */
  private addAdvancedEngineGlow(group: THREE.Group, positions: THREE.Vector3[]): void {
    positions.forEach((position, index) => {
      // Основне світло двигуна
      const light = new THREE.PointLight(0x00aaff, 0.8, 4);
      light.position.copy(position);
      group.add(light);

      // Внутрішнє свічення
      const innerGlowGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ddff,
        transparent: true,
        opacity: 0.9
      });
      const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
      innerGlow.position.copy(position);
      group.add(innerGlow);

      // Зовнішнє свічення
      const outerGlowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.4
      });
      const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
      outerGlow.position.copy(position);
      group.add(outerGlow);

      // Анімації
      this.animationService.createPulseAnimation(`engine-inner-${index}`, innerGlow, 0.8, 1.2, 800);
      this.animationService.createPulseAnimation(`engine-outer-${index}`, outerGlow, 0.6, 1.4, 1200);
    });
  }

  /**
   * Додає світіння двигунів (стара версія для сумісності)
   */
  private addEngineGlow(group: THREE.Group, positions: THREE.Vector3[]): void {
    this.addAdvancedEngineGlow(group, positions);
  }

  /**
   * Додає деталі для вантажного корабля
   */
  private addFreighterDetails(group: THREE.Group): void {
    const detailMaterial = this.createMetallicMaterial(0x777777, 0.4, 0.6);

    // Вентиляційні решітки
    for (let i = 0; i < 8; i++) {
      const grillGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.1);
      const grill = new THREE.Mesh(grillGeometry, detailMaterial);
      const angle = (i / 8) * Math.PI * 2;
      grill.position.set(
        Math.cos(angle) * 0.75,
        Math.sin(angle) * 0.75,
        0.05
      );
      group.add(grill);
    }

    // Вантажні люки
    const hatchGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.02);
    const hatch1 = new THREE.Mesh(hatchGeometry, detailMaterial);
    hatch1.position.set(-0.3, 0, 0.16);
    group.add(hatch1);

    const hatch2 = new THREE.Mesh(hatchGeometry, detailMaterial);
    hatch2.position.set(0.3, 0, 0.16);
    group.add(hatch2);
  }

  /**
   * Додає загальні деталі корабля
   */
  private addShipDetails(group: THREE.Group, shipType: string): void {
    const detailMaterial = this.createMetallicMaterial(0x666666, 0.3, 0.8);

    // Навігаційні вогні
    this.addNavigationLights(group, shipType);

    // Антени та сенсори
    this.addSensors(group, shipType);

    // Поверхневі деталі
    this.addSurfaceDetails(group, shipType);
  }

  /**
   * Додає навігаційні вогні
   */
  private addNavigationLights(group: THREE.Group, shipType: string): void {
    // Червоний вогонь (лівий борт)
    const redLightGeometry = new THREE.SphereGeometry(0.02, 6, 6);
    const redLightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
    const redLight = new THREE.Mesh(redLightGeometry, redLightMaterial);

    // Зелений вогонь (правий борт)
    const greenLightGeometry = new THREE.SphereGeometry(0.02, 6, 6);
    const greenLightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
    const greenLight = new THREE.Mesh(greenLightGeometry, greenLightMaterial);

    if (shipType === 'fighter') {
      redLight.position.set(-0.8, 0.3, -0.2);
      greenLight.position.set(0.8, 0.3, -0.2);
    } else if (shipType === 'freighter') {
      redLight.position.set(-0.6, 0, 0.8);
      greenLight.position.set(0.6, 0, 0.8);
    } else {
      redLight.position.set(-0.5, 0, 0.5);
      greenLight.position.set(0.5, 0, 0.5);
    }

    group.add(redLight);
    group.add(greenLight);

    // Анімація миготіння
    this.animationService.createPulseAnimation(`nav-red-${shipType}`, redLight, 0.5, 1.0, 2000);
    this.animationService.createPulseAnimation(`nav-green-${shipType}`, greenLight, 0.5, 1.0, 2000);
  }

  /**
   * Додає сенсори та антени
   */
  private addSensors(group: THREE.Group, shipType: string): void {
    const sensorMaterial = this.createMetallicMaterial(0x555555, 0.2, 0.9);

    // Маленькі антени
    for (let i = 0; i < 3; i++) {
      const antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4);
      const antenna = new THREE.Mesh(antennaGeometry, sensorMaterial);
      antenna.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        0.1 + Math.random() * 0.2
      );
      group.add(antenna);
    }
  }

  /**
   * Додає поверхневі деталі
   */
  private addSurfaceDetails(group: THREE.Group, shipType: string): void {
    const detailMaterial = this.createMetallicMaterial(0x888888, 0.4, 0.5);

    // Панелі та решітки
    for (let i = 0; i < 5; i++) {
      const panelGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.01);
      const panel = new THREE.Mesh(panelGeometry, detailMaterial);
      panel.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        0.05 + Math.random() * 0.1
      );
      group.add(panel);
    }
  }

  /**
   * Визначає клас корабля
   */
  private getStarshipClass(starshipClass: string): string {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('fighter')) return 'fighter';
    if (classLower.includes('destroyer')) return 'destroyer';
    if (classLower.includes('freighter')) return 'freighter';
    if (classLower.includes('corvette')) return 'corvette';
    if (classLower.includes('battlestation')) return 'battlestation';
    return 'fighter'; // За замовчуванням
  }

  /**
   * Розпізнає конкретні кораблі та повертає спеціальні шаблони
   */
  private getSpecificShipTemplate(shipName: string): { template: THREE.Group; class: string } | null {
    const nameLower = shipName.toLowerCase();

    // X-wing
    if (nameLower.includes('x-wing') || nameLower.includes('t-65')) {
      return { template: this.createXWingTemplate(), class: 'fighter' };
    }

    // TIE Fighter
    if (nameLower.includes('tie') && nameLower.includes('fighter')) {
      return { template: this.createTIEFighterTemplate(), class: 'fighter' };
    }

    // Millennium Falcon
    if (nameLower.includes('millennium') || nameLower.includes('falcon') || nameLower.includes('yt-1300')) {
      return { template: this.createMillenniumFalconTemplate(), class: 'freighter' };
    }

    // Star Destroyer
    if (nameLower.includes('star destroyer') || nameLower.includes('imperial')) {
      return { template: this.createStarDestroyerTemplate(), class: 'destroyer' };
    }

    // Death Star
    if (nameLower.includes('death star') || nameLower.includes('ds-1')) {
      return { template: this.createDeathStarTemplate(), class: 'battlestation' };
    }

    return null;
  }

  /**
   * Створює спеціальний шаблон X-wing
   */
  private createXWingTemplate(): THREE.Group {
    const group = new THREE.Group();

    // Використовуємо покращений fighter template як основу
    const baseTemplate = this.starshipTemplates.get('fighter');
    if (baseTemplate) {
      const cloned = baseTemplate.clone();
      group.add(cloned);

      // Додаємо унікальні деталі X-wing
      const detailMaterial = this.createMetallicMaterial(0xffffff, 0.2, 0.8);

      // R2-D2 астромех дроїд
      const r2Geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8);
      const r2 = new THREE.Mesh(r2Geometry, detailMaterial);
      r2.position.set(0, 0, 0.1);
      group.add(r2);

      // Додаткові деталі на крилах
      for (let i = 0; i < 4; i++) {
        const wingDetailGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.1);
        const wingDetail = new THREE.Mesh(wingDetailGeometry, detailMaterial);
        const positions = [
          new THREE.Vector3(-0.8, 0.35, -0.1),
          new THREE.Vector3(0.8, 0.35, -0.1),
          new THREE.Vector3(-0.8, -0.35, -0.1),
          new THREE.Vector3(0.8, -0.35, -0.1)
        ];
        wingDetail.position.copy(positions[i]);
        group.add(wingDetail);
      }
    }

    return group;
  }

  /**
   * Створює спеціальний шаблон TIE Fighter
   */
  private createTIEFighterTemplate(): THREE.Group {
    const group = new THREE.Group();

    const hullMaterial = this.createMetallicMaterial(0x444444, 0.3, 0.7);
    const panelMaterial = this.createMetallicMaterial(0x222222, 0.4, 0.6);

    // Центральна кабіна (сфера)
    const cockpitGeometry = new THREE.SphereGeometry(0.3, 12, 12);
    const cockpit = new THREE.Mesh(cockpitGeometry, hullMaterial);
    group.add(cockpit);

    // Сонячні панелі (шестикутні)
    const panelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 6);

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-1.2, 0, 0);
    leftPanel.rotation.z = Math.PI / 2;
    group.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(1.2, 0, 0);
    rightPanel.rotation.z = Math.PI / 2;
    group.add(rightPanel);

    // Двигун
    const engineGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.2, 6);
    const engine = new THREE.Mesh(engineGeometry, hullMaterial);
    engine.position.set(0, 0, -0.4);
    engine.rotation.x = Math.PI / 2;
    group.add(engine);

    // Світіння двигуна
    this.addAdvancedEngineGlow(group, [new THREE.Vector3(0, 0, -0.5)]);

    return group;
  }

  /**
   * Створює спеціальний шаблон Millennium Falcon
   */
  private createMillenniumFalconTemplate(): THREE.Group {
    // Використовуємо покращений freighter template
    const baseTemplate = this.starshipTemplates.get('freighter');
    if (baseTemplate) {
      return baseTemplate.clone();
    }
    return new THREE.Group();
  }

  /**
   * Створює спеціальний шаблон Star Destroyer
   */
  private createStarDestroyerTemplate(): THREE.Group {
    // Використовуємо покращений destroyer template
    const baseTemplate = this.starshipTemplates.get('destroyer');
    if (baseTemplate) {
      return baseTemplate.clone();
    }
    return new THREE.Group();
  }

  /**
   * Створює спеціальний шаблон Death Star
   */
  private createDeathStarTemplate(): THREE.Group {
    // Використовуємо покращений battlestation template
    const baseTemplate = this.starshipTemplates.get('battlestation');
    if (baseTemplate) {
      return baseTemplate.clone();
    }
    return new THREE.Group();
  }

  /**
   * Отримує шаблон корабля
   */
  private getStarshipTemplate(starshipClass: string): THREE.Group | undefined {
    return this.starshipTemplates.get(starshipClass);
  }

  /**
   * Розраховує характеристики корабля
   */
  private calculateStarshipStats(starshipData: Starship): StarshipStats {
    const length = this.parseNumericValue(starshipData.length);
    const speed = this.parseNumericValue(starshipData.max_atmosphering_speed);
    const hyperdriveRating = this.parseNumericValue(starshipData.hyperdrive_rating);

    return {
      length: length || 10,
      speed: Math.min(100, (speed || 500) / 10),
      firepower: this.calculateFirepower(starshipData.starship_class),
      shields: this.calculateShields(starshipData.starship_class),
      maneuverability: this.calculateManeuverability(starshipData.starship_class),
      hyperdriveRating: hyperdriveRating || 2
    };
  }

  /**
   * Парсить числове значення з рядка
   */
  private parseNumericValue(value: string): number | null {
    if (!value || value === 'unknown' || value === 'n/a') return null;
    const parsed = parseFloat(value.replace(/,/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Розраховує вогневу міць
   */
  private calculateFirepower(starshipClass: string): number {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('battlestation')) return 100;
    if (classLower.includes('destroyer')) return 85;
    if (classLower.includes('corvette')) return 60;
    if (classLower.includes('fighter')) return 40;
    if (classLower.includes('freighter')) return 20;
    return 50;
  }

  /**
   * Розраховує щити
   */
  private calculateShields(starshipClass: string): number {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('battlestation')) return 100;
    if (classLower.includes('destroyer')) return 90;
    if (classLower.includes('corvette')) return 70;
    if (classLower.includes('freighter')) return 60;
    if (classLower.includes('fighter')) return 30;
    return 50;
  }

  /**
   * Розраховує маневреність
   */
  private calculateManeuverability(starshipClass: string): number {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('fighter')) return 90;
    if (classLower.includes('corvette')) return 70;
    if (classLower.includes('freighter')) return 40;
    if (classLower.includes('destroyer')) return 30;
    if (classLower.includes('battlestation')) return 10;
    return 50;
  }

  /**
   * Отримує кастомізацію за замовчуванням
   */
  private getDefaultCustomization(starshipClass: string): StarshipCustomization {
    const colors = {
      fighter: { primary: 0x888888, secondary: 0x666666 },
      freighter: { primary: 0x999999, secondary: 0x777777 },
      destroyer: { primary: 0x666666, secondary: 0x555555 },
      corvette: { primary: 0x777777, secondary: 0x666666 },
      battlestation: { primary: 0x555555, secondary: 0x444444 }
    };

    const colorScheme = colors[starshipClass as keyof typeof colors] || colors.fighter;

    return {
      primaryColor: colorScheme.primary,
      secondaryColor: colorScheme.secondary,
      engineGlow: 0x00aaff,
      weaponType: 'laser',
      shieldEffect: true,
      engineTrails: true
    };
  }

  /**
   * Застосовує кастомізацію до моделі
   */
  private applyCustomization(model: THREE.Group, customization: StarshipCustomization): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
        // Застосування кольорів
        if (child.material.color.getHex() === 0x888888) {
          child.material.color.setHex(customization.primaryColor);
        } else if (child.material.color.getHex() === 0x666666) {
          child.material.color.setHex(customization.secondaryColor);
        }
      }
    });
  }

  /**
   * Створює анімації для корабля
   */
  private createStarshipAnimations(model: THREE.Group, starshipClass: string): StarshipAnimations {
    // Базова анімація обертання
    this.animationService.createRotationAnimation(`${starshipClass}-idle`, model, 'y', 0.1);

    return {
      idle: null,
      flying: null,
      attacking: null,
      hyperdrive: null
    };
  }

  /**
   * Генерує унікальний ID корабля
   */
  private generateStarshipId(starshipData: Starship): string {
    return `starship-${starshipData.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Клонує 3D корабель
   */
  private cloneStarship3D(original: Starship3D): Starship3D {
    return {
      ...original,
      model: original.model.clone(),
      stats: { ...original.stats },
      customization: { ...original.customization },
      animations: { ...original.animations }
    };
  }

  /**
   * Очищує кеш
   */
  clearCache(): void {
    this.starshipCache.clear();
  }

  /**
   * Отримує розмір кешу
   */
  getCacheSize(): number {
    return this.starshipCache.size;
  }
}
