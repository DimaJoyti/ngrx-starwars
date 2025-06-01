package services

import (
	"fmt"
	"math/rand"
	"starwars-api/models"
	"time"

	"gorm.io/gorm"
)

type BattleService struct {
	db *gorm.DB
}

func NewBattleService(db *gorm.DB) *BattleService {
	return &BattleService{db: db}
}

// CreateBattle creates a new battle between fleets
func (s *BattleService) CreateBattle(battleType string, playerFleetID uint, enemyFleetID *uint, locationName string) (*models.Battle, error) {
	battle := models.Battle{
		Name:             fmt.Sprintf("Battle at %s", locationName),
		Type:             battleType,
		Status:           "preparing",
		MaxTurns:         50,
		CurrentTurn:      0,
		TurnTimeLimit:    30,
		LocationName:     locationName,
		Environment:      "space",
		ExperienceReward: 100,
		CreditsReward:    50,
	}

	if err := s.db.Create(&battle).Error; err != nil {
		return nil, fmt.Errorf("failed to create battle: %w", err)
	}

	// Add player participant
	playerParticipant := models.BattleParticipant{
		BattleID: battle.ID,
		FleetID:  playerFleetID,
		IsAI:     false,
		IsActive: true,
		Position: 1,
		Team:     "team1",
	}

	// Get player ID from fleet
	var fleet models.Fleet
	if err := s.db.First(&fleet, playerFleetID).Error; err != nil {
		return nil, fmt.Errorf("player fleet not found: %w", err)
	}
	playerParticipant.PlayerID = &fleet.PlayerID

	if err := s.db.Create(&playerParticipant).Error; err != nil {
		return nil, fmt.Errorf("failed to create player participant: %w", err)
	}

	// Add enemy participant
	var enemyParticipant models.BattleParticipant
	if enemyFleetID != nil {
		// PvP battle
		var enemyFleet models.Fleet
		if err := s.db.First(&enemyFleet, *enemyFleetID).Error; err != nil {
			return nil, fmt.Errorf("enemy fleet not found: %w", err)
		}

		enemyParticipant = models.BattleParticipant{
			BattleID: battle.ID,
			PlayerID: &enemyFleet.PlayerID,
			FleetID:  *enemyFleetID,
			IsAI:     false,
			IsActive: true,
			Position: 2,
			Team:     "team2",
		}
	} else {
		// PvE battle - create AI fleet
		aiFleet, err := s.createAIFleet(battleType, locationName)
		if err != nil {
			return nil, fmt.Errorf("failed to create AI fleet: %w", err)
		}

		enemyParticipant = models.BattleParticipant{
			BattleID: battle.ID,
			FleetID:  aiFleet.ID,
			IsAI:     true,
			AIType:   "medium",
			IsActive: true,
			Position: 2,
			Team:     "team2",
		}
	}

	if err := s.db.Create(&enemyParticipant).Error; err != nil {
		return nil, fmt.Errorf("failed to create enemy participant: %w", err)
	}

	// Load participants
	battle.Participants = []models.BattleParticipant{playerParticipant, enemyParticipant}

	return &battle, nil
}

// StartBattle begins the battle
func (s *BattleService) StartBattle(battleID uint) (*models.Battle, error) {
	var battle models.Battle
	if err := s.db.Preload("Participants").First(&battle, battleID).Error; err != nil {
		return nil, fmt.Errorf("battle not found: %w", err)
	}

	if battle.Status != "preparing" {
		return nil, fmt.Errorf("battle cannot be started in current status: %s", battle.Status)
	}

	now := time.Now()
	battle.Status = "active"
	battle.StartedAt = &now
	battle.CurrentTurn = 1

	if err := s.db.Save(&battle).Error; err != nil {
		return nil, fmt.Errorf("failed to start battle: %w", err)
	}

	return &battle, nil
}

