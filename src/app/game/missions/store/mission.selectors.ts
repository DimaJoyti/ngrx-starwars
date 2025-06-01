import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MissionState } from './mission.state';
import { Mission, MissionType, MissionCategory, StarWarsEra } from '../models/mission.model';

// Feature selector
export const selectMissionState = createFeatureSelector<MissionState>('missions');

// Basic selectors
export const selectAllMissions = createSelector(
  selectMissionState,
  (state: MissionState) => state.missions
);

export const selectFilteredMissions = createSelector(
  selectMissionState,
  (state: MissionState) => state.filteredMissions
);

export const selectAvailableMissions = createSelector(
  selectMissionState,
  (state: MissionState) => state.availableMissions
);

export const selectSelectedMission = createSelector(
  selectMissionState,
  (state: MissionState) => state.selectedMission
);

export const selectCurrentProgress = createSelector(
  selectMissionState,
  (state: MissionState) => state.currentProgress
);

export const selectMissionHistory = createSelector(
  selectMissionState,
  (state: MissionState) => state.missionHistory
);

export const selectMissionStatistics = createSelector(
  selectMissionState,
  (state: MissionState) => state.missionStatistics
);

export const selectSyncHistory = createSelector(
  selectMissionState,
  (state: MissionState) => state.syncHistory
);

export const selectLastSyncStatus = createSelector(
  selectMissionState,
  (state: MissionState) => state.lastSyncStatus
);

export const selectMissionFilter = createSelector(
  selectMissionState,
  (state: MissionState) => state.filter
);

export const selectMissionLoading = createSelector(
  selectMissionState,
  (state: MissionState) => state.loading
);

export const selectMissionError = createSelector(
  selectMissionState,
  (state: MissionState) => state.error
);

export const selectUnityMissionData = createSelector(
  selectMissionState,
  (state: MissionState) => state.unityMissionData
);

export const selectIsUnityConnected = createSelector(
  selectMissionState,
  (state: MissionState) => state.isUnityConnected
);

// Computed selectors
export const selectMissionById = (missionId: number) => createSelector(
  selectAllMissions,
  (missions: Mission[]) => missions.find(mission => mission.id === missionId)
);

export const selectMissionsByType = (type: MissionType) => createSelector(
  selectAllMissions,
  (missions: Mission[]) => missions.filter(mission => mission.type === type)
);

export const selectMissionsByCategory = (category: MissionCategory) => createSelector(
  selectAllMissions,
  (missions: Mission[]) => missions.filter(mission => mission.category === category)
);

export const selectMissionsByEra = (era: StarWarsEra) => createSelector(
  selectAllMissions,
  (missions: Mission[]) => missions.filter(mission => mission.era === era)
);

export const selectMissionsByDifficulty = (minDifficulty: number, maxDifficulty: number) => createSelector(
  selectAllMissions,
  (missions: Mission[]) => missions.filter(mission => 
    mission.difficulty >= minDifficulty && mission.difficulty <= maxDifficulty
  )
);

export const selectCompletedMissions = createSelector(
  selectMissionHistory,
  (history) => history.filter(progress => progress.status === 'completed')
);

export const selectInProgressMissions = createSelector(
  selectMissionHistory,
  (history) => history.filter(progress => progress.status === 'in_progress')
);

export const selectMissionCompletionRate = createSelector(
  selectMissionHistory,
  (history) => {
    if (history.length === 0) return 0;
    const completed = history.filter(progress => progress.status === 'completed').length;
    return (completed / history.length) * 100;
  }
);

export const selectTotalExperienceEarned = createSelector(
  selectCompletedMissions,
  (completedMissions) => completedMissions.reduce((total, mission) => total + mission.experience_earned, 0)
);

export const selectTotalCreditsEarned = createSelector(
  selectCompletedMissions,
  (completedMissions) => completedMissions.reduce((total, mission) => total + mission.credits_earned, 0)
);

export const selectAverageRating = createSelector(
  selectCompletedMissions,
  (completedMissions) => {
    if (completedMissions.length === 0) return 0;
    const totalRating = completedMissions.reduce((total, mission) => total + mission.rating, 0);
    return totalRating / completedMissions.length;
  }
);

export const selectMissionStatisticsById = (missionId: number) => createSelector(
  selectMissionStatistics,
  (statistics) => statistics[missionId]
);

export const selectCurrentMissionProgress = createSelector(
  selectSelectedMission,
  selectCurrentProgress,
  (mission, progress) => {
    if (!mission || !progress) return null;
    
    return {
      mission,
      progress,
      completionPercentage: progress.progress_percentage,
      objectivesCompleted: progress.objectives_completed,
      totalObjectives: progress.total_objectives,
      timeSpent: progress.time_spent,
      isCompleted: progress.status === 'completed'
    };
  }
);

export const selectMissionsByPlanet = createSelector(
  selectAllMissions,
  (missions: Mission[]) => {
    const planetGroups: { [planet: string]: Mission[] } = {};
    missions.forEach(mission => {
      if (!planetGroups[mission.planet]) {
        planetGroups[mission.planet] = [];
      }
      planetGroups[mission.planet].push(mission);
    });
    return planetGroups;
  }
);

export const selectMissionsByFaction = createSelector(
  selectAllMissions,
  (missions: Mission[]) => {
    const factionGroups: { [faction: string]: Mission[] } = {};
    missions.forEach(mission => {
      if (!factionGroups[mission.faction]) {
        factionGroups[mission.faction] = [];
      }
      factionGroups[mission.faction].push(mission);
    });
    return factionGroups;
  }
);

export const selectRecentMissions = createSelector(
  selectMissionHistory,
  (history) => history
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
);

export const selectFavoriteMissions = createSelector(
  selectCompletedMissions,
  (completedMissions) => completedMissions
    .filter(mission => mission.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
);

export const selectMissionRecommendations = createSelector(
  selectAllMissions,
  selectMissionHistory,
  (allMissions, history) => {
    // Simple recommendation algorithm based on completed missions
    const completedTypes = history
      .filter(progress => progress.status === 'completed')
      .map(progress => {
        const mission = allMissions.find(m => m.id === progress.mission_id);
        return mission?.type;
      })
      .filter(Boolean);

    const typeFrequency: { [type: string]: number } = {};
    completedTypes.forEach(type => {
      if (type) {
        typeFrequency[type] = (typeFrequency[type] || 0) + 1;
      }
    });

    const preferredTypes = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    return allMissions
      .filter(mission => preferredTypes.includes(mission.type))
      .filter(mission => !history.some(h => h.mission_id === mission.id && h.status === 'completed'))
      .slice(0, 5);
  }
);

export const selectLastSyncTime = createSelector(
  selectLastSyncStatus,
  (status) => status?.last_sync_at ? new Date(status.last_sync_at) : null
);

export const selectSyncInProgress = createSelector(
  selectLastSyncStatus,
  (status) => status?.sync_status === 'in_progress'
);

export const selectMissionsNeedingSync = createSelector(
  selectMissionState,
  (state) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return !state.lastSyncCheck || (now - state.lastSyncCheck) > oneHour;
  }
);
