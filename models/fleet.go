package models

import (
	"gorm.io/gorm"
	"time"
)

// Ship represents a starship in the game
type Ship struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Basic ship information
	Name    string `json:"name" gorm:"not null"`
	Class   string `json:"class" gorm:"not null"` // Fighter, Cruiser, Destroyer, etc.
	Faction string `json:"faction"`               // Empire, Rebels, Republic, etc.
	Model   string `json:"model"`                 // X-wing, TIE Fighter, etc.

	// Ship statistics
	Health    int `json:"health" gorm:"default:100"`
	MaxHealth int `json:"max_health" gorm:"default:100"`
	Shield    int `json:"shield" gorm:"default:0"`
	MaxShield int `json:"max_shield" gorm:"default:0"`
	Attack    int `json:"attack" gorm:"default:10"`
	Defense   int `json:"defense" gorm:"default:5"`
	Speed     int `json:"speed" gorm:"default:50"`
	Maneuver  int `json:"maneuver" gorm:"default:50"`

	// Ship resources
	Energy    int `json:"energy" gorm:"default:100"`
	MaxEnergy int `json:"max_energy" gorm:"default:100"`
	Fuel      int `json:"fuel" gorm:"default:100"`
	MaxFuel   int `json:"max_fuel" gorm:"default:100"`

	// Ship status
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	IsDestroyed bool   `json:"is_destroyed" gorm:"default:false"`
	Location    string `json:"location" gorm:"default:'hangar'"`

	// Economic properties
	Cost            int `json:"cost" gorm:"default:1000"`
	MaintenanceCost int `json:"maintenance_cost" gorm:"default:10"`

	// Relationships
	PlayerID uint          `json:"player_id"`
	FleetID  *uint         `json:"fleet_id"`
	Upgrades []ShipUpgrade `json:"upgrades" gorm:"foreignKey:ShipID"`

	// 3D Model properties
	ModelPath   string  `json:"model_path"`
	TexturePath string  `json:"texture_path"`
	Scale       float32 `json:"scale" gorm:"default:1.0"`
}

// Fleet represents a collection of ships belonging to a player
type Fleet struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Fleet information
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`
	PlayerID    uint   `json:"player_id" gorm:"not null"`

	// Fleet composition
	Ships    []Ship `json:"ships" gorm:"foreignKey:FleetID"`
	MaxShips int    `json:"max_ships" gorm:"default:5"`

	// Fleet statistics (calculated)
	TotalHealth  int `json:"total_health" gorm:"-"`
	TotalAttack  int `json:"total_attack" gorm:"-"`
	TotalDefense int `json:"total_defense" gorm:"-"`
	AverageSpeed int `json:"average_speed" gorm:"-"`
	FleetPower   int `json:"fleet_power" gorm:"-"`

	// Fleet status
	IsActive       bool   `json:"is_active" gorm:"default:true"`
	CurrentMission *uint  `json:"current_mission"`
	Location       string `json:"location" gorm:"default:'base'"`
}

// ShipUpgrade represents upgrades applied to ships
type ShipUpgrade struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Upgrade information
	ShipID      uint   `json:"ship_id" gorm:"not null"`
	Name        string `json:"name" gorm:"not null"`
	Type        string `json:"type" gorm:"not null"` // weapon, shield, engine, armor, etc.
	Description string `json:"description"`

	// Upgrade effects
	HealthBonus   int `json:"health_bonus" gorm:"default:0"`
	ShieldBonus   int `json:"shield_bonus" gorm:"default:0"`
	AttackBonus   int `json:"attack_bonus" gorm:"default:0"`
	DefenseBonus  int `json:"defense_bonus" gorm:"default:0"`
	SpeedBonus    int `json:"speed_bonus" gorm:"default:0"`
	ManeuverBonus int `json:"maneuver_bonus" gorm:"default:0"`
	EnergyBonus   int `json:"energy_bonus" gorm:"default:0"`

	// Upgrade properties
	Level       int  `json:"level" gorm:"default:1"`
	MaxLevel    int  `json:"max_level" gorm:"default:5"`
	Cost        int  `json:"cost" gorm:"default:100"`
	IsInstalled bool `json:"is_installed" gorm:"default:true"`
}

// Hangar represents a player's ship storage facility
type Hangar struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Hangar information
	PlayerID uint   `json:"player_id" gorm:"not null;uniqueIndex"`
	Name     string `json:"name" gorm:"default:'Main Hangar'"`
	Location string `json:"location" gorm:"default:'base'"`

	// Hangar capacity
	MaxShips     int `json:"max_ships" gorm:"default:10"`
	CurrentShips int `json:"current_ships" gorm:"default:0"`

	// Hangar upgrades
	Level       int `json:"level" gorm:"default:1"`
	MaxLevel    int `json:"max_level" gorm:"default:10"`
	UpgradeCost int `json:"upgrade_cost" gorm:"default:5000"`

	// Relationships
	Ships []Ship `json:"ships" gorm:"foreignKey:PlayerID"`
}

// ShipTemplate represents available ship types for purchase
type ShipTemplate struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Template information
	Name        string `json:"name" gorm:"not null;uniqueIndex"`
	Class       string `json:"class" gorm:"not null"`
	Faction     string `json:"faction"`
	Model       string `json:"model"`
	Description string `json:"description"`

	// Base statistics
	BaseHealth   int `json:"base_health" gorm:"default:100"`
	BaseShield   int `json:"base_shield" gorm:"default:0"`
	BaseAttack   int `json:"base_attack" gorm:"default:10"`
	BaseDefense  int `json:"base_defense" gorm:"default:5"`
	BaseSpeed    int `json:"base_speed" gorm:"default:50"`
	BaseManeuver int `json:"base_maneuver" gorm:"default:50"`
	BaseEnergy   int `json:"base_energy" gorm:"default:100"`
	BaseFuel     int `json:"base_fuel" gorm:"default:100"`

	// Economic properties
	Cost            int  `json:"cost" gorm:"default:1000"`
	MaintenanceCost int  `json:"maintenance_cost" gorm:"default:10"`
	IsAvailable     bool `json:"is_available" gorm:"default:true"`
	RequiredLevel   int  `json:"required_level" gorm:"default:1"`

	// 3D Model properties
	ModelPath   string  `json:"model_path"`
	TexturePath string  `json:"texture_path"`
	Scale       float32 `json:"scale" gorm:"default:1.0"`
}
