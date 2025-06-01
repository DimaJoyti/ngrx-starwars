package services

import (
	"fmt"
	"log"
	"starwars-api/models"

	"gorm.io/gorm"
)

type FleetService struct {
	db *gorm.DB
}

func NewFleetService(db *gorm.DB) *FleetService {
	return &FleetService{db: db}
}

// GetPlayerFleet returns the player's main fleet
func (s *FleetService) GetPlayerFleet(playerID uint) (*models.Fleet, error) {
	var fleet models.Fleet
	err := s.db.Preload("Ships").Preload("Ships.Upgrades").
		Where("player_id = ? AND is_active = ?", playerID, true).
		First(&fleet).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default fleet for player
			return s.CreateDefaultFleet(playerID)
		}
		return nil, fmt.Errorf("failed to get player fleet: %w", err)
	}

	// Calculate fleet statistics
	s.calculateFleetStats(&fleet)

	return &fleet, nil
}

// CreateDefaultFleet creates a default fleet for a new player
func (s *FleetService) CreateDefaultFleet(playerID uint) (*models.Fleet, error) {
	fleet := models.Fleet{
		Name:        "Main Fleet",
		Description: "Your primary fleet",
		PlayerID:    playerID,
		MaxShips:    5,
		IsActive:    true,
		Location:    "base",
	}

	if err := s.db.Create(&fleet).Error; err != nil {
		return nil, fmt.Errorf("failed to create default fleet: %w", err)
	}

	// Create starter ship
	starterShip, err := s.CreateStarterShip(playerID, fleet.ID)
	if err != nil {
		log.Printf("Warning: failed to create starter ship: %v", err)
	} else {
		fleet.Ships = []models.Ship{*starterShip}
	}

	return &fleet, nil
}

// CreateStarterShip creates a basic starter ship for new players
func (s *FleetService) CreateStarterShip(playerID, fleetID uint) (*models.Ship, error) {
	ship := models.Ship{
		Name:      "T-65 X-wing",
		Class:     "Fighter",
		Faction:   "Rebel Alliance",
		Model:     "X-wing Starfighter",
		Health:    100,
		MaxHealth: 100,
		Shield:    50,
		MaxShield: 50,
		Attack:    15,
		Defense:   8,
		Speed:     75,
		Maneuver:  80,
		Energy:    100,
		MaxEnergy: 100,
		Fuel:      100,
		MaxFuel:   100,
		Cost:      0, // Free starter ship
		PlayerID:  playerID,
		FleetID:   &fleetID,
		ModelPath: "/models/ships/x-wing.glb",
		Scale:     1.0,
	}

	if err := s.db.Create(&ship).Error; err != nil {
		return nil, fmt.Errorf("failed to create starter ship: %w", err)
	}

	return &ship, nil
}

// AddShipToFleet adds a ship to a player's fleet
func (s *FleetService) AddShipToFleet(playerID, shipID, fleetID uint) error {
	// Verify ship belongs to player
	var ship models.Ship
	if err := s.db.Where("id = ? AND player_id = ?", shipID, playerID).First(&ship).Error; err != nil {
		return fmt.Errorf("ship not found or doesn't belong to player: %w", err)
	}

	// Verify fleet belongs to player
	var fleet models.Fleet
	if err := s.db.Where("id = ? AND player_id = ?", fleetID, playerID).First(&fleet).Error; err != nil {
		return fmt.Errorf("fleet not found or doesn't belong to player: %w", err)
	}

	// Check fleet capacity
	var shipCount int64
	s.db.Model(&models.Ship{}).Where("fleet_id = ?", fleetID).Count(&shipCount)
	if int(shipCount) >= fleet.MaxShips {
		return fmt.Errorf("fleet is at maximum capacity (%d ships)", fleet.MaxShips)
	}

	// Add ship to fleet
	ship.FleetID = &fleetID
	ship.Location = "fleet"

	if err := s.db.Save(&ship).Error; err != nil {
		return fmt.Errorf("failed to add ship to fleet: %w", err)
	}

	return nil
}

