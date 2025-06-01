package services

import (
	"fmt"
	"log"
	"strings"
	"time"

	"starwars-api/models"

	"gorm.io/gorm"
)

type BrightDataService struct {
	db *gorm.DB
}

func NewBrightDataService(db *gorm.DB) *BrightDataService {
	return &BrightDataService{db: db}
}

// MissionData represents mission data scraped from Bright Data sources
type MissionData struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Type        string   `json:"type"`
	Era         string   `json:"era"`
	Planet      string   `json:"planet"`
	Faction     string   `json:"faction"`
	Characters  []string `json:"characters"`
	SourceURL   string   `json:"source_url"`
	WookieURL   string   `json:"wookieepedia_url"`
	Difficulty  int      `json:"difficulty"`
	MinLevel    int      `json:"min_level"`
	MaxLevel    int      `json:"max_level"`
	Duration    int      `json:"estimated_duration"`
	Experience  int      `json:"experience_reward"`
	Credits     int      `json:"credits_reward"`
	Items       []string `json:"item_rewards"`
}

// ScrapeStarWarsMissions scrapes mission data from various Star Wars sources
func (s *BrightDataService) ScrapeStarWarsMissions() error {
	log.Println("Starting Bright Data mission scraping...")

	// Create sync record
	sync := &models.BrightDataMissionSync{
		SourceURL:       "https://starwars.fandom.com/wiki/Category:Missions",
		SourceType:      "wookieepedia",
		LastSyncAt:      time.Now(),
		SyncStatus:      "in_progress",
		MissionsFound:   0,
		MissionsCreated: 0,
		MissionsUpdated: 0,
	}

	if err := s.db.Create(sync).Error; err != nil {
		return fmt.Errorf("failed to create sync record: %w", err)
	}

	// Simulate scraping data from multiple sources
	missionSources := []string{
		"https://starwars.fandom.com/wiki/Category:Missions",
		"https://starwars.fandom.com/wiki/Category:Battles",
		"https://starwars.fandom.com/wiki/Category:Events",
	}

	totalFound := 0
	totalCreated := 0
	totalUpdated := 0

	for _, sourceURL := range missionSources {
		found, created, updated, err := s.scrapeMissionsFromSource(sourceURL)
		if err != nil {
			log.Printf("Error scraping from %s: %v", sourceURL, err)
			continue
		}
		totalFound += found
		totalCreated += created
		totalUpdated += updated
	}

	// Update sync record
	sync.SyncStatus = "success"
	sync.MissionsFound = totalFound
	sync.MissionsCreated = totalCreated
	sync.MissionsUpdated = totalUpdated

	if err := s.db.Save(sync).Error; err != nil {
		return fmt.Errorf("failed to update sync record: %w", err)
	}

	log.Printf("Bright Data sync completed: %d found, %d created, %d updated",
		totalFound, totalCreated, totalUpdated)

	return nil
}

// scrapeMissionsFromSource simulates scraping missions from a specific source
func (s *BrightDataService) scrapeMissionsFromSource(sourceURL string) (int, int, int, error) {
	log.Printf("Scraping missions from: %s", sourceURL)

	// Simulate scraped mission data based on the source
	var missionData []MissionData

	if strings.Contains(sourceURL, "Missions") {
		missionData = s.getWookiepeediaMissions()
	} else if strings.Contains(sourceURL, "Battles") {
		missionData = s.getWookiepeediaBattles()
	} else if strings.Contains(sourceURL, "Events") {
		missionData = s.getWookieepediaEvents()
	}

	found := len(missionData)
	created := 0
	updated := 0

	for _, data := range missionData {
		mission, isNew, err := s.createOrUpdateMission(data)
		if err != nil {
			log.Printf("Error processing mission %s: %v", data.Name, err)
			continue
		}

		if isNew {
			created++
			log.Printf("Created new mission: %s", mission.Name)
		} else {
			updated++
			log.Printf("Updated existing mission: %s", mission.Name)
		}
	}

	return found, created, updated, nil
}

