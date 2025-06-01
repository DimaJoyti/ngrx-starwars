package services

import (
	"encoding/json"
	"fmt"
	"starwars-api/models"
	"time"

	"gorm.io/gorm"
)

type AchievementService struct {
	db              *gorm.DB
	resourceService *ResourceService
}

func NewAchievementService(db *gorm.DB, resourceService *ResourceService) *AchievementService {
	return &AchievementService{
		db:              db,
		resourceService: resourceService,
	}
}

// GetAllAchievements returns all available achievements
func (s *AchievementService) GetAllAchievements() ([]models.Achievement, error) {
	var achievements []models.Achievement
	err := s.db.Where("is_active = ?", true).Order("category ASC, points ASC").Find(&achievements).Error
	return achievements, err
}

// GetPlayerAchievements returns a player's achievement progress
func (s *AchievementService) GetPlayerAchievements(playerID uint) ([]models.PlayerAchievement, error) {
	var playerAchievements []models.PlayerAchievement
	err := s.db.Preload("Achievement").Where("player_id = ?", playerID).Find(&playerAchievements).Error
	return playerAchievements, err
}

// InitializePlayerAchievements creates achievement progress records for a new player
func (s *AchievementService) InitializePlayerAchievements(playerID uint) error {
	// Get all active achievements
	achievements, err := s.GetAllAchievements()
	if err != nil {
		return fmt.Errorf("failed to get achievements: %w", err)
	}

	// Create progress records for each achievement
	for _, achievement := range achievements {
		// Check if player already has this achievement
		var existing models.PlayerAchievement
		err := s.db.Where("player_id = ? AND achievement_id = ?", playerID, achievement.ID).First(&existing).Error

		if err == gorm.ErrRecordNotFound {
			// Create new progress record
			playerAchievement := models.PlayerAchievement{
				PlayerID:        playerID,
				AchievementID:   achievement.ID,
				CurrentProgress: 0,
				TargetProgress:  achievement.Target,
				ProgressPercent: 0.0,
				IsUnlocked:      false,
				IsNotified:      false,
				TimesToUnlock:   0,
				RewardsClaimed:  false,
			}

			if err := s.db.Create(&playerAchievement).Error; err != nil {
				return fmt.Errorf("failed to create player achievement: %w", err)
			}
		}
	}

	return nil
}

