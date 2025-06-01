import { createReducer, on } from '@ngrx/store';
import { EnhancedStarship, EnhancedPlanet } from '../../shared/models/bright-data-models';
import * as BrightDataActions from './bright-data.actions';

export interface BrightDataState {
  // Starships data from Bright Data MCP
  starships: EnhancedStarship[];
  selectedStarship: EnhancedStarship | null;
  starshipFilters: {
    faction: 'rebel' | 'empire' | 'neutral' | 'all';
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'all';
    searchQuery: string;
  };

  // Planets data from Bright Data MCP
  planets: EnhancedPlanet[];
  selectedPlanet: EnhancedPlanet | null;
  planetFilters: {
    climate: string;
    searchQuery: string;
  };

  // 3D Scene state
  scene3D: {
    initialized: boolean;
    sceneType: 'starship' | 'planet' | 'battle' | null;
    loadedModels: { [key: string]: any };
    physicsWorld: any;
  };

  // Game state
  gameState: {
    currentBattle: {
      playerStarship: EnhancedStarship | null;
      enemyStarship: EnhancedStarship | null;
      isActive: boolean;
    };
    currentExploration: {
      planet: EnhancedPlanet | null;
      isActive: boolean;
      collectedResources: { [key: string]: number };
    };
    playerProgress: {
      level: number;
      experience: number;
      credits: number;
      unlockedStarships: number[];
      unlockedPlanets: number[];
    };
  };

  // UI state
  ui: {
    loading: boolean;
    error: string | null;
    selectedView: 'starships' | 'planets' | 'battle' | 'exploration';
    lastSyncTimestamp: string | null;
  };
}

export const initialState: BrightDataState = {
  starships: [],
  selectedStarship: null,
  starshipFilters: {
    faction: 'all',
    rarity: 'all',
    searchQuery: ''
  },

  planets: [],
  selectedPlanet: null,
  planetFilters: {
    climate: 'all',
    searchQuery: ''
  },

  scene3D: {
    initialized: false,
    sceneType: null,
    loadedModels: {},
    physicsWorld: null
  },

  gameState: {
    currentBattle: {
      playerStarship: null,
      enemyStarship: null,
      isActive: false
    },
    currentExploration: {
      planet: null,
      isActive: false,
      collectedResources: {}
    },
    playerProgress: {
      level: 1,
      experience: 0,
      credits: 1000,
      unlockedStarships: [],
      unlockedPlanets: []
    }
  },

  ui: {
    loading: false,
    error: null,
    selectedView: 'starships',
    lastSyncTimestamp: null
  }
};

