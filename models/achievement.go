package models

import (
	"gorm.io/gorm"
	"time"
)

// Achievement represents an achievement that players can unlock
type Achievement struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Achievement information
	Name        string `json:"name" gorm:"not null;uniqueIndex"`
	Title       string `json:"title" gorm:"not null"` // Display title
	Description string `json:"description" gorm:"not null"`
	Category    string `json:"category" gorm:"not null"` // combat, exploration, collection, etc.

	// Achievement requirements
	Type      string `json:"type" gorm:"not null"`      // count, boolean, milestone
	Target    int    `json:"target" gorm:"default:1"`   // Target value to achieve
	Condition string `json:"condition" gorm:"not null"` // What needs to be done

	// Achievement properties
	Difficulty   string `json:"difficulty" gorm:"default:'easy'"`   // easy, medium, hard, legendary
	Points       int    `json:"points" gorm:"default:10"`           // Achievement points
	IsHidden     bool   `json:"is_hidden" gorm:"default:false"`     // Hidden until unlocked
	IsRepeatable bool   `json:"is_repeatable" gorm:"default:false"` // Can be earned multiple times

	// Rewards
	CreditsReward    int    `json:"credits_reward" gorm:"default:0"`
	CrystalsReward   int    `json:"crystals_reward" gorm:"default:0"`
	ExperienceReward int    `json:"experience_reward" gorm:"default:0"`
	ItemRewards      string `json:"item_rewards"` // JSON array of items
	TitleReward      string `json:"title_reward"` // Special title

	// Display properties
	Icon   string `json:"icon"`                           // Icon path/URL
	Badge  string `json:"badge"`                          // Badge image
	Color  string `json:"color" gorm:"default:'#gold'"`   // Achievement color
	Rarity string `json:"rarity" gorm:"default:'common'"` // common, rare, epic, legendary

	// Prerequisites
	RequiredLevel        int    `json:"required_level" gorm:"default:1"`
	RequiredAchievements string `json:"required_achievements"` // JSON array of prerequisite achievement IDs

	// Availability
	IsActive  bool       `json:"is_active" gorm:"default:true"`
	StartDate *time.Time `json:"start_date"` // When achievement becomes available
	EndDate   *time.Time `json:"end_date"`   // When achievement expires (for events)

	// Statistics
	TotalUnlocked int     `json:"total_unlocked" gorm:"default:0"` // How many players unlocked this
	UnlockRate    float64 `json:"unlock_rate" gorm:"default:0.0"`  // Percentage of players who unlocked

	// Relationships
	PlayerAchievements []PlayerAchievement `json:"player_achievements" gorm:"foreignKey:AchievementID"`
}

// PlayerAchievement represents a player's progress on an achievement
type PlayerAchievement struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Player and achievement reference
	PlayerID      uint `json:"player_id" gorm:"not null"`
	AchievementID uint `json:"achievement_id" gorm:"not null"`

	// Progress tracking
	CurrentProgress int     `json:"current_progress" gorm:"default:0"`
	TargetProgress  int     `json:"target_progress" gorm:"not null"`
	ProgressPercent float64 `json:"progress_percent" gorm:"default:0.0"`

	// Status
	IsUnlocked bool       `json:"is_unlocked" gorm:"default:false"`
	IsNotified bool       `json:"is_notified" gorm:"default:false"` // Has player been notified
	UnlockedAt *time.Time `json:"unlocked_at"`

	// Tracking data
	FirstProgressAt *time.Time `json:"first_progress_at"`               // When player first made progress
	LastProgressAt  *time.Time `json:"last_progress_at"`                // When player last made progress
	TimesToUnlock   int        `json:"times_unlocked" gorm:"default:0"` // For repeatable achievements

	// Rewards claimed
	RewardsClaimed bool       `json:"rewards_claimed" gorm:"default:false"`
	ClaimedAt      *time.Time `json:"claimed_at"`

	// Relationships
	Achievement Achievement `json:"achievement" gorm:"foreignKey:AchievementID"`

	// Composite index for efficient queries
	// gorm:"uniqueIndex:idx_player_achievement"
}

