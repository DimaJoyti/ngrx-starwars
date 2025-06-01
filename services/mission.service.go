package services

import (
	"fmt"
	"log"
	"time"

	"starwars-api/models"

	"gorm.io/gorm"
)

type MissionService struct {
	db                *gorm.DB
	brightDataService *BrightDataService
}

func NewMissionService(db *gorm.DB) *MissionService {
	return &MissionService{
		db:                db,
		brightDataService: NewBrightDataService(db),
	}
}

// GetAllMissions returns all available missions
func (s *MissionService) GetAllMissions() ([]models.Mission, error) {
	var missions []models.Mission
	err := s.db.Preload("Objectives").Find(&missions).Error
	return missions, err
}

// GetMissionsByType returns missions filtered by type
func (s *MissionService) GetMissionsByType(missionType string) ([]models.Mission, error) {
	var missions []models.Mission
	err := s.db.Preload("Objectives").Where("type = ?", missionType).Find(&missions).Error
	return missions, err
}

// GetMissionsByCategory returns missions filtered by category
func (s *MissionService) GetMissionsByCategory(category string) ([]models.Mission, error) {
	var missions []models.Mission
	err := s.db.Preload("Objectives").Where("category = ?", category).Find(&missions).Error
	return missions, err
}

// GetAvailableMissionsForPlayer returns missions available for a specific player
func (s *MissionService) GetAvailableMissionsForPlayer(playerID int, playerLevel int) ([]models.Mission, error) {
	var missions []models.Mission

	// Get missions that player hasn't completed and meets level requirements
	query := s.db.Preload("Objectives").
		Where("is_active = ? AND min_level <= ? AND (max_level = 0 OR max_level >= ?)",
			true, playerLevel, playerLevel)

	// Exclude completed non-repeatable missions
	subQuery := s.db.Model(&models.MissionProgress{}).
		Select("mission_id").
		Where("player_id = ? AND status = ? AND mission_id IN (?)",
			playerID, "completed",
			s.db.Model(&models.Mission{}).Select("id").Where("is_repeatable = ?", false))

	query = query.Where("id NOT IN (?)", subQuery)

	err := query.Find(&missions).Error
	return missions, err
}

// GetMissionProgress returns player's progress on a specific mission
func (s *MissionService) GetMissionProgress(playerID, missionID int) (*models.MissionProgress, error) {
	var progress models.MissionProgress
	err := s.db.Where("player_id = ? AND mission_id = ?", playerID, missionID).First(&progress).Error
	if err != nil {
		return nil, err
	}
	return &progress, nil
}

// StartMission starts a mission for a player
func (s *MissionService) StartMission(playerID, missionID int) (*models.MissionProgress, error) {
	// Check if mission exists and is available
	var mission models.Mission
	if err := s.db.Preload("Objectives").First(&mission, missionID).Error; err != nil {
		return nil, fmt.Errorf("mission not found: %w", err)
	}

	// Check if player already has progress on this mission
	var existingProgress models.MissionProgress
	err := s.db.Where("player_id = ? AND mission_id = ?", playerID, missionID).First(&existingProgress).Error

	if err == nil {
		// Mission already started
		if existingProgress.Status == "in_progress" {
			return &existingProgress, nil
		}
		if existingProgress.Status == "completed" && !mission.IsRepeatable {
			return nil, fmt.Errorf("mission already completed and not repeatable")
		}
	}

	// Create new progress record
	now := time.Now()
	progress := models.MissionProgress{
		PlayerID:            playerID,
		MissionID:           missionID,
		Status:              "in_progress",
		ObjectivesCompleted: 0,
		TotalObjectives:     len(mission.Objectives),
		ProgressPercentage:  0.0,
		StartedAt:           &now,
		PlayCount:           existingProgress.PlayCount + 1,
	}

	if err := s.db.Create(&progress).Error; err != nil {
		return nil, fmt.Errorf("failed to create mission progress: %w", err)
	}

	return &progress, nil
}

// UpdateObjectiveProgress updates progress on a specific objective
func (s *MissionService) UpdateObjectiveProgress(playerID, missionID, objectiveID int, progress int) error {
	// Get mission progress
	var missionProgress models.MissionProgress
	if err := s.db.Where("player_id = ? AND mission_id = ?", playerID, missionID).First(&missionProgress).Error; err != nil {
		return fmt.Errorf("mission progress not found: %w", err)
	}

	// Get objective
	var objective models.MissionObjective
	if err := s.db.Where("id = ? AND mission_id = ?", objectiveID, missionID).First(&objective).Error; err != nil {
		return fmt.Errorf("objective not found: %w", err)
	}

	// Update objective progress
	objective.CurrentCount = progress
	if progress >= objective.TargetCount {
		objective.IsCompleted = true
		now := time.Now()
		objective.CompletedAt = &now
	}

	if err := s.db.Save(&objective).Error; err != nil {
		return fmt.Errorf("failed to update objective: %w", err)
	}

	// Update mission progress
	return s.updateMissionProgress(playerID, missionID)
}