export const brightDataReducer = createReducer(
  initialState,

  // ===== STARSHIP REDUCERS =====
  on(BrightDataActions.loadEnhancedStarships, (state) => ({
    ...state,
    ui: { ...state.ui, loading: true, error: null }
  })),

  on(BrightDataActions.loadEnhancedStarshipsSuccess, (state, { starships }) => ({
    ...state,
    starships,
    ui: { ...state.ui, loading: false }
  })),

  on(BrightDataActions.loadEnhancedStarshipsFailure, (state, { error }) => ({
    ...state,
    ui: { ...state.ui, loading: false, error }
  })),

  on(BrightDataActions.loadEnhancedStarshipSuccess, (state, { starship }) => ({
    ...state,
    starships: state.starships.map(s => s.id === starship.id ? starship : s),
    selectedStarship: starship,
    ui: { ...state.ui, loading: false }
  })),

  on(BrightDataActions.selectStarshipFor3D, (state, { starship }) => ({
    ...state,
    selectedStarship: starship,
    scene3D: { ...state.scene3D, sceneType: 'starship' }
  })),

  // ===== PLANET REDUCERS =====
  on(BrightDataActions.loadEnhancedPlanets, (state) => ({
    ...state,
    ui: { ...state.ui, loading: true, error: null }
  })),

  on(BrightDataActions.loadEnhancedPlanetsSuccess, (state, { planets }) => ({
    ...state,
    planets,
    ui: { ...state.ui, loading: false }
  })),

  on(BrightDataActions.loadEnhancedPlanetsFailure, (state, { error }) => ({
    ...state,
    ui: { ...state.ui, loading: false, error }
  })),

  on(BrightDataActions.loadEnhancedPlanetSuccess, (state, { planet }) => ({
    ...state,
    planets: state.planets.map(p => p.id === planet.id ? planet : p),
    selectedPlanet: planet,
    ui: { ...state.ui, loading: false }
  })),

  on(BrightDataActions.selectPlanetFor3D, (state, { planet }) => ({
    ...state,
    selectedPlanet: planet,
    scene3D: { ...state.scene3D, sceneType: 'planet' }
  })),

  // ===== 3D SCENE REDUCERS =====
  on(BrightDataActions.initialize3DScene, (state, { sceneType }) => ({
    ...state,
    scene3D: {
      ...state.scene3D,
      initialized: true,
      sceneType
    }
  })),

  on(BrightDataActions.load3DModelSuccess, (state, { modelId, model }) => ({
    ...state,
    scene3D: {
      ...state.scene3D,
      loadedModels: {
        ...state.scene3D.loadedModels,
        [modelId]: model
      }
    }
  })),

  on(BrightDataActions.updatePhysicsWorld, (state, { physicsConfig }) => ({
    ...state,
    scene3D: {
      ...state.scene3D,
      physicsWorld: physicsConfig
    }
  })),

  // ===== GAME STATE REDUCERS =====
  on(BrightDataActions.startBattleWithStarship, (state, { starship, enemy }) => ({
    ...state,
    gameState: {
      ...state.gameState,
      currentBattle: {
        playerStarship: starship,
        enemyStarship: enemy || null,
        isActive: true
      }
    },
    scene3D: { ...state.scene3D, sceneType: 'battle' }
  })),

  on(BrightDataActions.explorePlanet, (state, { planet }) => ({
    ...state,
    gameState: {
      ...state.gameState,
      currentExploration: {
        planet,
        isActive: true,
        collectedResources: {}
      }
    },
    scene3D: { ...state.scene3D, sceneType: 'planet' }
  })),

  on(BrightDataActions.collectResource, (state, { planetId, resourceType, amount }) => ({
    ...state,
    gameState: {
      ...state.gameState,
      currentExploration: {
        ...state.gameState.currentExploration,
        collectedResources: {
          ...state.gameState.currentExploration.collectedResources,
          [resourceType]: (state.gameState.currentExploration.collectedResources[resourceType] || 0) + amount
        }
      }
    }
  })),

  // ===== FILTER REDUCERS =====
  on(BrightDataActions.filterStarshipsByFaction, (state, { faction }) => ({
    ...state,
    starshipFilters: { ...state.starshipFilters, faction }
  })),

  on(BrightDataActions.filterStarshipsByRarity, (state, { rarity }) => ({
    ...state,
    starshipFilters: { ...state.starshipFilters, rarity }
  })),

  on(BrightDataActions.searchStarships, (state, { query }) => ({
    ...state,
    starshipFilters: { ...state.starshipFilters, searchQuery: query }
  })),

  on(BrightDataActions.filterPlanetsByClimate, (state, { climate }) => ({
    ...state,
    planetFilters: { ...state.planetFilters, climate }
  })),

  on(BrightDataActions.searchPlanets, (state, { query }) => ({
    ...state,
    planetFilters: { ...state.planetFilters, searchQuery: query }
  })),

  // ===== UI STATE REDUCERS =====
  on(BrightDataActions.setLoading, (state, { loading }) => ({
    ...state,
    ui: { ...state.ui, loading }
  })),

  on(BrightDataActions.setError, (state, { error }) => ({
    ...state,
    ui: { ...state.ui, error }
  })),

  on(BrightDataActions.clearError, (state) => ({
    ...state,
    ui: { ...state.ui, error: null }
  })),

  on(BrightDataActions.setSelectedView, (state, { view }) => ({
    ...state,
    ui: { ...state.ui, selectedView: view }
  })),

  on(BrightDataActions.syncWithBrightDataSuccess, (state, { timestamp }) => ({
    ...state,
    ui: { ...state.ui, lastSyncTimestamp: timestamp }
  }))
);
