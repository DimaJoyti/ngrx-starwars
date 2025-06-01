export interface Mission {
  id: number;
  name: string;
  description: string;
  short_description: string;
  type: MissionType;
  category: MissionCategory;
  difficulty: number;
  min_level: number;
  max_level: number;
  estimated_duration: number;
  
  // Story and lore
  era: StarWarsEra;
  planet: string;
  faction: Faction;
  characters: string[];
  
  // Prerequisites
  required_missions: number[];
  required_level: number;
  required_items: string[];
  
  // Rewards
  experience_reward: number;
  credits_reward: number;
  item_rewards: string[];
  
  // Mission state
  is_active: boolean;
  is_repeatable: boolean;
  cooldown_hours: number;
  
  // 3D and Unity integration
  unity_scene_name: string;
  environment_3d: Environment3D;
  
  // Bright Data integration
  source_url: string;
  wookieepedia_url: string;
  last_synced_at?: string;
  
  // Relationships
  objectives: MissionObjective[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MissionObjective {
  id: number;
  mission_id: number;
  name: string;
  description: string;
  type: ObjectiveType;
  target: string;
  target_count: number;
  current_count: number;
  is_optional: boolean;
  order_index: number;
  
  // 3D positioning
  position_3d: Position3D;
  
  // Rewards
  experience_reward: number;
  credits_reward: number;
  
  // State
  is_completed: boolean;
  completed_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface MissionProgress {
  id: number;
  player_id: number;
  mission_id: number;
  status: MissionStatus;
  
  // Progress tracking
  objectives_completed: number;
  total_objectives: number;
  progress_percentage: number;
  
  // Performance metrics
  started_at?: string;
  completed_at?: string;
  time_spent: number;
  death_count: number;
  rating: number;
  
  // Rewards received
  experience_earned: number;
  credits_earned: number;
  items_earned: string[];
  
  // Replay data
  play_count: number;
  best_time: number;
  best_rating: number;
  
  created_at: string;
  updated_at: string;
}

export interface Environment3D {
  skybox_texture: string;
  ambient_color: string;
  sun_color: string;
  terrain_type: string;
  weather_type: string;
  particle_effects: string[];
  music_track: string;
  sound_effects: string[];
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface MissionEvent {
  id: number;
  mission_id: number;
  player_id: number;
  event_type: string;
  event_data: any;
  timestamp: string;
  created_at: string;
}

export interface BrightDataMissionSync {
  id: number;
  source_url: string;
  source_type: string;
  last_sync_at: string;
  sync_status: SyncStatus;
  missions_found: number;
  missions_created: number;
  missions_updated: number;
  error_message: string;
  created_at: string;
  updated_at: string;
}

// Enums
export type MissionType = 
  | 'story' 
  | 'exploration' 
  | 'combat' 
  | 'collection' 
  | 'rescue' 
  | 'stealth' 
  | 'racing' 
  | 'diplomatic'
  | 'defense'
  | 'escape'
  | 'duel'
  | 'survival';

export type MissionCategory = 
  | 'main' 
  | 'side' 
  | 'daily' 
  | 'weekly' 
  | 'special';

export type StarWarsEra = 
  | 'prequel' 
  | 'original' 
  | 'sequel' 
  | 'high_republic' 
  | 'old_republic';

export type Faction = 
  | 'rebel' 
  | 'empire' 
  | 'republic' 
  | 'separatist' 
  | 'neutral'
  | 'first_order'
  | 'resistance';

export type ObjectiveType = 
  | 'kill' 
  | 'collect' 
  | 'reach' 
  | 'interact' 
  | 'survive' 
  | 'escort' 
  | 'defend';

export type MissionStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'abandoned';

export type SyncStatus = 
  | 'success' 
  | 'failed' 
  | 'in_progress';

// Request/Response interfaces
export interface StartMissionRequest {
  player_id: number;
}

export interface CompleteMissionRequest {
  player_id: number;
  rating: number;
}

export interface UpdateObjectiveProgressRequest {
  player_id: number;
  progress: number;
}

export interface MissionStatistics {
  total_attempts: number;
  completion_rate: number;
  average_rating: number;
  average_completion_time: number;
}

// Filter interfaces
export interface MissionFilter {
  type?: MissionType;
  category?: MissionCategory;
  era?: StarWarsEra;
  faction?: Faction;
  difficulty_min?: number;
  difficulty_max?: number;
  level_min?: number;
  level_max?: number;
  planet?: string;
  is_completed?: boolean;
  search_term?: string;
}

// Unity integration interfaces
export interface UnityMissionData {
  mission_id: number;
  scene_name: string;
  environment: Environment3D;
  objectives: UnityObjective[];
  player_progress: MissionProgress;
}

export interface UnityObjective {
  id: number;
  name: string;
  type: ObjectiveType;
  target: string;
  target_count: number;
  current_count: number;
  position: Position3D;
  is_completed: boolean;
}

// Mission difficulty levels
export const MISSION_DIFFICULTY_LABELS = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Normal',
  4: 'Normal',
  5: 'Medium',
  6: 'Medium',
  7: 'Hard',
  8: 'Hard',
  9: 'Very Hard',
  10: 'Extreme'
} as const;

// Mission type icons
export const MISSION_TYPE_ICONS = {
  story: 'book-open',
  exploration: 'map',
  combat: 'sword',
  collection: 'package',
  rescue: 'shield',
  stealth: 'eye-off',
  racing: 'zap',
  diplomatic: 'message-circle',
  defense: 'shield-check',
  escape: 'arrow-right',
  duel: 'swords',
  survival: 'heart'
} as const;

// Era colors
export const ERA_COLORS = {
  prequel: '#4A90E2',
  original: '#F5A623',
  sequel: '#7ED321',
  high_republic: '#9013FE',
  old_republic: '#FF6B6B'
} as const;
