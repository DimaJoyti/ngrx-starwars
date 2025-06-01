package models

import (
	"time"
)

// Mission represents a game mission with objectives and rewards
type Mission struct {
	ID                int    `json:"id" gorm:"primaryKey"`
	Name              string `json:"name" gorm:"not null"`
	Description       string `json:"description"`
	ShortDescription  string `json:"short_description"`
	Type              string `json:"type"`       // story, exploration, combat, collection, rescue, stealth, racing, diplomatic
	Category          string `json:"category"`   // main, side, daily, weekly, special
	Difficulty        int    `json:"difficulty"` // 1-10
	MinLevel          int    `json:"min_level"`
	MaxLevel          int    `json:"max_level"`
	EstimatedDuration int    `json:"estimated_duration"` // in minutes

	// Story and lore
	Era        string   `json:"era"` // prequel, original, sequel, high_republic, old_republic
	Planet     string   `json:"planet"`
	Faction    string   `json:"faction"` // rebel, empire, republic, separatist, neutral
	Characters []string `json:"characters" gorm:"type:json"`

	// Prerequisites
	RequiredMissions []int    `json:"required_missions" gorm:"type:json"`
	RequiredLevel    int      `json:"required_level"`
	RequiredItems    []string `json:"required_items" gorm:"type:json"`

	// Rewards
	ExperienceReward int      `json:"experience_reward"`
	CreditsReward    int      `json:"credits_reward"`
	ItemRewards      []string `json:"item_rewards" gorm:"type:json"`

	// Mission state
	IsActive      bool `json:"is_active"`
	IsRepeatable  bool `json:"is_repeatable"`
	CooldownHours int  `json:"cooldown_hours"`

	// 3D and Unity integration
	UnitySceneName string        `json:"unity_scene_name"`
	Environment3D  Environment3D `json:"environment_3d" gorm:"embedded"`

	// Bright Data integration
	SourceURL       string     `json:"source_url"`
	WookieepediaURL string     `json:"wookieepedia_url"`
	LastSyncedAt    *time.Time `json:"last_synced_at"`

	// Relationships
	Objectives []MissionObjective `json:"objectives" gorm:"foreignKey:MissionID"`

	// Timestamps
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// MissionObjective represents a specific objective within a mission
type MissionObjective struct {
	ID           int    `json:"id" gorm:"primaryKey"`
	MissionID    int    `json:"mission_id"`
	Name         string `json:"name" gorm:"not null"`
	Description  string `json:"description"`
	Type         string `json:"type"`          // kill, collect, reach, interact, survive, escort, defend
	Target       string `json:"target"`        // what to interact with
	TargetCount  int    `json:"target_count"`  // how many
	CurrentCount int    `json:"current_count"` // progress
	IsOptional   bool   `json:"is_optional"`
	OrderIndex   int    `json:"order_index"` // sequence order

	// 3D positioning
	Position3D Position3D `json:"position_3d" gorm:"embedded"`

	// Rewards for completing this objective
	ExperienceReward int `json:"experience_reward"`
	CreditsReward    int `json:"credits_reward"`

	// State
	IsCompleted bool       `json:"is_completed"`
	CompletedAt *time.Time `json:"completed_at"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// MissionProgress tracks player progress on missions
type MissionProgress struct {
	ID        int    `json:"id" gorm:"primaryKey"`
	PlayerID  int    `json:"player_id"`
	MissionID int    `json:"mission_id"`
	Status    string `json:"status"` // not_started, in_progress, completed, failed, abandoned

	// Progress tracking
	ObjectivesCompleted int     `json:"objectives_completed"`
	TotalObjectives     int     `json:"total_objectives"`
	ProgressPercentage  float64 `json:"progress_percentage"`

	// Performance metrics
	StartedAt   *time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at"`
	TimeSpent   int        `json:"time_spent"` // in seconds
	DeathCount  int        `json:"death_count"`
	Rating      int        `json:"rating"` // 1-5 stars

	// Rewards received
	ExperienceEarned int      `json:"experience_earned"`
	CreditsEarned    int      `json:"credits_earned"`
	ItemsEarned      []string `json:"items_earned" gorm:"type:json"`

	// Replay data
	PlayCount  int `json:"play_count"`
	BestTime   int `json:"best_time"` // best completion time in seconds
	BestRating int `json:"best_rating"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Environment3D represents 3D environment settings for Unity
type Environment3D struct {
	// Skybox and lighting
	SkyboxTexture string  `json:"skybox_texture"`
	AmbientColor  string  `json:"ambient_color"`
	SunColor      string  `json:"sun_color"`
	SunIntensity  float64 `json:"sun_intensity"` // Light intensity 0.0-2.0

	// Terrain configuration
	TerrainType    string  `json:"terrain_type"`
	TerrainTexture string  `json:"terrain_texture"` // Path to terrain texture
	TerrainScale   float64 `json:"terrain_scale"`   // Terrain size multiplier
	TerrainHeight  float64 `json:"terrain_height"`  // Maximum terrain height

	// Weather and effects
	WeatherType     string   `json:"weather_type"`
	ParticleEffects []string `json:"particle_effects" gorm:"type:json"`
	FogDensity      float64  `json:"fog_density"` // Fog density 0.0-1.0
	FogColor        string   `json:"fog_color"`   // Hex color for fog

	// Audio environment
	MusicTrack   string   `json:"music_track"`
	SoundEffects []string `json:"sound_effects" gorm:"type:json"`
	AmbientSound string   `json:"ambient_sound"` // Path to ambient audio file
}

// Position3D represents 3D coordinates
type Position3D struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

// MissionTemplate represents a template for generating missions from Bright Data
type MissionTemplate struct {
	ID           int                    `json:"id" gorm:"primaryKey"`
	Name         string                 `json:"name"`
	Type         string                 `json:"type"`
	TemplateData map[string]interface{} `json:"template_data" gorm:"type:json"`

	// Bright Data source
	SourceType    string                 `json:"source_type"` // wookieepedia, starwars_com, fan_site
	SourceURL     string                 `json:"source_url"`
	ScrapingRules map[string]interface{} `json:"scraping_rules" gorm:"type:json"`

	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// MissionEvent represents events that occur during missions
type MissionEvent struct {
	ID        int                    `json:"id" gorm:"primaryKey"`
	MissionID int                    `json:"mission_id"`
	PlayerID  int                    `json:"player_id"`
	EventType string                 `json:"event_type"` // objective_completed, death, item_collected, enemy_defeated
	EventData map[string]interface{} `json:"event_data" gorm:"type:json"`
	Timestamp time.Time              `json:"timestamp"`

	CreatedAt time.Time `json:"created_at"`
}

// MissionReward represents rewards that can be earned from missions
type MissionReward struct {
	ID           int     `json:"id" gorm:"primaryKey"`
	MissionID    int     `json:"mission_id"`
	Type         string  `json:"type"`      // experience, credits, item, card, achievement
	Value        string  `json:"value"`     // amount or item name
	Condition    string  `json:"condition"` // completion, rating, time_limit
	IsGuaranteed bool    `json:"is_guaranteed"`
	DropChance   float64 `json:"drop_chance"` // 0.0 - 1.0

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BrightDataMissionSync represents sync status with Bright Data sources
type BrightDataMissionSync struct {
	ID              int       `json:"id" gorm:"primaryKey"`
	SourceURL       string    `json:"source_url"`
	SourceType      string    `json:"source_type"`
	LastSyncAt      time.Time `json:"last_sync_at"`
	SyncStatus      string    `json:"sync_status"` // success, failed, in_progress
	MissionsFound   int       `json:"missions_found"`
	MissionsCreated int       `json:"missions_created"`
	MissionsUpdated int       `json:"missions_updated"`
	ErrorMessage    string    `json:"error_message"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
