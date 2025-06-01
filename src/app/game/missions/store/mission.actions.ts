import { createAction, props } from '@ngrx/store';
import {
  Mission,
  MissionProgress,
  MissionFilter,
  MissionStatistics,
  BrightDataMissionSync,
  MissionType,
  MissionCategory
} from '../models/mission.model';

// Load missions
export const loadMissions = createAction('[Mission] Load Missions');
export const loadMissionsSuccess = createAction(
  '[Mission] Load Missions Success',
  props<{ missions: Mission[] }>()
);
export const loadMissionsFailure = createAction(
  '[Mission] Load Missions Failure',
  props<{ error: string }>()
);

// Load missions by type
export const loadMissionsByType = createAction(
  '[Mission] Load Missions By Type',
  props<{ type: MissionType }>()
);
export const loadMissionsByTypeSuccess = createAction(
  '[Mission] Load Missions By Type Success',
  props<{ missions: Mission[]; type: MissionType }>()
);

// Load missions by category
export const loadMissionsByCategory = createAction(
  '[Mission] Load Missions By Category',
  props<{ category: MissionCategory }>()
);
export const loadMissionsByCategorySuccess = createAction(
  '[Mission] Load Missions By Category Success',
  props<{ missions: Mission[]; category: MissionCategory }>()
);

// Load available missions
export const loadAvailableMissions = createAction(
  '[Mission] Load Available Missions',
  props<{ playerId: number; playerLevel?: number }>()
);
export const loadAvailableMissionsSuccess = createAction(
  '[Mission] Load Available Missions Success',
  props<{ missions: Mission[] }>()
);

// Select mission
export const selectMission = createAction(
  '[Mission] Select Mission',
  props<{ mission: Mission }>()
);
export const clearSelectedMission = createAction('[Mission] Clear Selected Mission');

// Start mission
export const startMission = createAction(
  '[Mission] Start Mission',
  props<{ missionId: number; playerId: number }>()
);
export const startMissionSuccess = createAction(
  '[Mission] Start Mission Success',
  props<{ progress: MissionProgress }>()
);
export const startMissionFailure = createAction(
  '[Mission] Start Mission Failure',
  props<{ error: string }>()
);

// Complete mission
export const completeMission = createAction(
  '[Mission] Complete Mission',
  props<{ missionId: number; playerId: number; rating: number }>()
);
export const completeMissionSuccess = createAction(
  '[Mission] Complete Mission Success',
  props<{ progress: MissionProgress }>()
);
export const completeMissionFailure = createAction(
  '[Mission] Complete Mission Failure',
  props<{ error: string }>()
);

// Load mission progress
export const loadMissionProgress = createAction(
  '[Mission] Load Mission Progress',
  props<{ missionId: number; playerId: number }>()
);
export const loadMissionProgressSuccess = createAction(
  '[Mission] Load Mission Progress Success',
  props<{ progress: MissionProgress }>()
);
export const loadMissionProgressFailure = createAction(
  '[Mission] Load Mission Progress Failure',
  props<{ error: string }>()
);

// Update objective progress
export const updateObjectiveProgress = createAction(
  '[Mission] Update Objective Progress',
  props<{ missionId: number; objectiveId: number; playerId: number; progress: number }>()
);
export const updateObjectiveProgressSuccess = createAction(
  '[Mission] Update Objective Progress Success'
);
export const updateObjectiveProgressFailure = createAction(
  '[Mission] Update Objective Progress Failure',
  props<{ error: string }>()
);

// Load mission history
export const loadMissionHistory = createAction(
  '[Mission] Load Mission History',
  props<{ playerId: number }>()
);
export const loadMissionHistorySuccess = createAction(
  '[Mission] Load Mission History Success',
  props<{ history: MissionProgress[] }>()
);
export const loadMissionHistoryFailure = createAction(
  '[Mission] Load Mission History Failure',
  props<{ error: string }>()
);

// Load mission statistics
export const loadMissionStatistics = createAction(
  '[Mission] Load Mission Statistics',
  props<{ missionId: number }>()
);
export const loadMissionStatisticsSuccess = createAction(
  '[Mission] Load Mission Statistics Success',
  props<{ statistics: MissionStatistics }>()
);
export const loadMissionStatisticsFailure = createAction(
  '[Mission] Load Mission Statistics Failure',
  props<{ error: string }>()
);

// Bright Data sync
export const syncWithBrightData = createAction('[Mission] Sync With Bright Data');
export const syncWithBrightDataSuccess = createAction('[Mission] Sync With Bright Data Success');
export const syncWithBrightDataFailure = createAction(
  '[Mission] Sync With Bright Data Failure',
  props<{ error: string }>()
);

// Load sync history
export const loadSyncHistory = createAction('[Mission] Load Sync History');
export const loadSyncHistorySuccess = createAction(
  '[Mission] Load Sync History Success',
  props<{ history: BrightDataMissionSync[] }>()
);
export const loadSyncHistoryFailure = createAction(
  '[Mission] Load Sync History Failure',
  props<{ error: string }>()
);

// Load last sync status
export const loadLastSyncStatus = createAction('[Mission] Load Last Sync Status');
export const loadLastSyncStatusSuccess = createAction(
  '[Mission] Load Last Sync Status Success',
  props<{ status: BrightDataMissionSync }>()
);
export const loadLastSyncStatusFailure = createAction(
  '[Mission] Load Last Sync Status Failure',
  props<{ error: string }>()
);

// Filter missions
export const setMissionFilter = createAction(
  '[Mission] Set Mission Filter',
  props<{ filter: MissionFilter }>()
);
export const clearMissionFilter = createAction('[Mission] Clear Mission Filter');

// UI actions
export const setLoading = createAction(
  '[Mission] Set Loading',
  props<{ loading: boolean }>()
);
export const clearError = createAction('[Mission] Clear Error');

// Unity integration
export const loadUnityMissionData = createAction(
  '[Mission] Load Unity Mission Data',
  props<{ missionId: number; playerId: number }>()
);
export const sendMissionDataToUnity = createAction(
  '[Mission] Send Mission Data To Unity',
  props<{ missionId: number; playerId: number }>()
);

// Real-time updates
export const missionProgressUpdated = createAction(
  '[Mission] Mission Progress Updated',
  props<{ progress: MissionProgress }>()
);
export const objectiveCompleted = createAction(
  '[Mission] Objective Completed',
  props<{ missionId: number; objectiveId: number; playerId: number }>()
);
