import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Mission, MissionProgress, UnityMissionData, UnityObjective } from '../../game/missions/models/mission.model';

declare global {
  interface Window {
    unityInstance: any;
    unityGameObject: string;
    receiveUnityMessage: (gameObject: string, methodName: string, parameter: string) => void;
  }
}

export interface UnityMessage {
  gameObject: string;
  methodName: string;
  parameter: any;
}

@Injectable({
  providedIn: 'root'
})
export class UnityIntegrationService {
  private unityLoadedSubject = new BehaviorSubject<boolean>(false);
  private unityMessagesSubject = new BehaviorSubject<UnityMessage | null>(null);
  
  public unityLoaded$ = this.unityLoadedSubject.asObservable();
  public unityMessages$ = this.unityMessagesSubject.asObservable().pipe(
    filter(message => message !== null)
  );

  constructor() {
    this.initializeUnityMessageHandler();
    this.checkUnityStatus();
  }

  private initializeUnityMessageHandler(): void {
    // Set up global message receiver for Unity
    window.receiveUnityMessage = (gameObject: string, methodName: string, parameter: string) => {
      try {
        const parsedParameter = parameter ? JSON.parse(parameter) : null;
        this.unityMessagesSubject.next({
          gameObject,
          methodName,
          parameter: parsedParameter
        });
      } catch (error) {
        console.error('Failed to parse Unity message parameter:', error);
        this.unityMessagesSubject.next({
          gameObject,
          methodName,
          parameter
        });
      }
    };
  }

  private checkUnityStatus(): void {
    // Check if Unity is already loaded
    if (window.unityInstance) {
      this.unityLoadedSubject.next(true);
    } else {
      // Poll for Unity instance
      const checkInterval = setInterval(() => {
        if (window.unityInstance) {
          this.unityLoadedSubject.next(true);
          clearInterval(checkInterval);
        }
      }, 1000);

      // Stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 30000);
    }
  }

  // Mission-specific Unity integration
  sendMissionDataToUnity(missionData: UnityMissionData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        const dataString = JSON.stringify(missionData);
        window.unityInstance.SendMessage('MissionManager', 'LoadMissionData', dataString);
        resolve(true);
      } catch (error) {
        console.error('Failed to send mission data to Unity:', error);
        reject(error);
      }
    });
  }

  startMissionInUnity(missionId: number, playerId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        const data = JSON.stringify({ missionId, playerId });
        window.unityInstance.SendMessage('MissionManager', 'StartMission', data);
        resolve(true);
      } catch (error) {
        console.error('Failed to start mission in Unity:', error);
        reject(error);
      }
    });
  }

  updateObjectiveInUnity(missionId: number, objectiveId: number, progress: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        const data = JSON.stringify({ missionId, objectiveId, progress });
        window.unityInstance.SendMessage('MissionManager', 'UpdateObjective', data);
        resolve(true);
      } catch (error) {
        console.error('Failed to update objective in Unity:', error);
        reject(error);
      }
    });
  }

  completeMissionInUnity(missionId: number, playerId: number, rating: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        const data = JSON.stringify({ missionId, playerId, rating });
        window.unityInstance.SendMessage('MissionManager', 'CompleteMission', data);
        resolve(true);
      } catch (error) {
        console.error('Failed to complete mission in Unity:', error);
        reject(error);
      }
    });
  }

  // Environment and scene management
  loadUnityScene(sceneName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        window.unityInstance.SendMessage('SceneManager', 'LoadScene', sceneName);
        resolve(true);
      } catch (error) {
        console.error('Failed to load Unity scene:', error);
        reject(error);
      }
    });
  }

  setUnityEnvironment(environment: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        const environmentString = JSON.stringify(environment);
        window.unityInstance.SendMessage('EnvironmentManager', 'SetEnvironment', environmentString);
        resolve(true);
      } catch (error) {
        console.error('Failed to set Unity environment:', error);
        reject(error);
      }
    });
  }

  // Unity message listeners
  onMissionStarted(): Observable<{ missionId: number; playerId: number }> {
    return this.unityMessages$.pipe(
      filter(message => message.methodName === 'OnMissionStarted'),
      map(message => message.parameter)
    );
  }

  onObjectiveCompleted(): Observable<{ missionId: number; objectiveId: number; playerId: number }> {
    return this.unityMessages$.pipe(
      filter(message => message.methodName === 'OnObjectiveCompleted'),
      map(message => message.parameter)
    );
  }

  onMissionCompleted(): Observable<{ missionId: number; playerId: number; rating: number }> {
    return this.unityMessages$.pipe(
      filter(message => message.methodName === 'OnMissionCompleted'),
      map(message => message.parameter)
    );
  }

  onMissionFailed(): Observable<{ missionId: number; playerId: number; reason: string }> {
    return this.unityMessages$.pipe(
      filter(message => message.methodName === 'OnMissionFailed'),
      map(message => message.parameter)
    );
  }

  onPlayerPositionUpdate(): Observable<{ x: number; y: number; z: number }> {
    return this.unityMessages$.pipe(
      filter(message => message.methodName === 'OnPlayerPositionUpdate'),
      map(message => message.parameter)
    );
  }

  onUnityError(): Observable<{ error: string; details: any }> {
    return this.unityMessages$.pipe(
      filter(message => message.methodName === 'OnError'),
      map(message => message.parameter)
    );
  }

  // Utility methods
  isUnityLoaded(): boolean {
    return this.unityLoadedSubject.value && !!window.unityInstance;
  }

  getUnityVersion(): string | null {
    if (!this.isUnityLoaded()) return null;
    
    try {
      return window.unityInstance.Module.unityVersion || 'Unknown';
    } catch (error) {
      return null;
    }
  }

  pauseUnity(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        window.unityInstance.SendMessage('GameManager', 'PauseGame', '');
        resolve(true);
      } catch (error) {
        console.error('Failed to pause Unity:', error);
        reject(error);
      }
    });
  }

  resumeUnity(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isUnityLoaded()) {
        reject(new Error('Unity is not loaded'));
        return;
      }

      try {
        window.unityInstance.SendMessage('GameManager', 'ResumeGame', '');
        resolve(true);
      } catch (error) {
        console.error('Failed to resume Unity:', error);
        reject(error);
      }
    });
  }

  // Debug methods
  sendDebugMessage(message: string): void {
    if (this.isUnityLoaded()) {
      try {
        window.unityInstance.SendMessage('DebugManager', 'LogMessage', message);
      } catch (error) {
        console.error('Failed to send debug message to Unity:', error);
      }
    }
  }

  getUnityStats(): any {
    if (!this.isUnityLoaded()) return null;
    
    try {
      // This would return Unity performance stats if available
      return {
        fps: window.unityInstance.Module.fps || 0,
        memoryUsage: window.unityInstance.Module.HEAPU8?.length || 0,
        isLoaded: true
      };
    } catch (error) {
      return null;
    }
  }

  // Cleanup
  destroy(): void {
    if (window.unityInstance) {
      try {
        window.unityInstance.Quit();
      } catch (error) {
        console.error('Failed to quit Unity:', error);
      }
    }
    
    this.unityLoadedSubject.complete();
    this.unityMessagesSubject.complete();
  }
}