// AchievementProgress represents detailed progress tracking for complex achievements
type AchievementProgress struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Progress information
	PlayerAchievementID uint   `json:"player_achievement_id" gorm:"not null"`
	ProgressType        string `json:"progress_type" gorm:"not null"` // increment, set, milestone
	ProgressValue       int    `json:"progress_value" gorm:"not null"`
	PreviousValue       int    `json:"previous_value" gorm:"default:0"`

	// Context information
	Source         string `json:"source"`          // What triggered this progress (battle, mission, etc.)
	SourceID       *uint  `json:"source_id"`       // ID of the source entity
	AdditionalData string `json:"additional_data"` // JSON data for complex tracking

	// Relationships
	PlayerAchievement PlayerAchievement `json:"player_achievement" gorm:"foreignKey:PlayerAchievementID"`
}

// AchievementCategory represents categories for organizing achievements
type AchievementCategory struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Category information
	Name        string `json:"name" gorm:"not null;uniqueIndex"`
	DisplayName string `json:"display_name" gorm:"not null"`
	Description string `json:"description"`

	// Display properties
	Icon      string `json:"icon"`                         // Category icon
	Color     string `json:"color" gorm:"default:'#blue'"` // Category color
	SortOrder int    `json:"sort_order" gorm:"default:0"`  // Display order

	// Category properties
	IsActive  bool `json:"is_active" gorm:"default:true"`
	IsSpecial bool `json:"is_special" gorm:"default:false"` // Special event category

	// Relationships
	Achievements []Achievement `json:"achievements" gorm:"foreignKey:Category;references:Name"`
}

// AchievementReward represents rewards that can be given for achievements
type AchievementReward struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Reward information
	AchievementID uint   `json:"achievement_id" gorm:"not null"`
	RewardType    string `json:"reward_type" gorm:"not null"`   // credits, crystals, item, title, etc.
	RewardValue   int    `json:"reward_value" gorm:"default:0"` // Amount for currency rewards
	RewardData    string `json:"reward_data"`                   // JSON data for complex rewards

	// Reward properties
	IsGuaranteed bool    `json:"is_guaranteed" gorm:"default:true"` // Always given
	DropChance   float64 `json:"drop_chance" gorm:"default:1.0"`    // Chance to receive (0.0-1.0)
	IsRare       bool    `json:"is_rare" gorm:"default:false"`      // Rare reward

	// Relationships
	Achievement Achievement `json:"achievement" gorm:"foreignKey:AchievementID"`
}

// AchievementLeaderboard represents leaderboards for achievement points
type AchievementLeaderboard struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Leaderboard information
	PlayerID   uint   `json:"player_id" gorm:"not null;uniqueIndex"`
	PlayerName string `json:"player_name" gorm:"not null"`

	// Achievement statistics
	TotalPoints       int `json:"total_points" gorm:"default:0"`
	TotalUnlocked     int `json:"total_unlocked" gorm:"default:0"`
	RareUnlocked      int `json:"rare_unlocked" gorm:"default:0"`
	EpicUnlocked      int `json:"epic_unlocked" gorm:"default:0"`
	LegendaryUnlocked int `json:"legendary_unlocked" gorm:"default:0"`

	// Rankings
	GlobalRank  int `json:"global_rank" gorm:"default:0"`
	WeeklyRank  int `json:"weekly_rank" gorm:"default:0"`
	MonthlyRank int `json:"monthly_rank" gorm:"default:0"`

	// Time tracking
	LastUpdated   time.Time `json:"last_updated"`
	WeeklyPoints  int       `json:"weekly_points" gorm:"default:0"`
	MonthlyPoints int       `json:"monthly_points" gorm:"default:0"`

	// Special achievements
	FirstToUnlock  []string `json:"first_to_unlock" gorm:"type:json"`   // Achievement IDs where player was first
	CompletionRate float64  `json:"completion_rate" gorm:"default:0.0"` // Percentage of all achievements unlocked
}
