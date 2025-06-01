import { createReducer, on } from '@ngrx/store';
import { MissionState, initialMissionState } from './mission.state';
import { Mission } from '../models/mission.model';
import * as MissionActions from './mission.actions';

export const missionReducer = createReducer(
  initialMissionState,

  // Load missions
  on(MissionActions.loadMissions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadMissionsSuccess, (state, { missions }) => ({
    ...state,
    missions,
    filteredMissions: applyFilter(missions, state.filter),
    loading: false,
    error: null,
    lastMissionsLoad: Date.now()
  })),

  on(MissionActions.loadMissionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load missions by type
  on(MissionActions.loadMissionsByTypeSuccess, (state, { missions }) => ({
    ...state,
    missions,
    filteredMissions: applyFilter(missions, state.filter),
    loading: false,
    error: null
  })),

  // Load missions by category
  on(MissionActions.loadMissionsByCategorySuccess, (state, { missions }) => ({
    ...state,
    missions,
    filteredMissions: applyFilter(missions, state.filter),
    loading: false,
    error: null
  })),

  // Load available missions
  on(MissionActions.loadAvailableMissions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadAvailableMissionsSuccess, (state, { missions }) => ({
    ...state,
    availableMissions: missions,
    loading: false,
    error: null
  })),

  // Select mission
  on(MissionActions.selectMission, (state, { mission }) => ({
    ...state,
    selectedMission: mission
  })),

  on(MissionActions.clearSelectedMission, (state) => ({
    ...state,
    selectedMission: null,
    currentProgress: null
  })),

  // Start mission
  on(MissionActions.startMission, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.startMissionSuccess, (state, { progress }) => ({
    ...state,
    currentProgress: progress,
    loading: false,
    error: null
  })),

  on(MissionActions.startMissionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Complete mission
  on(MissionActions.completeMission, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.completeMissionSuccess, (state, { progress }) => ({
    ...state,
    currentProgress: progress,
    missionHistory: [progress, ...state.missionHistory],
    loading: false,
    error: null
  })),

  on(MissionActions.completeMissionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load mission progress
  on(MissionActions.loadMissionProgress, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadMissionProgressSuccess, (state, { progress }) => ({
    ...state,
    currentProgress: progress,
    loading: false,
    error: null
  })),

  on(MissionActions.loadMissionProgressFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update objective progress
  on(MissionActions.updateObjectiveProgress, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.updateObjectiveProgressSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),

  on(MissionActions.updateObjectiveProgressFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load mission history
  on(MissionActions.loadMissionHistory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadMissionHistorySuccess, (state, { history }) => ({
    ...state,
    missionHistory: history,
    loading: false,
    error: null
  })),

  on(MissionActions.loadMissionHistoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load mission statistics
  on(MissionActions.loadMissionStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadMissionStatisticsSuccess, (state, { statistics }) => ({
    ...state,
    missionStatistics: {
      ...state.missionStatistics,
      [state.selectedMission?.id || 0]: statistics
    },
    loading: false,
    error: null
  })),

  on(MissionActions.loadMissionStatisticsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Bright Data sync
  on(MissionActions.syncWithBrightData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.syncWithBrightDataSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
    lastSyncCheck: Date.now()
  })),

  on(MissionActions.syncWithBrightDataFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load sync history
  on(MissionActions.loadSyncHistory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadSyncHistorySuccess, (state, { history }) => ({
    ...state,
    syncHistory: history,
    loading: false,
    error: null
  })),

  on(MissionActions.loadSyncHistoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load last sync status
  on(MissionActions.loadLastSyncStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(MissionActions.loadLastSyncStatusSuccess, (state, { status }) => ({
    ...state,
    lastSyncStatus: status,
    loading: false,
    error: null
  })),

  on(MissionActions.loadLastSyncStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Filter missions
  on(MissionActions.setMissionFilter, (state, { filter }) => ({
    ...state,
    filter,
    filteredMissions: applyFilter(state.missions, filter)
  })),

  on(MissionActions.clearMissionFilter, (state) => ({
    ...state,
    filter: {},
    filteredMissions: state.missions
  })),

  // UI actions
  on(MissionActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),

  on(MissionActions.clearError, (state) => ({
    ...state,
    error: null
  })),

  // Real-time updates
  on(MissionActions.missionProgressUpdated, (state, { progress }) => ({
    ...state,
    currentProgress: progress
  })),

  on(MissionActions.objectiveCompleted, (state, { missionId, objectiveId }) => {
    if (state.currentProgress && state.currentProgress.mission_id === missionId) {
      return {
        ...state,
        currentProgress: {
          ...state.currentProgress,
          objectives_completed: state.currentProgress.objectives_completed + 1,
          progress_percentage: Math.min(100, 
            ((state.currentProgress.objectives_completed + 1) / state.currentProgress.total_objectives) * 100
          )
        }
      };
    }
    return state;
  })
);

// Helper function to apply filters
function applyFilter(missions: Mission[], filter: any): Mission[] {
  if (!filter || Object.keys(filter).length === 0) {
    return missions;
  }

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
