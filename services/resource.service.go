package services

import (
	"fmt"
	"starwars-api/models"
	"time"

	"gorm.io/gorm"
)

type ResourceService struct {
	db *gorm.DB
}

func NewResourceService(db *gorm.DB) *ResourceService {
	return &ResourceService{db: db}
}

// GetPlayerResources returns the player's resources
func (s *ResourceService) GetPlayerResources(playerID uint) (*models.PlayerResources, error) {
	var resources models.PlayerResources
	err := s.db.Where("player_id = ?", playerID).First(&resources).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default resources for new player
			return s.CreateDefaultResources(playerID)
		}
		return nil, fmt.Errorf("failed to get player resources: %w", err)
	}

	// Generate resources since last check
	s.generateResources(&resources)

	return &resources, nil
}

// CreateDefaultResources creates default resources for a new player
func (s *ResourceService) CreateDefaultResources(playerID uint) (*models.PlayerResources, error) {
	resources := models.PlayerResources{
		PlayerID:       playerID,
		Credits:        1000,
		Crystals:       0,
		Experience:     0,
		Durasteel:      50,
		Transparisteel: 10,
		Tibanna:        20,
		Kyber:          0,
		Energy:         100,
		MaxEnergy:      100,
		EnergyRegen:    1,
		Fuel:           100,
		MaxFuel:        100,
		Reputation:     0,
		Influence:      0,
		CreditsPerHour: 10,
		EnergyPerHour:  60,
		FuelPerHour:    20,
		LastGeneration: time.Now(),
	}

	if err := s.db.Create(&resources).Error; err != nil {
		return nil, fmt.Errorf("failed to create default resources: %w", err)
	}

	return &resources, nil
}

// generateResources generates resources based on time passed
func (s *ResourceService) generateResources(resources *models.PlayerResources) {
	now := time.Now()
	hoursPassed := now.Sub(resources.LastGeneration).Hours()

	if hoursPassed < 0.1 { // Less than 6 minutes
		return
	}

	// Generate credits
	creditsGenerated := int(hoursPassed * float64(resources.CreditsPerHour))
	resources.Credits += creditsGenerated

	// Generate energy
	energyGenerated := int(hoursPassed * float64(resources.EnergyPerHour))
	resources.Energy += energyGenerated
	if resources.Energy > resources.MaxEnergy {
		resources.Energy = resources.MaxEnergy
	}

	// Generate fuel
	fuelGenerated := int(hoursPassed * float64(resources.FuelPerHour))
	resources.Fuel += fuelGenerated
	if resources.Fuel > resources.MaxFuel {
		resources.Fuel = resources.MaxFuel
	}

	resources.LastGeneration = now
	s.db.Save(resources)
}

// AddResources adds resources to a player's account
func (s *ResourceService) AddResources(playerID uint, credits, crystals, experience, durasteel, transparisteel, tibanna, kyber, energy, fuel, reputation, influence int, source, description string) error {
	resources, err := s.GetPlayerResources(playerID)
	if err != nil {
		return err
	}

	// Store original values for transaction record (not used but kept for future enhancement)
	_ = resources.Credits
	_ = resources.Crystals
	_ = resources.Experience

	// Add resources
	resources.Credits += credits
	resources.Crystals += crystals
	resources.Experience += experience
	resources.Durasteel += durasteel
	resources.Transparisteel += transparisteel
	resources.Tibanna += tibanna
	resources.Kyber += kyber
	resources.Reputation += reputation
	resources.Influence += influence

	// Add energy and fuel with caps
	resources.Energy += energy
	if resources.Energy > resources.MaxEnergy {
		resources.Energy = resources.MaxEnergy
	}

	resources.Fuel += fuel
	if resources.Fuel > resources.MaxFuel {
		resources.Fuel = resources.MaxFuel
	}

	// Save resources
	if err := s.db.Save(resources).Error; err != nil {
		return fmt.Errorf("failed to add resources: %w", err)
	}

	// Create transaction record
	transaction := models.ResourceTransaction{
		PlayerID:             playerID,
		TransactionType:      "earn",
		Source:               source,
		Description:          description,
		CreditsChange:        credits,
		CrystalsChange:       crystals,
		ExperienceChange:     experience,
		DurasteelChange:      durasteel,
		TransparisteelChange: transparisteel,
		TibannaChange:        tibanna,
		KyberChange:          kyber,
		EnergyChange:         energy,
		FuelChange:           fuel,
		ReputationChange:     reputation,
		InfluenceChange:      influence,
		IsSuccessful:         true,
		CreditsAfter:         resources.Credits,
		CrystalsAfter:        resources.Crystals,
		ExperienceAfter:      resources.Experience,
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return fmt.Errorf("failed to create transaction record: %w", err)
	}

	return nil
}

