package models

import (
	"gorm.io/gorm"
	"time"
)

// PlayerResources represents all resources owned by a player
type PlayerResources struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Player reference
	PlayerID uint `json:"player_id" gorm:"not null;uniqueIndex"`

	// Primary currencies
	Credits    int `json:"credits" gorm:"default:1000"` // Main currency
	Crystals   int `json:"crystals" gorm:"default:0"`   // Premium currency
	Experience int `json:"experience" gorm:"default:0"` // Player experience

	// Materials for ship construction/upgrades
	Durasteel      int `json:"durasteel" gorm:"default:0"`      // Basic hull material
	Transparisteel int `json:"transparisteel" gorm:"default:0"` // Cockpit material
	Tibanna        int `json:"tibanna" gorm:"default:0"`        // Weapon gas
	Kyber          int `json:"kyber" gorm:"default:0"`          // Rare crystal for advanced weapons

	// Energy resources
	Energy      int `json:"energy" gorm:"default:100"`     // Current energy
	MaxEnergy   int `json:"max_energy" gorm:"default:100"` // Maximum energy capacity
	EnergyRegen int `json:"energy_regen" gorm:"default:1"` // Energy regeneration per minute

	// Fuel for travel
	Fuel    int `json:"fuel" gorm:"default:100"`     // Current fuel
	MaxFuel int `json:"max_fuel" gorm:"default:100"` // Maximum fuel capacity

	// Special resources
	Reputation int `json:"reputation" gorm:"default:0"` // Faction reputation
	Influence  int `json:"influence" gorm:"default:0"`  // Political influence

	// Resource generation rates (per hour)
	CreditsPerHour int `json:"credits_per_hour" gorm:"default:10"`
	EnergyPerHour  int `json:"energy_per_hour" gorm:"default:60"`
	FuelPerHour    int `json:"fuel_per_hour" gorm:"default:20"`

	// Last resource generation timestamp
	LastGeneration time.Time `json:"last_generation"`
}

// ResourceTransaction represents a transaction involving resources
type ResourceTransaction struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Transaction information
	PlayerID        uint   `json:"player_id" gorm:"not null"`
	TransactionType string `json:"transaction_type" gorm:"not null"` // earn, spend, transfer, convert
	Source          string `json:"source" gorm:"not null"`           // mission, purchase, battle, etc.
	Description     string `json:"description"`

	// Resource changes (positive for gain, negative for loss)
	CreditsChange        int `json:"credits_change" gorm:"default:0"`
	CrystalsChange       int `json:"crystals_change" gorm:"default:0"`
	ExperienceChange     int `json:"experience_change" gorm:"default:0"`
	DurasteelChange      int `json:"durasteel_change" gorm:"default:0"`
	TransparisteelChange int `json:"transparisteel_change" gorm:"default:0"`
	TibannaChange        int `json:"tibanna_change" gorm:"default:0"`
	KyberChange          int `json:"kyber_change" gorm:"default:0"`
	EnergyChange         int `json:"energy_change" gorm:"default:0"`
	FuelChange           int `json:"fuel_change" gorm:"default:0"`
	ReputationChange     int `json:"reputation_change" gorm:"default:0"`
	InfluenceChange      int `json:"influence_change" gorm:"default:0"`

	// Transaction metadata
	RelatedEntityType string `json:"related_entity_type"` // mission, battle, purchase, etc.
	RelatedEntityID   *uint  `json:"related_entity_id"`
	IsSuccessful      bool   `json:"is_successful" gorm:"default:true"`

	// Balances after transaction
	CreditsAfter    int `json:"credits_after"`
	CrystalsAfter   int `json:"crystals_after"`
	ExperienceAfter int `json:"experience_after"`
}