// CompleteMission marks a mission as completed
func (s *MissionService) CompleteMission(playerID, missionID int, rating int) (*models.MissionProgress, error) {
	var progress models.MissionProgress
	if err := s.db.Where("player_id = ? AND mission_id = ?", playerID, missionID).First(&progress).Error; err != nil {
		return nil, fmt.Errorf("mission progress not found: %w", err)
	}

	// Get mission details for rewards
	var mission models.Mission
	if err := s.db.First(&mission, missionID).Error; err != nil {
		return nil, fmt.Errorf("mission not found: %w", err)
	}

	// Update progress
	now := time.Now()
	progress.Status = "completed"
	progress.CompletedAt = &now
	progress.Rating = rating
	progress.ProgressPercentage = 100.0

	// Calculate time spent
	if progress.StartedAt != nil {
		progress.TimeSpent = int(now.Sub(*progress.StartedAt).Seconds())

		// Update best time if this is better
		if progress.BestTime == 0 || progress.TimeSpent < progress.BestTime {
			progress.BestTime = progress.TimeSpent
		}
	}

	// Update best rating
	if rating > progress.BestRating {
		progress.BestRating = rating
	}

	// Calculate rewards
	progress.ExperienceEarned = mission.ExperienceReward
	progress.CreditsEarned = mission.CreditsReward
	progress.ItemsEarned = mission.ItemRewards

	if err := s.db.Save(&progress).Error; err != nil {
		return nil, fmt.Errorf("failed to update mission progress: %w", err)
	}

	// Award rewards to player (this would integrate with player service)
	// s.awardRewardsToPlayer(playerID, progress)

	return &progress, nil
}

// updateMissionProgress recalculates mission progress based on objectives
func (s *MissionService) updateMissionProgress(playerID, missionID int) error {
	var progress models.MissionProgress
	if err := s.db.Where("player_id = ? AND mission_id = ?", playerID, missionID).First(&progress).Error; err != nil {
		return err
	}

	// Count completed objectives
	var completedCount int64
	s.db.Model(&models.MissionObjective{}).
		Where("mission_id = ? AND is_completed = ?", missionID, true).
		Count(&completedCount)

	progress.ObjectivesCompleted = int(completedCount)
	progress.ProgressPercentage = float64(completedCount) / float64(progress.TotalObjectives) * 100.0

	return s.db.Save(&progress).Error
}

// GetPlayerMissionHistory returns all missions a player has attempted
func (s *MissionService) GetPlayerMissionHistory(playerID int) ([]models.MissionProgress, error) {
	var history []models.MissionProgress
	err := s.db.Where("player_id = ?", playerID).Order("created_at DESC").Find(&history).Error
	return history, err
}

// GetMissionStatistics returns statistics for a mission
func (s *MissionService) GetMissionStatistics(missionID int) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total attempts
	var totalAttempts int64
	s.db.Model(&models.MissionProgress{}).Where("mission_id = ?", missionID).Count(&totalAttempts)
	stats["total_attempts"] = totalAttempts

	// Completion rate
	var completions int64
	s.db.Model(&models.MissionProgress{}).Where("mission_id = ? AND status = ?", missionID, "completed").Count(&completions)
	if totalAttempts > 0 {
		stats["completion_rate"] = float64(completions) / float64(totalAttempts) * 100.0
	} else {
		stats["completion_rate"] = 0.0
	}

	// Average rating
	var avgRating float64
	s.db.Model(&models.MissionProgress{}).
		Where("mission_id = ? AND status = ? AND rating > 0", missionID, "completed").
		Select("AVG(rating)").Scan(&avgRating)
	stats["average_rating"] = avgRating

	// Average completion time
	var avgTime float64
	s.db.Model(&models.MissionProgress{}).
		Where("mission_id = ? AND status = ? AND time_spent > 0", missionID, "completed").
		Select("AVG(time_spent)").Scan(&avgTime)
	stats["average_completion_time"] = avgTime

	return stats, nil
}

// CreateMissionFromBrightData creates a mission from Bright Data scraped content
func (s *MissionService) CreateMissionFromBrightData(data map[string]interface{}) (*models.Mission, error) {
	mission := models.Mission{
		Name:            data["name"].(string),
		Description:     data["description"].(string),
		Type:            data["type"].(string),
		Category:        "story", // default
		Difficulty:      5,       // default
		IsActive:        true,
		SourceURL:       data["source_url"].(string),
		WookieepediaURL: data["wookieepedia_url"].(string),
	}

	// Parse additional data if available
	if era, ok := data["era"].(string); ok {
		mission.Era = era
	}
	if planet, ok := data["planet"].(string); ok {
		mission.Planet = planet
	}
	if faction, ok := data["faction"].(string); ok {
		mission.Faction = faction
	}

	now := time.Now()
	mission.LastSyncedAt = &now

	if err := s.db.Create(&mission).Error; err != nil {
		return nil, fmt.Errorf("failed to create mission from Bright Data: %w", err)
	}

	return &mission, nil
}

// SyncWithBrightData syncs missions with Bright Data sources
func (s *MissionService) SyncWithBrightData() error {
	log.Println("Starting Bright Data sync for missions...")

	// Use the Bright Data service to scrape and sync missions
	return s.brightDataService.ScrapeStarWarsMissions()
}

// GetSyncHistory returns the history of Bright Data syncs
func (s *MissionService) GetSyncHistory() ([]models.BrightDataMissionSync, error) {
	return s.brightDataService.GetSyncHistory()
}

// GetLastSyncStatus returns the status of the last sync
func (s *MissionService) GetLastSyncStatus() (*models.BrightDataMissionSync, error) {
	return s.brightDataService.GetLastSyncStatus()
}
