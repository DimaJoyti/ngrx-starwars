import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Mission,
  MissionProgress,
  MissionFilter,
  MissionStatistics,
  BrightDataMissionSync,
  StartMissionRequest,
  CompleteMissionRequest,
  UpdateObjectiveProgressRequest,
  MissionType,
  MissionCategory
} from '../models/mission.model';

export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/missions`;
  
  // State management
  private missionsSubject = new BehaviorSubject<Mission[]>([]);
  private currentMissionSubject = new BehaviorSubject<Mission | null>(null);
  private missionProgressSubject = new BehaviorSubject<MissionProgress | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public missions$ = this.missionsSubject.asObservable();
  public currentMission$ = this.currentMissionSubject.asObservable();
  public missionProgress$ = this.missionProgressSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Mission CRUD operations
  getAllMissions(): Observable<Mission[]> {
    this.setLoading(true);
    return this.http.get<ApiResponse<{ missions: Mission[]; count: number }>>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data.missions),
        tap(missions => {
          this.missionsSubject.next(missions);
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Failed to load missions', error);
          return of([]);
        })
      );
  }

  getMissionsByType(type: MissionType): Observable<Mission[]> {
    this.setLoading(true);
    return this.http.get<ApiResponse<{ missions: Mission[]; type: string; count: number }>>(`${this.apiUrl}/type/${type}`)
      .pipe(
        map(response => response.data.missions),
        tap(missions => {
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError(`Failed to load ${type} missions`, error);
          return of([]);
        })
      );
  }

  getMissionsByCategory(category: MissionCategory): Observable<Mission[]> {
    this.setLoading(true);
    return this.http.get<ApiResponse<{ missions: Mission[]; category: string; count: number }>>(`${this.apiUrl}/category/${category}`)
      .pipe(
        map(response => response.data.missions),
        tap(missions => {
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError(`Failed to load ${category} missions`, error);
          return of([]);
        })
      );
  }

  getAvailableMissions(playerId: number, playerLevel?: number): Observable<Mission[]> {
    this.setLoading(true);
    let params = new HttpParams();
    if (playerLevel) {
      params = params.set('level', playerLevel.toString());
    }

    return this.http.get<ApiResponse<{ missions: Mission[]; player_id: number; player_level: number; count: number }>>
      (`${this.apiUrl}/available/${playerId}`, { params })
      .pipe(
        map(response => response.data.missions),
        tap(missions => {
          this.missionsSubject.next(missions);
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Failed to load available missions', error);
          return of([]);
        })
      );
  }

  // Mission progress operations
  startMission(missionId: number, playerId: number): Observable<MissionProgress> {
    this.setLoading(true);
    const request: StartMissionRequest = { player_id: playerId };
    
    return this.http.post<ApiResponse<{ progress: MissionProgress }>>(`${this.apiUrl}/${missionId}/start`, request)
      .pipe(
        map(response => response.data.progress),
        tap(progress => {
          this.missionProgressSubject.next(progress);
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Failed to start mission', error);
          throw error;
        })
      );
  }

  completeMission(missionId: number, playerId: number, rating: number): Observable<MissionProgress> {
    this.setLoading(true);
    const request: CompleteMissionRequest = { player_id: playerId, rating };
    
    return this.http.post<ApiResponse<{ progress: MissionProgress }>>(`${this.apiUrl}/${missionId}/complete`, request)
      .pipe(
        map(response => response.data.progress),
        tap(progress => {
          this.missionProgressSubject.next(progress);
          this.setLoading(false);
        }),
        catchError(error => {
          this.handleError('Failed to complete mission', error);
          throw error;
        })
      );
  }

  getMissionProgress(missionId: number, playerId: number): Observable<MissionProgress> {
    return this.http.get<ApiResponse<MissionProgress>>(`${this.apiUrl}/${missionId}/progress/${playerId}`)
      .pipe(
        map(response => response.data),
        tap(progress => {
          this.missionProgressSubject.next(progress);
        }),
        catchError(error => {
          this.handleError('Failed to load mission progress', error);
          throw error;
        })
      );
  }

  updateObjectiveProgress(missionId: number, objectiveId: number, playerId: number, progress: number): Observable<void> {
    const request: UpdateObjectiveProgressRequest = { player_id: playerId, progress };
    
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/${missionId}/objectives/${objectiveId}/progress`, request)
      .pipe(
        map(() => void 0),
        catchError(error => {
          this.handleError('Failed to update objective progress', error);
          throw error;
        })
      );
  }

  // Mission history and statistics
  getPlayerMissionHistory(playerId: number): Observable<MissionProgress[]> {
    return this.http.get<ApiResponse<{ history: MissionProgress[]; player_id: number; count: number }>>
      (`${this.apiUrl}/history/${playerId}`)
      .pipe(
        map(response => response.data.history),
        catchError(error => {
          this.handleError('Failed to load mission history', error);
          return of([]);
        })
      );
  }

  getMissionStatistics(missionId: number): Observable<MissionStatistics> {
    return this.http.get<ApiResponse<{ mission_id: number; statistics: MissionStatistics }>>
      (`${this.apiUrl}/${missionId}/statistics`)
      .pipe(
        map(response => response.data.statistics),
        catchError(error => {
          this.handleError('Failed to load mission statistics', error);
          throw error;
        })
      );
  }

  // Bright Data integration
  syncWithBrightData(): Observable<void> {
    this.setLoading(true);
    return this.http.post<ApiResponse<{ sync_completed: boolean }>>(`${this.apiUrl}/sync/bright-data`, {})
      .pipe(
        map(() => void 0),
        tap(() => {
          this.setLoading(false);
          // Refresh missions after sync
          this.getAllMissions().subscribe();
        }),
        catchError(error => {
          this.handleError('Failed to sync with Bright Data', error);
          throw error;
        })
      );
  }

  getSyncHistory(): Observable<BrightDataMissionSync[]> {
    return this.http.get<ApiResponse<{ history: BrightDataMissionSync[]; count: number }>>
      (`${this.apiUrl}/sync/history`)
      .pipe(
        map(response => response.data.history),
        catchError(error => {
          this.handleError('Failed to load sync history', error);
          return of([]);
        })
      );
  }

  getLastSyncStatus(): Observable<BrightDataMissionSync> {
    return this.http.get<ApiResponse<BrightDataMissionSync>>(`${this.apiUrl}/sync/status`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          this.handleError('Failed to load sync status', error);
          throw error;
        })
      );
  }

  // Utility methods
  setCurrentMission(mission: Mission | null): void {
    this.currentMissionSubject.next(mission);
  }

  filterMissions(missions: Mission[], filter: MissionFilter): Mission[] {
    return missions.filter(mission => {
      if (filter.type && mission.type !== filter.type) return false;
      if (filter.category && mission.category !== filter.category) return false;
      if (filter.era && mission.era !== filter.era) return false;
      if (filter.faction && mission.faction !== filter.faction) return false;
      if (filter.difficulty_min && mission.difficulty < filter.difficulty_min) return false;
      if (filter.difficulty_max && mission.difficulty > filter.difficulty_max) return false;
      if (filter.level_min && mission.max_level < filter.level_min) return false;
      if (filter.level_max && mission.min_level > filter.level_max) return false;
      if (filter.planet && !mission.planet.toLowerCase().includes(filter.planet.toLowerCase())) return false;
      if (filter.search_term) {
        const searchTerm = filter.search_term.toLowerCase();
        const searchableText = `${mission.name} ${mission.description} ${mission.characters.join(' ')}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      return true;
    });
  }

  // Private methods
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorSubject.next(message);
    this.setLoading(false);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  // Cache management
  refreshMissions(): Observable<Mission[]> {
    return this.getAllMissions();
  }

  clearCache(): void {
    this.missionsSubject.next([]);
    this.currentMissionSubject.next(null);
    this.missionProgressSubject.next(null);
    this.clearError();
  }
}