// ExecuteAction executes a battle action
func (s *BattleService) ExecuteAction(battleID, participantID, sourceShipID uint, targetShipID *uint, actionType string) (*models.BattleAction, error) {
	// Verify battle is active
	var battle models.Battle
	if err := s.db.First(&battle, battleID).Error; err != nil {
		return nil, fmt.Errorf("battle not found: %w", err)
	}

	if battle.Status != "active" {
		return nil, fmt.Errorf("battle is not active")
	}

	// Get source ship
	var sourceShip models.Ship
	if err := s.db.First(&sourceShip, sourceShipID).Error; err != nil {
		return nil, fmt.Errorf("source ship not found: %w", err)
	}

	// Create battle action
	action := models.BattleAction{
		BattleID:      battleID,
		ParticipantID: participantID,
		Turn:          battle.CurrentTurn,
		ActionType:    actionType,
		SourceShipID:  sourceShipID,
		TargetShipID:  targetShipID,
		IsSuccessful:  true,
	}

	// Execute action based on type
	switch actionType {
	case "attack":
		if targetShipID == nil {
			return nil, fmt.Errorf("target ship required for attack action")
		}

		var targetShip models.Ship
		if err := s.db.First(&targetShip, *targetShipID).Error; err != nil {
			return nil, fmt.Errorf("target ship not found: %w", err)
		}

		damage := s.calculateDamage(&sourceShip, &targetShip)
		action.Damage = damage
		action.IsCritical = rand.Float64() < 0.1 // 10% critical chance

		if action.IsCritical {
			action.Damage = int(float64(damage) * 1.5)
		}

		// Apply damage to target ship
		if err := s.applyDamage(&targetShip, action.Damage); err != nil {
			return nil, fmt.Errorf("failed to apply damage: %w", err)
		}

		action.ResultMessage = fmt.Sprintf("%s attacks %s for %d damage", sourceShip.Name, targetShip.Name, action.Damage)
		if action.IsCritical {
			action.ResultMessage += " (Critical Hit!)"
		}

	case "defend":
		// Increase defense for this turn
		action.ResultMessage = fmt.Sprintf("%s takes defensive position", sourceShip.Name)

	case "special":
		// Special abilities (to be implemented)
		action.ResultMessage = fmt.Sprintf("%s uses special ability", sourceShip.Name)

	default:
		return nil, fmt.Errorf("unknown action type: %s", actionType)
	}

	// Use energy
	action.EnergyUsed = 10
	sourceShip.Energy -= action.EnergyUsed
	if sourceShip.Energy < 0 {
		sourceShip.Energy = 0
	}

	if err := s.db.Save(&sourceShip).Error; err != nil {
		return nil, fmt.Errorf("failed to update source ship: %w", err)
	}

	if err := s.db.Create(&action).Error; err != nil {
		return nil, fmt.Errorf("failed to create battle action: %w", err)
	}

	// Check if battle should end
	if err := s.checkBattleEnd(battleID); err != nil {
		return nil, fmt.Errorf("failed to check battle end: %w", err)
	}

	return &action, nil
}

// calculateDamage calculates damage between two ships
func (s *BattleService) calculateDamage(attacker, defender *models.Ship) int {
	baseDamage := attacker.Attack
	defense := defender.Defense

	// Add some randomness
	randomFactor := 0.8 + rand.Float64()*0.4 // 80% to 120%
	damage := int(float64(baseDamage-defense/2) * randomFactor)

	if damage < 1 {
		damage = 1 // Minimum damage
	}

	return damage
}

// applyDamage applies damage to a ship
func (s *BattleService) applyDamage(ship *models.Ship, damage int) error {
	// Apply to shield first
	if ship.Shield > 0 {
		if ship.Shield >= damage {
			ship.Shield -= damage
			damage = 0
		} else {
			damage -= ship.Shield
			ship.Shield = 0
		}
	}

	// Apply remaining damage to health
	if damage > 0 {
		ship.Health -= damage
		if ship.Health <= 0 {
			ship.Health = 0
			ship.IsDestroyed = true
		}
	}

	return s.db.Save(ship).Error
}

// checkBattleEnd checks if the battle should end
func (s *BattleService) checkBattleEnd(battleID uint) error {
	var battle models.Battle
	if err := s.db.Preload("Participants").First(&battle, battleID).Error; err != nil {
		return err
	}

	// Check if any team has all ships destroyed
	team1Ships := s.getActiveShipsForTeam(battleID, "team1")
	team2Ships := s.getActiveShipsForTeam(battleID, "team2")

	var winnerID *uint
	if len(team1Ships) == 0 {
		// Team 2 wins
		for _, participant := range battle.Participants {
			if participant.Team == "team2" {
				winnerID = participant.PlayerID
				break
			}
		}
	} else if len(team2Ships) == 0 {
		// Team 1 wins
		for _, participant := range battle.Participants {
			if participant.Team == "team1" {
				winnerID = participant.PlayerID
				break
			}
		}
	} else if battle.CurrentTurn >= battle.MaxTurns {
		// Battle timeout - determine winner by remaining health
		team1Health := s.getTotalTeamHealth(team1Ships)
		team2Health := s.getTotalTeamHealth(team2Ships)

		if team1Health > team2Health {
			for _, participant := range battle.Participants {
				if participant.Team == "team1" {
					winnerID = participant.PlayerID
					break
				}
			}
		} else if team2Health > team1Health {
			for _, participant := range battle.Participants {
				if participant.Team == "team2" {
					winnerID = participant.PlayerID
					break
				}
			}
		}
		// If equal health, it's a draw (winnerID remains nil)
	}

	if winnerID != nil || battle.CurrentTurn >= battle.MaxTurns {
		return s.EndBattle(battleID, winnerID)
	}

	return nil
}