// SpendResources deducts resources from a player's account
func (s *ResourceService) SpendResources(playerID uint, credits, crystals, durasteel, transparisteel, tibanna, kyber, energy, fuel int, source, description string) error {
	resources, err := s.GetPlayerResources(playerID)
	if err != nil {
		return err
	}

	// Check if player has enough resources
	if resources.Credits < credits {
		return fmt.Errorf("insufficient credits: have %d, need %d", resources.Credits, credits)
	}
	if resources.Crystals < crystals {
		return fmt.Errorf("insufficient crystals: have %d, need %d", resources.Crystals, crystals)
	}
	if resources.Durasteel < durasteel {
		return fmt.Errorf("insufficient durasteel: have %d, need %d", resources.Durasteel, durasteel)
	}
	if resources.Transparisteel < transparisteel {
		return fmt.Errorf("insufficient transparisteel: have %d, need %d", resources.Transparisteel, transparisteel)
	}
	if resources.Tibanna < tibanna {
		return fmt.Errorf("insufficient tibanna: have %d, need %d", resources.Tibanna, tibanna)
	}
	if resources.Kyber < kyber {
		return fmt.Errorf("insufficient kyber: have %d, need %d", resources.Kyber, kyber)
	}
	if resources.Energy < energy {
		return fmt.Errorf("insufficient energy: have %d, need %d", resources.Energy, energy)
	}
	if resources.Fuel < fuel {
		return fmt.Errorf("insufficient fuel: have %d, need %d", resources.Fuel, fuel)
	}

	// Store original values for transaction record (not used but kept for future enhancement)
	_ = resources.Credits
	_ = resources.Crystals
	_ = resources.Experience

	// Deduct resources
	resources.Credits -= credits
	resources.Crystals -= crystals
	resources.Durasteel -= durasteel
	resources.Transparisteel -= transparisteel
	resources.Tibanna -= tibanna
	resources.Kyber -= kyber
	resources.Energy -= energy
	resources.Fuel -= fuel

	// Save resources
	if err := s.db.Save(resources).Error; err != nil {
		return fmt.Errorf("failed to spend resources: %w", err)
	}

	// Create transaction record
	transaction := models.ResourceTransaction{
		PlayerID:             playerID,
		TransactionType:      "spend",
		Source:               source,
		Description:          description,
		CreditsChange:        -credits,
		CrystalsChange:       -crystals,
		DurasteelChange:      -durasteel,
		TransparisteelChange: -transparisteel,
		TibannaChange:        -tibanna,
		KyberChange:          -kyber,
		EnergyChange:         -energy,
		FuelChange:           -fuel,
		IsSuccessful:         true,
		CreditsAfter:         resources.Credits,
		CrystalsAfter:        resources.Crystals,
		ExperienceAfter:      resources.Experience,
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return fmt.Errorf("failed to create transaction record: %w", err)
	}

	return nil
}

// GetResourceTransactions returns transaction history for a player
func (s *ResourceService) GetResourceTransactions(playerID uint, limit int) ([]models.ResourceTransaction, error) {
	var transactions []models.ResourceTransaction
	query := s.db.Where("player_id = ?", playerID).Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&transactions).Error
	return transactions, err
}