// getWookiepeediaMissions returns simulated mission data from Wookieepedia missions
func (s *BrightDataService) getWookiepeediaMissions() []MissionData {
	return []MissionData{
		{
			Name:        "Rescue of Princess Leia",
			Description: "A daring rescue mission to save Princess Leia from the Death Star detention center.",
			Type:        "rescue",
			Era:         "original",
			Planet:      "Death Star",
			Faction:     "rebel",
			Characters:  []string{"Luke Skywalker", "Han Solo", "Chewbacca", "Obi-Wan Kenobi"},
			SourceURL:   "https://starwars.fandom.com/wiki/Rescue_of_Princess_Leia",
			WookieURL:   "https://starwars.fandom.com/wiki/Rescue_of_Princess_Leia",
			Difficulty:  6,
			MinLevel:    5,
			MaxLevel:    15,
			Duration:    45,
			Experience:  500,
			Credits:     1000,
			Items:       []string{"Rebel Blaster", "Princess Leia Card"},
		},
		{
			Name:        "Infiltration of Jabba's Palace",
			Description: "Sneak into Jabba's palace to rescue Han Solo from carbonite freezing.",
			Type:        "stealth",
			Era:         "original",
			Planet:      "Tatooine",
			Faction:     "rebel",
			Characters:  []string{"Luke Skywalker", "Leia Organa", "Chewbacca", "C-3PO", "R2-D2"},
			SourceURL:   "https://starwars.fandom.com/wiki/Rescue_of_Han_Solo",
			WookieURL:   "https://starwars.fandom.com/wiki/Rescue_of_Han_Solo",
			Difficulty:  7,
			MinLevel:    12,
			MaxLevel:    25,
			Duration:    60,
			Experience:  750,
			Credits:     1500,
			Items:       []string{"Thermal Detonator", "Bounty Hunter Disguise", "Han Solo Card"},
		},
		{
			Name:        "Escape from Cloud City",
			Description: "Escape from Cloud City after the trap set by Darth Vader.",
			Type:        "escape",
			Era:         "original",
			Planet:      "Bespin",
			Faction:     "rebel",
			Characters:  []string{"Luke Skywalker", "Leia Organa", "Chewbacca", "Lando Calrissian"},
			SourceURL:   "https://starwars.fandom.com/wiki/Cloud_City_uprising",
			WookieURL:   "https://starwars.fandom.com/wiki/Cloud_City_uprising",
			Difficulty:  8,
			MinLevel:    15,
			MaxLevel:    30,
			Duration:    50,
			Experience:  600,
			Credits:     1200,
			Items:       []string{"Cloud Car", "Tibanna Gas", "Lando Calrissian Card"},
		},
	}
}

// getWookiepeediaBattles returns simulated battle mission data
func (s *BrightDataService) getWookiepeediaBattles() []MissionData {
	return []MissionData{
		{
			Name:        "Battle of Yavin",
			Description: "Join the Rebel assault on the Death Star and destroy the massive space station.",
			Type:        "combat",
			Era:         "original",
			Planet:      "Yavin 4",
			Faction:     "rebel",
			Characters:  []string{"Luke Skywalker", "Red Leader", "Wedge Antilles", "Biggs Darklighter"},
			SourceURL:   "https://starwars.fandom.com/wiki/Battle_of_Yavin",
			WookieURL:   "https://starwars.fandom.com/wiki/Battle_of_Yavin",
			Difficulty:  9,
			MinLevel:    10,
			MaxLevel:    25,
			Duration:    75,
			Experience:  1000,
			Credits:     2500,
			Items:       []string{"X-wing Fighter Card", "Death Star Plans", "Rebel Pilot Helmet"},
		},
		{
			Name:        "Battle of Hoth",
			Description: "Defend the Rebel base on Hoth from Imperial assault forces.",
			Type:        "defense",
			Era:         "original",
			Planet:      "Hoth",
			Faction:     "rebel",
			Characters:  []string{"Luke Skywalker", "Han Solo", "Leia Organa", "General Rieekan"},
			SourceURL:   "https://starwars.fandom.com/wiki/Battle_of_Hoth",
			WookieURL:   "https://starwars.fandom.com/wiki/Battle_of_Hoth",
			Difficulty:  8,
			MinLevel:    15,
			MaxLevel:    30,
			Duration:    65,
			Experience:  800,
			Credits:     2000,
			Items:       []string{"Snowspeeder", "Ion Cannon", "Rebel Trooper Gear"},
		},
		{
			Name:        "Battle of Endor",
			Description: "Participate in the final battle against the Empire at Endor.",
			Type:        "combat",
			Era:         "original",
			Planet:      "Endor",
			Faction:     "rebel",
			Characters:  []string{"Luke Skywalker", "Han Solo", "Leia Organa", "Admiral Ackbar"},
			SourceURL:   "https://starwars.fandom.com/wiki/Battle_of_Endor",
			WookieURL:   "https://starwars.fandom.com/wiki/Battle_of_Endor",
			Difficulty:  10,
			MinLevel:    20,
			MaxLevel:    35,
			Duration:    90,
			Experience:  1200,
			Credits:     3000,
			Items:       []string{"Ewok Glider", "Shield Generator Plans", "Victory Medal"},
		},
	}
}