// EndBattle ends the battle and calculates results
func (s *BattleService) EndBattle(battleID uint, winnerID *uint) error {
	var battle models.Battle
	if err := s.db.Preload("Participants").First(&battle, battleID).Error; err != nil {
		return err
	}

	now := time.Now()
	battle.Status = "completed"
	battle.CompletedAt = &now
	battle.WinnerID = winnerID

	if battle.StartedAt != nil {
		battle.Duration = int(now.Sub(*battle.StartedAt).Seconds())
	}

	if err := s.db.Save(&battle).Error; err != nil {
		return fmt.Errorf("failed to update battle: %w", err)
	}

	// Create battle result
	resultType := "draw"
	if winnerID != nil {
		resultType = "victory"
	}

	result := models.BattleResult{
		BattleID:          battleID,
		WinnerID:          winnerID,
		ResultType:        resultType,
		TotalTurns:        battle.CurrentTurn,
		BattleDuration:    battle.Duration,
		ExperienceAwarded: battle.ExperienceReward,
		CreditsAwarded:    battle.CreditsReward,
		OverallRating:     s.calculateBattleRating(&battle),
	}

	if err := s.db.Create(&result).Error; err != nil {
		return fmt.Errorf("failed to create battle result: %w", err)
	}

	// Award rewards to winner (integrate with resource service)
	// For now, we'll skip the reward distribution

	return nil
}

// getActiveShipsForTeam returns active ships for a team
func (s *BattleService) getActiveShipsForTeam(battleID uint, team string) []models.Ship {
	var ships []models.Ship
	s.db.Table("ships").
		Joins("JOIN fleets ON ships.fleet_id = fleets.id").
		Joins("JOIN battle_participants ON fleets.id = battle_participants.fleet_id").
		Where("battle_participants.battle_id = ? AND battle_participants.team = ? AND ships.is_destroyed = ?",
			battleID, team, false).
		Find(&ships)
	return ships
}

// getTotalTeamHealth calculates total health for a team
func (s *BattleService) getTotalTeamHealth(ships []models.Ship) int {
	total := 0
	for _, ship := range ships {
		total += ship.Health + ship.Shield
	}
	return total
}

// calculateBattleRating calculates a rating for the battle
func (s *BattleService) calculateBattleRating(battle *models.Battle) int {
	rating := 3 // Base rating

	// Adjust based on battle duration
	if battle.Duration > 0 && battle.Duration < 300 { // Less than 5 minutes
		rating++
	}

	// Adjust based on turns
	if battle.CurrentTurn < battle.MaxTurns/2 {
		rating++
	}

	if rating > 5 {
		rating = 5
	}
	if rating < 1 {
		rating = 1
	}

	return rating
}

// createAIFleet creates an AI fleet for PvE battles
func (s *BattleService) createAIFleet(battleType, locationName string) (*models.Fleet, error) {
	_ = battleType // TODO: Use battleType to determine fleet composition
	// Create AI fleet
	fleet := models.Fleet{
		Name:        fmt.Sprintf("Enemy Fleet at %s", locationName),
		Description: "AI controlled enemy fleet",
		PlayerID:    0, // Special ID for AI fleets
		MaxShips:    3,
		IsActive:    true,
		Location:    locationName,
	}

	if err := s.db.Create(&fleet).Error; err != nil {
		return nil, fmt.Errorf("failed to create AI fleet: %w", err)
	}

	// Create AI ships
	aiShips := []models.Ship{
		{
			Name:      "TIE Fighter",
			Class:     "Fighter",
			Faction:   "Empire",
			Model:     "TIE/ln Fighter",
			Health:    60,
			MaxHealth: 60,
			Attack:    12,
			Defense:   5,
			Speed:     90,
			Maneuver:  85,
			Energy:    80,
			MaxEnergy: 80,
			PlayerID:  0,
			FleetID:   &fleet.ID,
			Location:  "fleet",
		},
		{
			Name:      "TIE Fighter",
			Class:     "Fighter",
			Faction:   "Empire",
			Model:     "TIE/ln Fighter",
			Health:    60,
			MaxHealth: 60,
			Attack:    12,
			Defense:   5,
			Speed:     90,
			Maneuver:  85,
			Energy:    80,
			MaxEnergy: 80,
			PlayerID:  0,
			FleetID:   &fleet.ID,
			Location:  "fleet",
		},
	}

	for _, ship := range aiShips {
		if err := s.db.Create(&ship).Error; err != nil {
			return nil, fmt.Errorf("failed to create AI ship: %w", err)
		}
	}

	return &fleet, nil
}

// GetBattle returns a battle by ID
func (s *BattleService) GetBattle(battleID uint) (*models.Battle, error) {
	var battle models.Battle
	err := s.db.Preload("Participants").Preload("Actions").First(&battle, battleID).Error
	return &battle, err
}

// GetPlayerBattles returns battles for a player
func (s *BattleService) GetPlayerBattles(playerID uint) ([]models.Battle, error) {
	var battles []models.Battle
	err := s.db.Preload("Participants").
		Joins("JOIN battle_participants ON battles.id = battle_participants.battle_id").
		Where("battle_participants.player_id = ?", playerID).
		Order("battles.created_at DESC").
		Find(&battles).Error
	return battles, err
}
