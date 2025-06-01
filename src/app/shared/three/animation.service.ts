import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AnimationConfig {
  duration?: number;
  loop?: boolean;
  autoStart?: boolean;
  easing?: (t: number) => number;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export interface TweenAnimation {
  id: string;
  object: THREE.Object3D;
  startValues: any;
  endValues: any;
  duration: number;
  startTime: number;
  isPlaying: boolean;
  loop: boolean;
  easing: (t: number) => number;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private mixers = new Map<string, THREE.AnimationMixer>();
  private actions = new Map<string, Map<string, THREE.AnimationAction>>();
  private tweens = new Map<string, TweenAnimation>();
  private clock = new THREE.Clock();
  
  private isAnimatingSubject = new BehaviorSubject<boolean>(false);
  public isAnimating$: Observable<boolean> = this.isAnimatingSubject.asObservable();

  constructor() {}

  /**
   * Створює міксер анімацій для об'єкта
   */
  createMixer(mixerId: string, object: THREE.Object3D): THREE.AnimationMixer {
    const mixer = new THREE.AnimationMixer(object);
    this.mixers.set(mixerId, mixer);
    this.actions.set(mixerId, new Map());
    return mixer;
  }

  /**
   * Отримує міксер за ID
   */
  getMixer(mixerId: string): THREE.AnimationMixer | undefined {
    return this.mixers.get(mixerId);
  }

  /**
   * Додає анімаційний кліп до міксера
   */
  addAnimationClip(
    mixerId: string,
    actionId: string,
    clip: THREE.AnimationClip,
    config: AnimationConfig = {}
  ): THREE.AnimationAction | null {
    const mixer = this.mixers.get(mixerId);
    if (!mixer) {
      console.error(`Animation mixer not found: ${mixerId}`);
      return null;
    }

    const action = mixer.clipAction(clip);
    
    // Налаштування анімації
    if (config.loop !== undefined) {
      action.setLoop(config.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    }

    if (config.duration !== undefined) {
      action.setDuration(config.duration);
    }

    // Збереження дії
    const mixerActions = this.actions.get(mixerId);
    if (mixerActions) {
      mixerActions.set(actionId, action);
    }

    if (config.autoStart) {
      action.play();
      this.isAnimatingSubject.next(true);
    }

    return action;
  }

  /**
   * Відтворює анімацію
   */
  playAnimation(mixerId: string, actionId: string): void {
    const mixerActions = this.actions.get(mixerId);
    const action = mixerActions?.get(actionId);
    
    if (action) {
      action.play();
      this.isAnimatingSubject.next(true);
    }
  }

  /**
   * Зупиняє анімацію
   */
  stopAnimation(mixerId: string, actionId: string): void {
    const mixerActions = this.actions.get(mixerId);
    const action = mixerActions?.get(actionId);
    
    if (action) {
      action.stop();
    }
  }

  /**
   * Призупиняє анімацію
   */
  pauseAnimation(mixerId: string, actionId: string): void {
    const mixerActions = this.actions.get(mixerId);
    const action = mixerActions?.get(actionId);
    
    if (action) {
      action.paused = true;
    }
  }

  /**
   * Відновлює анімацію
   */
  resumeAnimation(mixerId: string, actionId: string): void {
    const mixerActions = this.actions.get(mixerId);
    const action = mixerActions?.get(actionId);
    
    if (action) {
      action.paused = false;
    }
  }

  /**
   * Встановлює вагу анімації для змішування
   */
  setAnimationWeight(mixerId: string, actionId: string, weight: number): void {
    const mixerActions = this.actions.get(mixerId);
    const action = mixerActions?.get(actionId);
    
    if (action) {
      action.setEffectiveWeight(weight);
    }
  }

  /**
   * Створює просту tween анімацію
   */
  createTween(
    tweenId: string,
    object: THREE.Object3D,
    endValues: any,
    config: AnimationConfig = {}
  ): void {
    const startValues: any = {};
    
    // Копіювання початкових значень
    for (const key in endValues) {
      if (key === 'position' || key === 'rotation' || key === 'scale') {
        startValues[key] = {
          x: (object as any)[key].x,
          y: (object as any)[key].y,
          z: (object as any)[key].z
        };
      } else {
        startValues[key] = (object as any)[key];
      }
    }

    const tween: TweenAnimation = {
      id: tweenId,
      object,
      startValues,
      endValues,
      duration: config.duration || 1000,
      startTime: Date.now(),
      isPlaying: false,
      loop: config.loop || false,
      easing: config.easing || this.easeInOutQuad,
      onUpdate: config.onUpdate,
      onComplete: config.onComplete
    };

    this.tweens.set(tweenId, tween);

    if (config.autoStart) {
      this.playTween(tweenId);
    }
  }

  /**
   * Відтворює tween анімацію
   */
  playTween(tweenId: string): void {
    const tween = this.tweens.get(tweenId);
    if (tween) {
      tween.isPlaying = true;
      tween.startTime = Date.now();
      this.isAnimatingSubject.next(true);
    }
  }

  /**
   * Зупиняє tween анімацію
   */
  stopTween(tweenId: string): void {
    const tween = this.tweens.get(tweenId);
    if (tween) {
      tween.isPlaying = false;
    }
  }

  /**
   * Оновлює всі анімації
   */
  update(): void {
    const deltaTime = this.clock.getDelta();
    
    // Оновлення міксерів
    this.mixers.forEach(mixer => {
      mixer.update(deltaTime);
    });

    // Оновлення tween анімацій
    const currentTime = Date.now();
    this.tweens.forEach(tween => {
      if (tween.isPlaying) {
        const elapsed = currentTime - tween.startTime;
        let progress = elapsed / tween.duration;

        if (progress >= 1) {
          progress = 1;
          if (tween.loop) {
            tween.startTime = currentTime;
            progress = 0;
          } else {
            tween.isPlaying = false;
            if (tween.onComplete) {
              tween.onComplete();
            }
          }
        }

        const easedProgress = tween.easing(progress);
        this.updateTweenValues(tween, easedProgress);

        if (tween.onUpdate) {
          tween.onUpdate(progress);
        }
      }
    });

    // Перевірка чи є активні анімації
    const hasActiveAnimations = Array.from(this.tweens.values()).some(tween => tween.isPlaying) ||
                               Array.from(this.mixers.values()).some(mixer => mixer.time > 0);
    
    if (!hasActiveAnimations && this.isAnimatingSubject.value) {
      this.isAnimatingSubject.next(false);
    }
  }

  /**
   * Оновлює значення tween анімації
   */
  private updateTweenValues(tween: TweenAnimation, progress: number): void {
    for (const key in tween.endValues) {
      if (key === 'position' || key === 'rotation' || key === 'scale') {
        const start = tween.startValues[key];
        const end = tween.endValues[key];

        (tween.object as any)[key].x = start.x + (end.x - start.x) * progress;
        (tween.object as any)[key].y = start.y + (end.y - start.y) * progress;
        (tween.object as any)[key].z = start.z + (end.z - start.z) * progress;
      } else {
        const start = tween.startValues[key];
        const end = tween.endValues[key];
        (tween.object as any)[key] = start + (end - start) * progress;
      }
    }
  }

  /**
   * Функції згладжування (easing)
   */
  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  easeInQuad(t: number): number {
    return t * t;
  }

  easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  easeInCubic(t: number): number {
    return t * t * t;
  }

  easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }

  easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Створює анімацію обертання
   */
  createRotationAnimation(
    objectId: string,
    object: THREE.Object3D,
    axis: 'x' | 'y' | 'z',
    speed: number = 1
  ): void {
    const endRotation = { [axis]: object.rotation[axis] + Math.PI * 2 };
    
    this.createTween(objectId, object, { rotation: endRotation }, {
      duration: 2000 / speed,
      loop: true,
      autoStart: true,
      easing: (t) => t // Лінійна анімація для обертання
    });
  }

  /**
   * Створює анімацію пульсації
   */
  createPulseAnimation(
    objectId: string,
    object: THREE.Object3D,
    minScale: number = 0.8,
    maxScale: number = 1.2,
    duration: number = 1000
  ): void {
    const originalScale = { x: object.scale.x, y: object.scale.y, z: object.scale.z };
    
    const config: AnimationConfig = {
      duration: duration / 2,
      autoStart: true,
      easing: this.easeInOutQuad,
      onComplete: () => {
        this.createTween(objectId + '_pulse_in', object, {
          scale: originalScale
        }, {
          duration: duration / 2,
          autoStart: true,
          easing: this.easeInOutQuad
        });
      }
    };

    this.createTween(objectId + '_pulse_out', object, {
      scale: { x: maxScale, y: maxScale, z: maxScale }
    }, config);
  }

  /**
   * Очищує всі анімації
   */
  disposeAll(): void {
    this.mixers.forEach(mixer => {
      mixer.stopAllAction();
    });
    
    this.mixers.clear();
    this.actions.clear();
    this.tweens.clear();
    this.isAnimatingSubject.next(false);
  }

  /**
   * Очищує анімації для конкретного об'єкта
   */
  disposeMixer(mixerId: string): void {
    const mixer = this.mixers.get(mixerId);
    if (mixer) {
      mixer.stopAllAction();
      this.mixers.delete(mixerId);
      this.actions.delete(mixerId);
    }
  }
}
