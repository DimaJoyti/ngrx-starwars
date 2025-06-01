import {
  Mission,
  MissionProgress,
  MissionFilter,
  MissionStatistics,
  BrightDataMissionSync
} from '../models/mission.model';

export interface MissionState {
  // Mission data
  missions: Mission[];
  selectedMission: Mission | null;
  availableMissions: Mission[];
  
  // Mission progress
  currentProgress: MissionProgress | null;
  missionHistory: MissionProgress[];
  
  // Statistics
  missionStatistics: { [missionId: number]: MissionStatistics };
  
  // Bright Data sync
  syncHistory: BrightDataMissionSync[];
  lastSyncStatus: BrightDataMissionSync | null;
  
  // Filtering and search
  filter: MissionFilter;
  filteredMissions: Mission[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Unity integration
  unityMissionData: any | null;
  isUnityConnected: boolean;
  
  // Cache timestamps
  lastMissionsLoad: number | null;
  lastSyncCheck: number | null;
}

export const initialMissionState: MissionState = {
  // Mission data
  missions: [],
  selectedMission: null,
  availableMissions: [],
  
  // Mission progress
  currentProgress: null,
  missionHistory: [],
  
  // Statistics
  missionStatistics: {},
  
  // Bright Data sync
  syncHistory: [],
  lastSyncStatus: null,
  
  // Filtering and search
  filter: {},
  filteredMissions: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Unity integration
  unityMissionData: null,
  isUnityConnected: false,
  
  // Cache timestamps
  lastMissionsLoad: null,
  lastSyncCheck: null
};