// RemoveShipFromFleet removes a ship from a fleet
func (s *FleetService) RemoveShipFromFleet(playerID, shipID uint) error {
	var ship models.Ship
	if err := s.db.Where("id = ? AND player_id = ?", shipID, playerID).First(&ship).Error; err != nil {
		return fmt.Errorf("ship not found or doesn't belong to player: %w", err)
	}

	ship.FleetID = nil
	ship.Location = "hangar"

	if err := s.db.Save(&ship).Error; err != nil {
		return fmt.Errorf("failed to remove ship from fleet: %w", err)
	}

	return nil
}

// GetPlayerShips returns all ships owned by a player
func (s *FleetService) GetPlayerShips(playerID uint) ([]models.Ship, error) {
	var ships []models.Ship
	err := s.db.Preload("Upgrades").Where("player_id = ?", playerID).Find(&ships).Error
	return ships, err
}

// GetAvailableShipTemplates returns ship templates available for purchase
func (s *FleetService) GetAvailableShipTemplates(playerLevel int) ([]models.ShipTemplate, error) {
	var templates []models.ShipTemplate
	err := s.db.Where("is_available = ? AND required_level <= ?", true, playerLevel).
		Order("required_level ASC, cost ASC").Find(&templates).Error
	return templates, err
}

// PurchaseShip creates a new ship from a template
func (s *FleetService) PurchaseShip(playerID uint, templateID uint) (*models.Ship, error) {
	// Get ship template
	var template models.ShipTemplate
	if err := s.db.First(&template, templateID).Error; err != nil {
		return nil, fmt.Errorf("ship template not found: %w", err)
	}

	// Check if player has enough credits (this would integrate with resource service)
	// For now, we'll skip the credit check

	// Create ship from template
	ship := models.Ship{
		Name:            template.Name,
		Class:           template.Class,
		Faction:         template.Faction,
		Model:           template.Model,
		Health:          template.BaseHealth,
		MaxHealth:       template.BaseHealth,
		Shield:          template.BaseShield,
		MaxShield:       template.BaseShield,
		Attack:          template.BaseAttack,
		Defense:         template.BaseDefense,
		Speed:           template.BaseSpeed,
		Maneuver:        template.BaseManeuver,
		Energy:          template.BaseEnergy,
		MaxEnergy:       template.BaseEnergy,
		Fuel:            template.BaseFuel,
		MaxFuel:         template.BaseFuel,
		Cost:            template.Cost,
		MaintenanceCost: template.MaintenanceCost,
		PlayerID:        playerID,
		ModelPath:       template.ModelPath,
		TexturePath:     template.TexturePath,
		Scale:           template.Scale,
		Location:        "hangar",
	}

	if err := s.db.Create(&ship).Error; err != nil {
		return nil, fmt.Errorf("failed to create ship: %w", err)
	}

	return &ship, nil
}

// UpgradeShip applies an upgrade to a ship
func (s *FleetService) UpgradeShip(playerID, shipID uint, upgradeData models.ShipUpgrade) (*models.Ship, error) {
	// Verify ship belongs to player
	var ship models.Ship
	if err := s.db.Preload("Upgrades").Where("id = ? AND player_id = ?", shipID, playerID).First(&ship).Error; err != nil {
		return nil, fmt.Errorf("ship not found or doesn't belong to player: %w", err)
	}

	// Create upgrade
	upgrade := models.ShipUpgrade{
		ShipID:        shipID,
		Name:          upgradeData.Name,
		Type:          upgradeData.Type,
		Description:   upgradeData.Description,
		HealthBonus:   upgradeData.HealthBonus,
		ShieldBonus:   upgradeData.ShieldBonus,
		AttackBonus:   upgradeData.AttackBonus,
		DefenseBonus:  upgradeData.DefenseBonus,
		SpeedBonus:    upgradeData.SpeedBonus,
		ManeuverBonus: upgradeData.ManeuverBonus,
		EnergyBonus:   upgradeData.EnergyBonus,
		Level:         1,
		MaxLevel:      upgradeData.MaxLevel,
		Cost:          upgradeData.Cost,
		IsInstalled:   true,
	}

	if err := s.db.Create(&upgrade).Error; err != nil {
		return nil, fmt.Errorf("failed to create upgrade: %w", err)
	}

	// Apply upgrade bonuses to ship
	ship.MaxHealth += upgrade.HealthBonus
	ship.Health += upgrade.HealthBonus
	ship.MaxShield += upgrade.ShieldBonus
	ship.Shield += upgrade.ShieldBonus
	ship.Attack += upgrade.AttackBonus
	ship.Defense += upgrade.DefenseBonus
	ship.Speed += upgrade.SpeedBonus
	ship.Maneuver += upgrade.ManeuverBonus
	ship.MaxEnergy += upgrade.EnergyBonus
	ship.Energy += upgrade.EnergyBonus

	if err := s.db.Save(&ship).Error; err != nil {
		return nil, fmt.Errorf("failed to apply upgrade to ship: %w", err)
	}

	// Reload ship with upgrades
	s.db.Preload("Upgrades").First(&ship, shipID)

	return &ship, nil
}