// UpdateProgress updates progress on an achievement
func (s *AchievementService) UpdateProgress(playerID uint, achievementName string, progressValue int) error {
	// Get achievement by name
	var achievement models.Achievement
	if err := s.db.Where("name = ?", achievementName).First(&achievement).Error; err != nil {
		return fmt.Errorf("achievement not found: %w", err)
	}

	// Get player achievement progress
	var playerAchievement models.PlayerAchievement
	err := s.db.Where("player_id = ? AND achievement_id = ?", playerID, achievement.ID).First(&playerAchievement).Error

	if err == gorm.ErrRecordNotFound {
		// Create new progress record
		playerAchievement = models.PlayerAchievement{
			PlayerID:        playerID,
			AchievementID:   achievement.ID,
			CurrentProgress: 0,
			TargetProgress:  achievement.Target,
			ProgressPercent: 0.0,
			IsUnlocked:      false,
			IsNotified:      false,
			TimesToUnlock:   0,
			RewardsClaimed:  false,
		}

		if err := s.db.Create(&playerAchievement).Error; err != nil {
			return fmt.Errorf("failed to create player achievement: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to get player achievement: %w", err)
	}

	// Skip if already unlocked and not repeatable
	if playerAchievement.IsUnlocked && !achievement.IsRepeatable {
		return nil
	}

	// Update progress
	now := time.Now()
	if playerAchievement.FirstProgressAt == nil {
		playerAchievement.FirstProgressAt = &now
	}
	playerAchievement.LastProgressAt = &now

	switch achievement.Type {
	case "count":
		// Increment progress
		playerAchievement.CurrentProgress += progressValue
	case "milestone":
		// Set progress to specific value
		if progressValue > playerAchievement.CurrentProgress {
			playerAchievement.CurrentProgress = progressValue
		}
	case "boolean":
		// Set to 1 if condition is met
		if progressValue > 0 {
			playerAchievement.CurrentProgress = 1
		}
	}

	// Calculate progress percentage
	if playerAchievement.TargetProgress > 0 {
		playerAchievement.ProgressPercent = float64(playerAchievement.CurrentProgress) / float64(playerAchievement.TargetProgress) * 100.0
		if playerAchievement.ProgressPercent > 100.0 {
			playerAchievement.ProgressPercent = 100.0
		}
	}

	// Check if achievement is unlocked
	wasUnlocked := playerAchievement.IsUnlocked
	if playerAchievement.CurrentProgress >= playerAchievement.TargetProgress {
		if !wasUnlocked || achievement.IsRepeatable {
			playerAchievement.IsUnlocked = true
			playerAchievement.IsNotified = false // Reset notification flag
			playerAchievement.TimesToUnlock++

			if !wasUnlocked {
				playerAchievement.UnlockedAt = &now
			}

			// Award rewards
			if err := s.awardAchievementRewards(playerID, &achievement); err != nil {
				return fmt.Errorf("failed to award achievement rewards: %w", err)
			}

			// Reset progress for repeatable achievements
			if achievement.IsRepeatable && wasUnlocked {
				playerAchievement.CurrentProgress = 0
				playerAchievement.ProgressPercent = 0.0
				playerAchievement.IsUnlocked = false
			}
		}
	}

	// Save progress
	if err := s.db.Save(&playerAchievement).Error; err != nil {
		return fmt.Errorf("failed to save player achievement: %w", err)
	}

	// Create progress record for detailed tracking
	progressRecord := models.AchievementProgress{
		PlayerAchievementID: playerAchievement.ID,
		ProgressType:        "increment",
		ProgressValue:       progressValue,
		PreviousValue:       playerAchievement.CurrentProgress - progressValue,
		Source:              "game_action",
	}

	if err := s.db.Create(&progressRecord).Error; err != nil {
		return fmt.Errorf("failed to create progress record: %w", err)
	}

	return nil
}

// awardAchievementRewards awards rewards for completing an achievement
func (s *AchievementService) awardAchievementRewards(playerID uint, achievement *models.Achievement) error {
	// Award basic rewards
	if achievement.CreditsReward > 0 || achievement.CrystalsReward > 0 || achievement.ExperienceReward > 0 {
		err := s.resourceService.AddResources(
			playerID,
			achievement.CreditsReward,    // credits
			achievement.CrystalsReward,   // crystals
			achievement.ExperienceReward, // experience
			0, 0, 0, 0, 0, 0, 0, 0,       // other resources
			"achievement",
			fmt.Sprintf("Achievement unlocked: %s", achievement.Title),
		)
		if err != nil {
			return fmt.Errorf("failed to award basic rewards: %w", err)
		}
	}

	// Award item rewards
	if achievement.ItemRewards != "" {
		var items []string
		if err := json.Unmarshal([]byte(achievement.ItemRewards), &items); err == nil {
			// Process item rewards (integrate with inventory system when available)
			// For now, we'll just log the items
			fmt.Printf("Player %d received items: %v\n", playerID, items)
		}
	}

	// Award title reward
	if achievement.TitleReward != "" {
		// Process title reward (integrate with player profile system when available)
		fmt.Printf("Player %d received title: %s\n", playerID, achievement.TitleReward)
	}

	return nil
}

// GetAchievementsByCategory returns achievements filtered by category
func (s *AchievementService) GetAchievementsByCategory(category string) ([]models.Achievement, error) {
	var achievements []models.Achievement
	err := s.db.Where("category = ? AND is_active = ?", category, true).
		Order("points ASC").Find(&achievements).Error
	return achievements, err
}

// GetPlayerAchievementStats returns achievement statistics for a player
func (s *AchievementService) GetPlayerAchievementStats(playerID uint) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total achievements unlocked
	var totalUnlocked int64
	s.db.Model(&models.PlayerAchievement{}).
		Where("player_id = ? AND is_unlocked = ?", playerID, true).
		Count(&totalUnlocked)
	stats["total_unlocked"] = totalUnlocked

	// Total achievement points
	var totalPoints int64
	s.db.Table("player_achievements").
		Joins("JOIN achievements ON player_achievements.achievement_id = achievements.id").
		Where("player_achievements.player_id = ? AND player_achievements.is_unlocked = ?", playerID, true).
		Select("SUM(achievements.points)").Scan(&totalPoints)
	stats["total_points"] = totalPoints

	// Achievements by rarity
	rarityStats := make(map[string]int64)
	rarities := []string{"common", "rare", "epic", "legendary"}

	for _, rarity := range rarities {
		var count int64
		s.db.Table("player_achievements").
			Joins("JOIN achievements ON player_achievements.achievement_id = achievements.id").
			Where("player_achievements.player_id = ? AND player_achievements.is_unlocked = ? AND achievements.rarity = ?",
				playerID, true, rarity).
			Count(&count)
		rarityStats[rarity] = count
	}
	stats["by_rarity"] = rarityStats

	// Achievements by category
	categoryStats := make(map[string]int64)
	categories := []string{"combat", "exploration", "collection", "social", "progression"}

	for _, category := range categories {
		var count int64
		s.db.Table("player_achievements").
			Joins("JOIN achievements ON player_achievements.achievement_id = achievements.id").
			Where("player_achievements.player_id = ? AND player_achievements.is_unlocked = ? AND achievements.category = ?",
				playerID, true, category).
			Count(&count)
		categoryStats[category] = count
	}
	stats["by_category"] = categoryStats

	// Completion rate
	var totalAchievements int64
	s.db.Model(&models.Achievement{}).Where("is_active = ?", true).Count(&totalAchievements)

	if totalAchievements > 0 {
		completionRate := float64(totalUnlocked) / float64(totalAchievements) * 100.0
		stats["completion_rate"] = completionRate
	} else {
		stats["completion_rate"] = 0.0
	}

	return stats, nil
}

