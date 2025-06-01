import { createAction, props } from '@ngrx/store';
import { EnhancedStarship, EnhancedPlanet } from '../../shared/models/bright-data-models';

// ===== STARSHIP ACTIONS =====

export const loadEnhancedStarships = createAction(
  '[Bright Data] Load Enhanced Starships'
);

export const loadEnhancedStarshipsSuccess = createAction(
  '[Bright Data] Load Enhanced Starships Success',
  props<{ starships: EnhancedStarship[] }>()
);

export const loadEnhancedStarshipsFailure = createAction(
  '[Bright Data] Load Enhanced Starships Failure',
  props<{ error: string }>()
);

export const loadEnhancedStarship = createAction(
  '[Bright Data] Load Enhanced Starship',
  props<{ id: number }>()
);

export const loadEnhancedStarshipSuccess = createAction(
  '[Bright Data] Load Enhanced Starship Success',
  props<{ starship: EnhancedStarship }>()
);

export const loadEnhancedStarshipFailure = createAction(
  '[Bright Data] Load Enhanced Starship Failure',
  props<{ error: string }>()
);

export const selectStarshipFor3D = createAction(
  '[Bright Data] Select Starship For 3D',
  props<{ starship: EnhancedStarship }>()
);

export const updateStarshipPhysics = createAction(
  '[Bright Data] Update Starship Physics',
  props<{ starshipId: number; physicsConfig: any }>()
);

// ===== PLANET ACTIONS =====

export const loadEnhancedPlanets = createAction(
  '[Bright Data] Load Enhanced Planets'
);

export const loadEnhancedPlanetsSuccess = createAction(
  '[Bright Data] Load Enhanced Planets Success',
  props<{ planets: EnhancedPlanet[] }>()
);

export const loadEnhancedPlanetsFailure = createAction(
  '[Bright Data] Load Enhanced Planets Failure',
  props<{ error: string }>()
);

export const loadEnhancedPlanet = createAction(
  '[Bright Data] Load Enhanced Planet',
  props<{ id: number }>()
);

export const loadEnhancedPlanetSuccess = createAction(
  '[Bright Data] Load Enhanced Planet Success',
  props<{ planet: EnhancedPlanet }>()
);

export const loadEnhancedPlanetFailure = createAction(
  '[Bright Data] Load Enhanced Planet Failure',
  props<{ error: string }>()
);

export const selectPlanetFor3D = createAction(
  '[Bright Data] Select Planet For 3D',
  props<{ planet: EnhancedPlanet }>()
);

export const updatePlanetEnvironment = createAction(
  '[Bright Data] Update Planet Environment',
  props<{ planetId: number; environment: any }>()
);

// ===== 3D INTEGRATION ACTIONS =====

export const initialize3DScene = createAction(
  '[Bright Data] Initialize 3D Scene',
  props<{ sceneType: 'starship' | 'planet' | 'battle' }>()
);

export const load3DModel = createAction(
  '[Bright Data] Load 3D Model',
  props<{ modelPath: string; modelType: 'starship' | 'planet' }>()
);

export const load3DModelSuccess = createAction(
  '[Bright Data] Load 3D Model Success',
  props<{ modelId: string; model: any }>()
);

export const load3DModelFailure = createAction(
  '[Bright Data] Load 3D Model Failure',
  props<{ error: string }>()
);

export const updatePhysicsWorld = createAction(
  '[Bright Data] Update Physics World',
  props<{ physicsConfig: any }>()
);

// ===== GAME INTEGRATION ACTIONS =====

export const startBattleWithStarship = createAction(
  '[Bright Data] Start Battle With Starship',
  props<{ starship: EnhancedStarship; enemy?: EnhancedStarship }>()
);

export const explorePlanet = createAction(
  '[Bright Data] Explore Planet',
  props<{ planet: EnhancedPlanet }>()
);

export const collectResource = createAction(
  '[Bright Data] Collect Resource',
  props<{ planetId: number; resourceType: string; amount: number }>()
);

export const upgradeStarship = createAction(
  '[Bright Data] Upgrade Starship',
  props<{ starshipId: number; upgradeType: string; level: number }>()
);

// ===== DATA SYNC ACTIONS =====

export const syncWithBrightData = createAction(
  '[Bright Data] Sync With Bright Data'
);

export const syncWithBrightDataSuccess = createAction(
  '[Bright Data] Sync With Bright Data Success',
  props<{ timestamp: string }>()
);

export const syncWithBrightDataFailure = createAction(
  '[Bright Data] Sync With Bright Data Failure',
  props<{ error: string }>()
);

export const refreshDataFromAPI = createAction(
  '[Bright Data] Refresh Data From API'
);

// ===== UI STATE ACTIONS =====

export const setLoading = createAction(
  '[Bright Data] Set Loading',
  props<{ loading: boolean }>()
);

export const setError = createAction(
  '[Bright Data] Set Error',
  props<{ error: string | null }>()
);

export const clearError = createAction(
  '[Bright Data] Clear Error'
);

export const setSelectedView = createAction(
  '[Bright Data] Set Selected View',
  props<{ view: 'starships' | 'planets' | 'battle' | 'exploration' }>()
);

// ===== FILTER AND SEARCH ACTIONS =====

export const filterStarshipsByFaction = createAction(
  '[Bright Data] Filter Starships By Faction',
  props<{ faction: 'rebel' | 'empire' | 'neutral' | 'all' }>()
);

export const filterStarshipsByRarity = createAction(
  '[Bright Data] Filter Starships By Rarity',
  props<{ rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'all' }>()
);

export const searchStarships = createAction(
  '[Bright Data] Search Starships',
  props<{ query: string }>()
);

export const filterPlanetsByClimate = createAction(
  '[Bright Data] Filter Planets By Climate',
  props<{ climate: string }>()
);

export const searchPlanets = createAction(
  '[Bright Data] Search Planets',
  props<{ query: string }>()
);
