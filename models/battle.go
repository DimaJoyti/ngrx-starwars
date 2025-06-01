package models

import (
	"gorm.io/gorm"
	"time"
)

// Battle represents a combat encounter between fleets
type Battle struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Battle information
	Name   string `json:"name"`
	Type   string `json:"type" gorm:"not null"`              // pvp, pve, mission, event
	Status string `json:"status" gorm:"default:'preparing'"` // preparing, active, completed, abandoned

	// Battle participants
	Participants []BattleParticipant `json:"participants" gorm:"foreignKey:BattleID"`

	// Battle settings
	MaxTurns      int `json:"max_turns" gorm:"default:50"`
	CurrentTurn   int `json:"current_turn" gorm:"default:0"`
	TurnTimeLimit int `json:"turn_time_limit" gorm:"default:30"` // seconds

	// Battle location
	LocationID   *uint  `json:"location_id"`
	LocationName string `json:"location_name"`
	Environment  string `json:"environment"` // space, asteroid_field, nebula, etc.

	// Battle results
	WinnerID    *uint      `json:"winner_id"`
	StartedAt   *time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at"`
	Duration    int        `json:"duration"` // seconds

	// Battle rewards
	ExperienceReward int    `json:"experience_reward" gorm:"default:0"`
	CreditsReward    int    `json:"credits_reward" gorm:"default:0"`
	ItemRewards      string `json:"item_rewards"` // JSON array of items

	// Battle actions log
	Actions []BattleAction `json:"actions" gorm:"foreignKey:BattleID"`
}

// BattleParticipant represents a player or AI participant in a battle
type BattleParticipant struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Participant information
	BattleID uint   `json:"battle_id" gorm:"not null"`
	PlayerID *uint  `json:"player_id"` // null for AI participants
	FleetID  uint   `json:"fleet_id" gorm:"not null"`
	IsAI     bool   `json:"is_ai" gorm:"default:false"`
	AIType   string `json:"ai_type"` // easy, medium, hard, boss

	// Participant status
	IsActive bool   `json:"is_active" gorm:"default:true"`
	IsWinner bool   `json:"is_winner" gorm:"default:false"`
	Position int    `json:"position"`                      // battle position (1, 2, 3, etc.)
	Team     string `json:"team" gorm:"default:'neutral'"` // team1, team2, neutral

	// Battle statistics
	DamageDealt      int `json:"damage_dealt" gorm:"default:0"`
	DamageTaken      int `json:"damage_taken" gorm:"default:0"`
	ShipsDestroyed   int `json:"ships_destroyed" gorm:"default:0"`
	ShipsLost        int `json:"ships_lost" gorm:"default:0"`
	ActionsPerformed int `json:"actions_performed" gorm:"default:0"`

	// Relationships
	Battle Battle `json:"battle" gorm:"foreignKey:BattleID"`
	Fleet  Fleet  `json:"fleet" gorm:"foreignKey:FleetID"`
}

// BattleAction represents an action taken during a battle
type BattleAction struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Action information
	BattleID      uint   `json:"battle_id" gorm:"not null"`
	ParticipantID uint   `json:"participant_id" gorm:"not null"`
	Turn          int    `json:"turn" gorm:"not null"`
	ActionType    string `json:"action_type" gorm:"not null"` // attack, defend, special, move, retreat

	// Action details
	SourceShipID   uint   `json:"source_ship_id" gorm:"not null"`
	TargetShipID   *uint  `json:"target_ship_id"`
	TargetPosition string `json:"target_position"` // for movement actions

	// Action effects
	Damage       int `json:"damage" gorm:"default:0"`
	ShieldDamage int `json:"shield_damage" gorm:"default:0"`
	HealAmount   int `json:"heal_amount" gorm:"default:0"`
	EnergyUsed   int `json:"energy_used" gorm:"default:0"`

	// Action results
	IsSuccessful  bool   `json:"is_successful" gorm:"default:true"`
	IsCritical    bool   `json:"is_critical" gorm:"default:false"`
	ResultMessage string `json:"result_message"`

	// Relationships
	Battle      Battle            `json:"battle" gorm:"foreignKey:BattleID"`
	Participant BattleParticipant `json:"participant" gorm:"foreignKey:ParticipantID"`
	SourceShip  Ship              `json:"source_ship" gorm:"foreignKey:SourceShipID"`
	TargetShip  *Ship             `json:"target_ship" gorm:"foreignKey:TargetShipID"`
}

// BattleResult represents the outcome of a battle
type BattleResult struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Result information
	BattleID   uint   `json:"battle_id" gorm:"not null;uniqueIndex"`
	WinnerID   *uint  `json:"winner_id"`
	ResultType string `json:"result_type" gorm:"not null"` // victory, defeat, draw, timeout

	// Battle statistics
	TotalTurns     int `json:"total_turns"`
	TotalDamage    int `json:"total_damage"`
	TotalShipsLost int `json:"total_ships_lost"`
	BattleDuration int `json:"battle_duration"` // seconds

	// Rewards distributed
	ExperienceAwarded int    `json:"experience_awarded"`
	CreditsAwarded    int    `json:"credits_awarded"`
	ItemsAwarded      string `json:"items_awarded"` // JSON array

	// Performance ratings
	OverallRating    int `json:"overall_rating" gorm:"default:0"` // 1-5 stars
	StrategyRating   int `json:"strategy_rating" gorm:"default:0"`
	EfficiencyRating int `json:"efficiency_rating" gorm:"default:0"`

	// Relationships
	Battle Battle `json:"battle" gorm:"foreignKey:BattleID"`
}

// BattleTemplate represents predefined battle scenarios
type BattleTemplate struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Template information
	Name        string `json:"name" gorm:"not null;uniqueIndex"`
	Description string `json:"description"`
	Type        string `json:"type" gorm:"not null"`        // mission, event, training, pvp
	Difficulty  int    `json:"difficulty" gorm:"default:1"` // 1-10

	// Battle settings
	MaxParticipants int    `json:"max_participants" gorm:"default:2"`
	MaxTurns        int    `json:"max_turns" gorm:"default:50"`
	Environment     string `json:"environment" gorm:"default:'space'"`

	// Requirements
	MinLevel      int `json:"min_level" gorm:"default:1"`
	RequiredShips int `json:"required_ships" gorm:"default:1"`

	// Rewards
	BaseExperience  int    `json:"base_experience" gorm:"default:100"`
	BaseCredits     int    `json:"base_credits" gorm:"default:50"`
	PossibleRewards string `json:"possible_rewards"` // JSON array

	// AI configuration
	AIFleetConfig string `json:"ai_fleet_config"`                       // JSON configuration for AI fleet
	AIBehavior    string `json:"ai_behavior" gorm:"default:'balanced'"` // aggressive, defensive, balanced

	// Availability
	IsActive        bool  `json:"is_active" gorm:"default:true"`
	RequiredMission *uint `json:"required_mission"` // prerequisite mission
}
