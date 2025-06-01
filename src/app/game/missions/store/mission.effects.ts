import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { MissionService } from '../services/mission.service';
import * as MissionActions from './mission.actions';
import { selectCurrentPlayerId } from '../../shared/store/game.selectors';

@Injectable()
export class MissionEffects {

  constructor(
    private actions$: Actions,
    private missionService: MissionService,
    private store: Store
  ) {}

  // Load missions
  loadMissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissions),
      switchMap(() =>
        this.missionService.getAllMissions().pipe(
          map(missions => MissionActions.loadMissionsSuccess({ missions })),
          catchError(error => of(MissionActions.loadMissionsFailure({ error: error.message })))
        )
      )
    )
  );

  // Load missions by type
  loadMissionsByType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissionsByType),
      switchMap(({ type }) =>
        this.missionService.getMissionsByType(type).pipe(
          map(missions => MissionActions.loadMissionsByTypeSuccess({ missions, type })),
          catchError(error => of(MissionActions.loadMissionsFailure({ error: error.message })))
        )
      )
    )
  );

  // Load missions by category
  loadMissionsByCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissionsByCategory),
      switchMap(({ category }) =>
        this.missionService.getMissionsByCategory(category).pipe(
          map(missions => MissionActions.loadMissionsByCategorySuccess({ missions, category })),
          catchError(error => of(MissionActions.loadMissionsFailure({ error: error.message })))
        )
      )
    )
  );

  // Load available missions
  loadAvailableMissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadAvailableMissions),
      switchMap(({ playerId, playerLevel }) =>
        this.missionService.getAvailableMissions(playerId, playerLevel).pipe(
          map(missions => MissionActions.loadAvailableMissionsSuccess({ missions })),
          catchError(error => of(MissionActions.loadMissionsFailure({ error: error.message })))
        )
      )
    )
  );

  // Start mission
  startMission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.startMission),
      switchMap(({ missionId, playerId }) =>
        this.missionService.startMission(missionId, playerId).pipe(
          map(progress => MissionActions.startMissionSuccess({ progress })),
          catchError(error => of(MissionActions.startMissionFailure({ error: error.message })))
        )
      )
    )
  );

  // Complete mission
  completeMission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.completeMission),
      switchMap(({ missionId, playerId, rating }) =>
        this.missionService.completeMission(missionId, playerId, rating).pipe(
          map(progress => MissionActions.completeMissionSuccess({ progress })),
          catchError(error => of(MissionActions.completeMissionFailure({ error: error.message })))
        )
      )
    )
  );

  // Load mission progress
  loadMissionProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissionProgress),
      switchMap(({ missionId, playerId }) =>
        this.missionService.getMissionProgress(missionId, playerId).pipe(
          map(progress => MissionActions.loadMissionProgressSuccess({ progress })),
          catchError(error => of(MissionActions.loadMissionProgressFailure({ error: error.message })))
        )
      )
    )
  );

  // Update objective progress
  updateObjectiveProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.updateObjectiveProgress),
      switchMap(({ missionId, objectiveId, playerId, progress }) =>
        this.missionService.updateObjectiveProgress(missionId, objectiveId, playerId, progress).pipe(
          map(() => MissionActions.updateObjectiveProgressSuccess()),
          tap(() => {
            // Reload mission progress after updating objective
            this.store.dispatch(MissionActions.loadMissionProgress({ missionId, playerId }));
          }),
          catchError(error => of(MissionActions.updateObjectiveProgressFailure({ error: error.message })))
        )
      )
    )
  );

  // Load mission history
  loadMissionHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissionHistory),
      switchMap(({ playerId }) =>
        this.missionService.getPlayerMissionHistory(playerId).pipe(
          map(history => MissionActions.loadMissionHistorySuccess({ history })),
          catchError(error => of(MissionActions.loadMissionHistoryFailure({ error: error.message })))
        )
      )
    )
  );

  // Load mission statistics
  loadMissionStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissionStatistics),
      switchMap(({ missionId }) =>
        this.missionService.getMissionStatistics(missionId).pipe(
          map(statistics => MissionActions.loadMissionStatisticsSuccess({ statistics })),
          catchError(error => of(MissionActions.loadMissionStatisticsFailure({ error: error.message })))
        )
      )
    )
  );

  // Sync with Bright Data
  syncWithBrightData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.syncWithBrightData),
      switchMap(() =>
        this.missionService.syncWithBrightData().pipe(
          map(() => MissionActions.syncWithBrightDataSuccess()),
          tap(() => {
            // Reload missions after sync
            this.store.dispatch(MissionActions.loadMissions());
          }),
          catchError(error => of(MissionActions.syncWithBrightDataFailure({ error: error.message })))
        )
      )
    )
  );

  // Load sync history
  loadSyncHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadSyncHistory),
      switchMap(() =>
        this.missionService.getSyncHistory().pipe(
          map(history => MissionActions.loadSyncHistorySuccess({ history })),
          catchError(error => of(MissionActions.loadSyncHistoryFailure({ error: error.message })))
        )
      )
    )
  );

  // Load last sync status
  loadLastSyncStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadLastSyncStatus),
      switchMap(() =>
        this.missionService.getLastSyncStatus().pipe(
          map(status => MissionActions.loadLastSyncStatusSuccess({ status })),
          catchError(error => of(MissionActions.loadLastSyncStatusFailure({ error: error.message })))
        )
      )
    )
  );

  // Auto-load available missions when player changes
  loadAvailableMissionsOnPlayerChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.loadMissions),
      withLatestFrom(this.store.select(selectCurrentPlayerId)),
      switchMap(([action, playerId]) => {
        if (playerId) {
          return of(MissionActions.loadAvailableMissions({ playerId }));
        }
        return of();
      })
    )
  );

  // Send mission data to Unity when mission is selected
  sendMissionDataToUnity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.sendMissionDataToUnity),
      tap(({ missionId, playerId }) => {
        // This would integrate with Unity WebGL
        console.log('Sending mission data to Unity:', { missionId, playerId });
        
        // Example Unity communication
        if (typeof (window as any).unityInstance !== 'undefined') {
          const unityData = {
            missionId,
            playerId,
            timestamp: Date.now()
          };
          
          try {
            (window as any).unityInstance.SendMessage(
              'MissionManager', 
              'LoadMissionData', 
              JSON.stringify(unityData)
            );
          } catch (error) {
            console.error('Failed to send data to Unity:', error);
          }
        }
      })
    ),
    { dispatch: false }
  );

  // Handle objective completion from Unity
  objectiveCompleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MissionActions.objectiveCompleted),
      withLatestFrom(this.store.select(selectCurrentPlayerId)),
      switchMap(([{ missionId, objectiveId }, playerId]) => {
        if (playerId) {
          // Update objective progress to completed
          return of(MissionActions.updateObjectiveProgress({ 
            missionId, 
            objectiveId, 
            playerId, 
            progress: 1 
          }));
        }
        return of();
      })
    )
  );
}