// RepairShip restores a ship's health and shield
func (s *FleetService) RepairShip(playerID, shipID uint) error {
	var ship models.Ship
	if err := s.db.Where("id = ? AND player_id = ?", shipID, playerID).First(&ship).Error; err != nil {
		return fmt.Errorf("ship not found or doesn't belong to player: %w", err)
	}

	ship.Health = ship.MaxHealth
	ship.Shield = ship.MaxShield
	ship.IsDestroyed = false

	if err := s.db.Save(&ship).Error; err != nil {
		return fmt.Errorf("failed to repair ship: %w", err)
	}

	return nil
}

// calculateFleetStats calculates and updates fleet statistics
func (s *FleetService) calculateFleetStats(fleet *models.Fleet) {
	if len(fleet.Ships) == 0 {
		return
	}

	totalHealth := 0
	totalAttack := 0
	totalDefense := 0
	totalSpeed := 0

	for _, ship := range fleet.Ships {
		totalHealth += ship.MaxHealth
		totalAttack += ship.Attack
		totalDefense += ship.Defense
		totalSpeed += ship.Speed
	}

	fleet.TotalHealth = totalHealth
	fleet.TotalAttack = totalAttack
	fleet.TotalDefense = totalDefense
	fleet.AverageSpeed = totalSpeed / len(fleet.Ships)
	fleet.FleetPower = (totalAttack + totalDefense + fleet.AverageSpeed) / 3
}

// GetPlayerHangar returns the player's hangar
func (s *FleetService) GetPlayerHangar(playerID uint) (*models.Hangar, error) {
	var hangar models.Hangar
	err := s.db.Preload("Ships").Where("player_id = ?", playerID).First(&hangar).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default hangar
			hangar = models.Hangar{
				PlayerID:     playerID,
				Name:         "Main Hangar",
				Location:     "base",
				MaxShips:     10,
				CurrentShips: 0,
				Level:        1,
				MaxLevel:     10,
				UpgradeCost:  5000,
			}

			if err := s.db.Create(&hangar).Error; err != nil {
				return nil, fmt.Errorf("failed to create default hangar: %w", err)
			}
		} else {
			return nil, fmt.Errorf("failed to get player hangar: %w", err)
		}
	}

	// Update current ship count
	var shipCount int64
	s.db.Model(&models.Ship{}).Where("player_id = ?", playerID).Count(&shipCount)
	hangar.CurrentShips = int(shipCount)
	s.db.Save(&hangar)

	return &hangar, nil
}

// UpgradeHangar increases hangar capacity
func (s *FleetService) UpgradeHangar(playerID uint) (*models.Hangar, error) {
	hangar, err := s.GetPlayerHangar(playerID)
	if err != nil {
		return nil, err
	}

	if hangar.Level >= hangar.MaxLevel {
		return nil, fmt.Errorf("hangar is already at maximum level")
	}

	// Check if player has enough credits (integrate with resource service)
	// For now, we'll skip the credit check

	hangar.Level++
	hangar.MaxShips += 2                                        // Increase capacity by 2 per level
	hangar.UpgradeCost = int(float64(hangar.UpgradeCost) * 1.5) // Increase cost by 50%

	if err := s.db.Save(hangar).Error; err != nil {
		return nil, fmt.Errorf("failed to upgrade hangar: %w", err)
	}

	return hangar, nil
}