// getWookieepediaEvents returns simulated event mission data
func (s *BrightDataService) getWookieepediaEvents() []MissionData {
	return []MissionData{
		{
			Name:        "Duel on Mustafar",
			Description: "Witness the epic lightsaber duel between Obi-Wan Kenobi and Anakin Skywalker.",
			Type:        "duel",
			Era:         "prequel",
			Planet:      "Mustafar",
			Faction:     "republic",
			Characters:  []string{"Obi-Wan Kenobi", "Anakin Skywalker"},
			SourceURL:   "https://starwars.fandom.com/wiki/Duel_on_Mustafar",
			WookieURL:   "https://starwars.fandom.com/wiki/Duel_on_Mustafar",
			Difficulty:  9,
			MinLevel:    18,
			MaxLevel:    35,
			Duration:    40,
			Experience:  900,
			Credits:     1800,
			Items:       []string{"Lava Crystal", "Jedi Robes", "Sith Lightsaber"},
		},
		{
			Name:        "Order 66 Survival",
			Description: "Survive the execution of Order 66 as a Jedi during the Clone Wars.",
			Type:        "survival",
			Era:         "prequel",
			Planet:      "Various",
			Faction:     "republic",
			Characters:  []string{"Various Jedi", "Clone Troopers"},
			SourceURL:   "https://starwars.fandom.com/wiki/Order_66",
			WookieURL:   "https://starwars.fandom.com/wiki/Order_66",
			Difficulty:  10,
			MinLevel:    20,
			MaxLevel:    40,
			Duration:    55,
			Experience:  1100,
			Credits:     2200,
			Items:       []string{"Jedi Holocron", "Clone Armor", "Survival Kit"},
		},
	}
}

// createOrUpdateMission creates a new mission or updates existing one
func (s *BrightDataService) createOrUpdateMission(data MissionData) (*models.Mission, bool, error) {
	var mission models.Mission
	result := s.db.Where("name = ?", data.Name).First(&mission)

	isNew := result.Error == gorm.ErrRecordNotFound

	if isNew {
		// Create new mission
		mission = models.Mission{
			Name:              data.Name,
			Description:       data.Description,
			ShortDescription:  s.generateShortDescription(data.Description),
			Type:              data.Type,
			Category:          "story", // Default category
			Difficulty:        data.Difficulty,
			MinLevel:          data.MinLevel,
			MaxLevel:          data.MaxLevel,
			EstimatedDuration: data.Duration,
			Era:               data.Era,
			Planet:            data.Planet,
			Faction:           data.Faction,
			Characters:        data.Characters,
			RequiredLevel:     data.MinLevel,
			ExperienceReward:  data.Experience,
			CreditsReward:     data.Credits,
			ItemRewards:       data.Items,
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     24,
			UnitySceneName:    s.generateUnitySceneName(data.Name),
			SourceURL:         data.SourceURL,
			WookieepediaURL:   data.WookieURL,
		}

		now := time.Now()
		mission.LastSyncedAt = &now

		if err := s.db.Create(&mission).Error; err != nil {
			return nil, false, err
		}
	} else {
		// Update existing mission
		mission.Description = data.Description
		mission.SourceURL = data.SourceURL
		mission.WookieepediaURL = data.WookieURL
		now := time.Now()
		mission.LastSyncedAt = &now

		if err := s.db.Save(&mission).Error; err != nil {
			return nil, false, err
		}
	}

	return &mission, isNew, nil
}

// generateShortDescription creates a short description from the full description
func (s *BrightDataService) generateShortDescription(description string) string {
	if len(description) <= 100 {
		return description
	}

	// Find the first sentence or truncate at 100 characters
	if idx := strings.Index(description, "."); idx > 0 && idx <= 100 {
		return description[:idx+1]
	}

	return description[:97] + "..."
}

// generateUnitySceneName creates a Unity scene name from mission name
func (s *BrightDataService) generateUnitySceneName(name string) string {
	// Remove special characters and spaces, convert to PascalCase
	sceneName := strings.ReplaceAll(name, " ", "")
	sceneName = strings.ReplaceAll(sceneName, "'", "")
	sceneName = strings.ReplaceAll(sceneName, "-", "")
	return sceneName
}

// GetSyncHistory returns the history of Bright Data syncs
func (s *BrightDataService) GetSyncHistory() ([]models.BrightDataMissionSync, error) {
	var syncs []models.BrightDataMissionSync
	err := s.db.Order("created_at DESC").Limit(10).Find(&syncs).Error
	return syncs, err
}

// GetLastSyncStatus returns the status of the last sync
func (s *BrightDataService) GetLastSyncStatus() (*models.BrightDataMissionSync, error) {
	var sync models.BrightDataMissionSync
	err := s.db.Order("created_at DESC").First(&sync).Error
	if err != nil {
		return nil, err
	}
	return &sync, nil
}