// ResourceType represents different types of resources in the game
type ResourceType struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Resource information
	Name        string `json:"name" gorm:"not null;uniqueIndex"`
	DisplayName string `json:"display_name" gorm:"not null"`
	Description string `json:"description"`
	Category    string `json:"category" gorm:"not null"` // currency, material, energy, special

	// Resource properties
	Icon     string `json:"icon"`                            // Icon path/URL
	Color    string `json:"color" gorm:"default:'#ffffff'"`  // Hex color code
	Rarity   string `json:"rarity" gorm:"default:'common'"`  // common, uncommon, rare, epic, legendary
	MaxStack int    `json:"max_stack" gorm:"default:999999"` // Maximum amount a player can hold

	// Economic properties
	BaseValue  int  `json:"base_value" gorm:"default:1"`      // Base value for conversion
	IsTradeble bool `json:"is_tradeable" gorm:"default:true"` // Can be traded between players
	IsPremium  bool `json:"is_premium" gorm:"default:false"`  // Premium currency

	// Generation properties
	CanGenerate bool `json:"can_generate" gorm:"default:false"` // Can be generated over time
	GenRate     int  `json:"gen_rate" gorm:"default:0"`         // Generation rate per hour

	// Display properties
	ShowInUI  bool `json:"show_in_ui" gorm:"default:true"` // Show in main UI
	SortOrder int  `json:"sort_order" gorm:"default:0"`    // Display order
}

// ResourceConversion represents conversion rates between resources
type ResourceConversion struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Conversion information
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`

	// Source resource
	FromResourceType string `json:"from_resource_type" gorm:"not null"`
	FromAmount       int    `json:"from_amount" gorm:"not null"`

	// Target resource
	ToResourceType string `json:"to_resource_type" gorm:"not null"`
	ToAmount       int    `json:"to_amount" gorm:"not null"`

	// Conversion properties
	IsActive      bool `json:"is_active" gorm:"default:true"`
	RequiredLevel int  `json:"required_level" gorm:"default:1"`
	DailyCooldown int  `json:"daily_cooldown" gorm:"default:0"` // Hours
	MaxPerDay     int  `json:"max_per_day" gorm:"default:0"`    // 0 = unlimited

	// Cost and requirements
	ConversionFee    int    `json:"conversion_fee" gorm:"default:0"` // Credits cost
	RequiredBuilding string `json:"required_building"`               // Required building/facility
}

// PlayerResourceGeneration tracks resource generation for players
type PlayerResourceGeneration struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Player and resource information
	PlayerID     uint   `json:"player_id" gorm:"not null"`
	ResourceType string `json:"resource_type" gorm:"not null"`

	// Generation settings
	BaseRate  int `json:"base_rate" gorm:"default:0"`  // Base generation per hour
	BonusRate int `json:"bonus_rate" gorm:"default:0"` // Bonus from buildings/upgrades
	TotalRate int `json:"total_rate" gorm:"default:0"` // Total generation per hour

	// Generation tracking
	LastGenerated  time.Time `json:"last_generated"`
	TotalGenerated int       `json:"total_generated" gorm:"default:0"`

	// Modifiers
	Multiplier float64 `json:"multiplier" gorm:"default:1.0"` // Generation multiplier
	IsActive   bool    `json:"is_active" gorm:"default:true"` // Is generation active

	// Composite index for efficient queries
	// gorm:"uniqueIndex:idx_player_resource"
}

// ResourceBundle represents a collection of resources (for rewards, purchases, etc.)
type ResourceBundle struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Bundle information
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`
	Type        string `json:"type" gorm:"not null"` // reward, purchase, starter, event

	// Bundle contents
	Credits        int `json:"credits" gorm:"default:0"`
	Crystals       int `json:"crystals" gorm:"default:0"`
	Experience     int `json:"experience" gorm:"default:0"`
	Durasteel      int `json:"durasteel" gorm:"default:0"`
	Transparisteel int `json:"transparisteel" gorm:"default:0"`
	Tibanna        int `json:"tibanna" gorm:"default:0"`
	Kyber          int `json:"kyber" gorm:"default:0"`
	Energy         int `json:"energy" gorm:"default:0"`
	Fuel           int `json:"fuel" gorm:"default:0"`

	// Bundle properties
	Cost          int  `json:"cost" gorm:"default:0"`           // Cost in credits
	CrystalCost   int  `json:"crystal_cost" gorm:"default:0"`   // Cost in crystals
	RequiredLevel int  `json:"required_level" gorm:"default:1"` // Required player level
	IsLimited     bool `json:"is_limited" gorm:"default:false"` // Limited availability
	MaxPurchases  int  `json:"max_purchases" gorm:"default:0"`  // Max purchases per player (0 = unlimited)
	IsActive      bool `json:"is_active" gorm:"default:true"`   // Is bundle available
}