// ConvertResources converts one resource type to another
func (s *ResourceService) ConvertResources(playerID uint, conversionID uint) error {
	// Get conversion rate
	var conversion models.ResourceConversion
	if err := s.db.First(&conversion, conversionID).Error; err != nil {
		return fmt.Errorf("conversion not found: %w", err)
	}

	if !conversion.IsActive {
		return fmt.Errorf("conversion is not active")
	}

	// Check if player meets requirements
	// (Add level check, cooldown check, etc.)

	// Get player resources
	resources, err := s.GetPlayerResources(playerID)
	if err != nil {
		return err
	}

	// Check if player has enough source resources
	switch conversion.FromResourceType {
	case "credits":
		if resources.Credits < conversion.FromAmount {
			return fmt.Errorf("insufficient credits for conversion")
		}
	case "crystals":
		if resources.Crystals < conversion.FromAmount {
			return fmt.Errorf("insufficient crystals for conversion")
		}
	case "durasteel":
		if resources.Durasteel < conversion.FromAmount {
			return fmt.Errorf("insufficient durasteel for conversion")
		}
		// Add other resource types as needed
	}

	// Perform conversion
	switch conversion.FromResourceType {
	case "credits":
		resources.Credits -= conversion.FromAmount
	case "crystals":
		resources.Crystals -= conversion.FromAmount
	case "durasteel":
		resources.Durasteel -= conversion.FromAmount
	}

	switch conversion.ToResourceType {
	case "credits":
		resources.Credits += conversion.ToAmount
	case "crystals":
		resources.Crystals += conversion.ToAmount
	case "durasteel":
		resources.Durasteel += conversion.ToAmount
	case "transparisteel":
		resources.Transparisteel += conversion.ToAmount
	case "tibanna":
		resources.Tibanna += conversion.ToAmount
	case "kyber":
		resources.Kyber += conversion.ToAmount
	}

	// Pay conversion fee
	if conversion.ConversionFee > 0 {
		if resources.Credits < conversion.ConversionFee {
			return fmt.Errorf("insufficient credits for conversion fee")
		}
		resources.Credits -= conversion.ConversionFee
	}

	// Save resources
	if err := s.db.Save(resources).Error; err != nil {
		return fmt.Errorf("failed to save converted resources: %w", err)
	}

	// Create transaction record
	description := fmt.Sprintf("Converted %d %s to %d %s",
		conversion.FromAmount, conversion.FromResourceType,
		conversion.ToAmount, conversion.ToResourceType)

	transaction := models.ResourceTransaction{
		PlayerID:        playerID,
		TransactionType: "convert",
		Source:          "conversion",
		Description:     description,
		IsSuccessful:    true,
		CreditsAfter:    resources.Credits,
		CrystalsAfter:   resources.Crystals,
		ExperienceAfter: resources.Experience,
	}

	// Set the appropriate change fields
	switch conversion.FromResourceType {
	case "credits":
		transaction.CreditsChange = -conversion.FromAmount
	case "crystals":
		transaction.CrystalsChange = -conversion.FromAmount
	case "durasteel":
		transaction.DurasteelChange = -conversion.FromAmount
	}

	switch conversion.ToResourceType {
	case "credits":
		transaction.CreditsChange += conversion.ToAmount
	case "crystals":
		transaction.CrystalsChange += conversion.ToAmount
	case "durasteel":
		transaction.DurasteelChange += conversion.ToAmount
	case "transparisteel":
		transaction.TransparisteelChange += conversion.ToAmount
	case "tibanna":
		transaction.TibannaChange += conversion.ToAmount
	case "kyber":
		transaction.KyberChange += conversion.ToAmount
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return fmt.Errorf("failed to create conversion transaction: %w", err)
	}

	return nil
}

// GetAvailableConversions returns available resource conversions
func (s *ResourceService) GetAvailableConversions() ([]models.ResourceConversion, error) {
	var conversions []models.ResourceConversion
	err := s.db.Where("is_active = ?", true).Find(&conversions).Error
	return conversions, err
}

// UpgradeResourceGeneration upgrades resource generation rates
func (s *ResourceService) UpgradeResourceGeneration(playerID uint, resourceType string, upgradeCost int) error {
	resources, err := s.GetPlayerResources(playerID)
	if err != nil {
		return err
	}

	if resources.Credits < upgradeCost {
		return fmt.Errorf("insufficient credits for upgrade: have %d, need %d", resources.Credits, upgradeCost)
	}

	// Deduct upgrade cost
	resources.Credits -= upgradeCost

	// Increase generation rate
	switch resourceType {
	case "credits":
		resources.CreditsPerHour += 5
	case "energy":
		resources.EnergyPerHour += 10
	case "fuel":
		resources.FuelPerHour += 5
	default:
		return fmt.Errorf("invalid resource type for upgrade: %s", resourceType)
	}

	if err := s.db.Save(resources).Error; err != nil {
		return fmt.Errorf("failed to upgrade resource generation: %w", err)
	}

	// Create transaction record
	description := fmt.Sprintf("Upgraded %s generation rate", resourceType)
	transaction := models.ResourceTransaction{
		PlayerID:        playerID,
		TransactionType: "spend",
		Source:          "upgrade",
		Description:     description,
		CreditsChange:   -upgradeCost,
		IsSuccessful:    true,
		CreditsAfter:    resources.Credits,
		CrystalsAfter:   resources.Crystals,
		ExperienceAfter: resources.Experience,
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return fmt.Errorf("failed to create upgrade transaction: %w", err)
	}

	return nil
}