// GetLeaderboard returns achievement leaderboard
func (s *AchievementService) GetLeaderboard(limit int) ([]models.AchievementLeaderboard, error) {
	var leaderboard []models.AchievementLeaderboard
	err := s.db.Order("total_points DESC, total_unlocked DESC").
		Limit(limit).Find(&leaderboard).Error
	return leaderboard, err
}

// UpdateLeaderboard updates the achievement leaderboard for a player
func (s *AchievementService) UpdateLeaderboard(playerID uint) error {
	// Get player stats
	stats, err := s.GetPlayerAchievementStats(playerID)
	if err != nil {
		return fmt.Errorf("failed to get player stats: %w", err)
	}

	// Get player name (this would come from player service)
	var player models.Player
	if err := s.db.First(&player, playerID).Error; err != nil {
		return fmt.Errorf("player not found: %w", err)
	}

	// Get or create leaderboard entry
	var leaderboardEntry models.AchievementLeaderboard
	err = s.db.Where("player_id = ?", playerID).First(&leaderboardEntry).Error

	if err == gorm.ErrRecordNotFound {
		// Create new entry
		leaderboardEntry = models.AchievementLeaderboard{
			PlayerID:   playerID,
			PlayerName: player.Username,
		}
	} else if err != nil {
		return fmt.Errorf("failed to get leaderboard entry: %w", err)
	}

	// Update stats
	leaderboardEntry.TotalPoints = int(stats["total_points"].(int64))
	leaderboardEntry.TotalUnlocked = int(stats["total_unlocked"].(int64))
	leaderboardEntry.LastUpdated = time.Now()

	// Update rarity counts
	rarityStats := stats["by_rarity"].(map[string]int64)
	leaderboardEntry.RareUnlocked = int(rarityStats["rare"])
	leaderboardEntry.EpicUnlocked = int(rarityStats["epic"])
	leaderboardEntry.LegendaryUnlocked = int(rarityStats["legendary"])

	// Calculate completion rate
	leaderboardEntry.CompletionRate = stats["completion_rate"].(float64)

	// Save or create
	if leaderboardEntry.ID == 0 {
		err = s.db.Create(&leaderboardEntry).Error
	} else {
		err = s.db.Save(&leaderboardEntry).Error
	}

	if err != nil {
		return fmt.Errorf("failed to update leaderboard: %w", err)
	}

	return nil
}

// ClaimRewards marks achievement rewards as claimed
func (s *AchievementService) ClaimRewards(playerID, achievementID uint) error {
	var playerAchievement models.PlayerAchievement
	err := s.db.Where("player_id = ? AND achievement_id = ?", playerID, achievementID).First(&playerAchievement).Error

	if err != nil {
		return fmt.Errorf("player achievement not found: %w", err)
	}

	if !playerAchievement.IsUnlocked {
		return fmt.Errorf("achievement not unlocked")
	}

	if playerAchievement.RewardsClaimed {
		return fmt.Errorf("rewards already claimed")
	}

	now := time.Now()
	playerAchievement.RewardsClaimed = true
	playerAchievement.ClaimedAt = &now

	if err := s.db.Save(&playerAchievement).Error; err != nil {
		return fmt.Errorf("failed to claim rewards: %w", err)
	}

	return nil
}

// GetUnnotifiedAchievements returns achievements that have been unlocked but not notified
func (s *AchievementService) GetUnnotifiedAchievements(playerID uint) ([]models.PlayerAchievement, error) {
	var achievements []models.PlayerAchievement
	err := s.db.Preload("Achievement").
		Where("player_id = ? AND is_unlocked = ? AND is_notified = ?", playerID, true, false).
		Find(&achievements).Error
	return achievements, err
}

// MarkAsNotified marks achievements as notified
func (s *AchievementService) MarkAsNotified(playerID uint, achievementIDs []uint) error {
	err := s.db.Model(&models.PlayerAchievement{}).
		Where("player_id = ? AND achievement_id IN ?", playerID, achievementIDs).
		Update("is_notified", true).Error
	return err
}
