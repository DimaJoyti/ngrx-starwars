package database

import (
	"log"
	"time"

	"gorm.io/gorm"
	"starwars-api/models"
)

// SeedMissions creates initial mission data based on Star Wars lore and Bright Data
func SeedMissions(db *gorm.DB) error {
	log.Println("Seeding missions...")

	missions := []models.Mission{
		// Story Missions - Original Trilogy
		{
			Name:              "Rescue Princess Leia",
			Description:       "Infiltrate the Death Star and rescue Princess Leia from Imperial custody. Navigate through detention levels, avoid stormtroopers, and escape with the princess.",
			ShortDescription:  "Rescue Princess Leia from the Death Star",
			Type:              "rescue",
			Category:          "main",
			Difficulty:        6,
			MinLevel:          5,
			MaxLevel:          15,
			EstimatedDuration: 45,
			Era:               "original",
			Planet:            "Death Star",
			Faction:           "rebel",
			Characters:        []string{"Luke Skywalker", "Han Solo", "Chewbacca", "Obi-Wan Kenobi", "Princess Leia"},
			RequiredLevel:     5,
			ExperienceReward:  500,
			CreditsReward:     1000,
			ItemRewards:       []string{"Rebel Blaster", "Princess Leia Card"},
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     24,
			UnitySceneName:    "DeathStarRescue",
			Environment3D: models.Environment3D{
				SkyboxTexture:   "/textures/skyboxes/space_death_star.jpg",
				AmbientColor:    "#2C2C2C",
				SunColor:        "#FFFFFF",
				SunIntensity:    1.0,
				TerrainType:     "metal_corridors",
				TerrainTexture:  "/textures/terrain/metal.jpg",
				TerrainScale:    1.0,
				TerrainHeight:   0.0,
				WeatherType:     "none",
				ParticleEffects: []string{"sparks", "steam"},
				FogDensity:      0.1,
				FogColor:        "#2C2C2C",
				MusicTrack:      "imperial_march",
				SoundEffects:    []string{"blaster_fire", "stormtrooper_chatter", "door_hiss"},
				AmbientSound:    "death_star_ambient",
			},
			SourceURL:       "https://starwars.fandom.com/wiki/Rescue_of_Princess_Leia",
			WookieepediaURL: "https://starwars.fandom.com/wiki/Rescue_of_Princess_Leia",
		},
		{
			Name:              "Destroy the Death Star",
			Description:       "Join the Rebel assault on the Death Star. Pilot an X-wing fighter through the trench run and destroy the massive space station's weakness.",
			ShortDescription:  "Destroy the Death Star in an epic space battle",
			Type:              "combat",
			Category:          "main",
			Difficulty:        8,
			MinLevel:          10,
			MaxLevel:          25,
			EstimatedDuration: 60,
			Era:               "original",
			Planet:            "Yavin 4",
			Faction:           "rebel",
			Characters:        []string{"Luke Skywalker", "Red Leader", "Wedge Antilles", "Biggs Darklighter"},
			RequiredMissions:  []int{1}, // Requires rescue mission
			RequiredLevel:     10,
			ExperienceReward:  1000,
			CreditsReward:     2500,
			ItemRewards:       []string{"X-wing Fighter Card", "Death Star Plans", "Rebel Pilot Helmet"},
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     48,
			UnitySceneName:    "DeathStarAssault",
			Environment3D: models.Environment3D{
				SkyboxTexture:   "/textures/skyboxes/space_battle.jpg",
				AmbientColor:    "#000011",
				SunColor:        "#FFFF88",
				SunIntensity:    1.2,
				TerrainType:     "space",
				TerrainTexture:  "",
				TerrainScale:    1.0,
				TerrainHeight:   0.0,
				WeatherType:     "none",
				ParticleEffects: []string{"laser_fire", "explosions", "engine_trails"],
				MusicTrack:      "battle_of_yavin",
				FogDensity:      0.0,
				FogColor:        "#000000",
				SoundEffects:    []string{"x_wing_engine", "tie_fighter_scream", "explosion"],
			},
			SourceURL:       "https://starwars.fandom.com/wiki/Battle_of_Yavin",
			WookieepediaURL: "https://starwars.fandom.com/wiki/Battle_of_Yavin",
		},
		// Exploration Missions
		{
			Name:              "Explore Tatooine",
			Description:       "Explore the desert planet of Tatooine. Search for moisture farms, avoid Tusken Raiders, and discover ancient Jawa technology.",
			ShortDescription:  "Explore the desert world of Tatooine",
			Type:              "exploration",
			Category:          "side",
			Difficulty:        3,
			MinLevel:          1,
			MaxLevel:          10,
			EstimatedDuration: 30,
			Era:               "original",
			Planet:            "Tatooine",
			Faction:           "neutral",
			Characters:        []string{"Luke Skywalker", "Owen Lars", "Beru Lars", "Jawas"},
			RequiredLevel:     1,
			ExperienceReward:  200,
			CreditsReward:     500,
			ItemRewards:       []string{"Moisture Vaporator", "Jawa Blaster"},
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     12,
			UnitySceneName:    "TatooineExploration",
			Environment3D: models.Environment3D{
				SkyboxTexture:   "/textures/skyboxes/tatooine_desert.jpg",
				AmbientColor:    "#FFA366",
				SunColor:        "#FFCC66",
				SunIntensity:    1.5,
				TerrainType:     "desert",
				TerrainTexture:  "/textures/terrain/sand_dunes.jpg",
				TerrainScale:    100.0,
				TerrainHeight:   50.0,
				WeatherType:     "clear",
				ParticleEffects: []string{"sand", "heat_shimmer"},
				MusicTrack:      "tatooine_theme",
				SoundEffects:    []string{"wind", "jawa_chatter", "dewback_call"},
				FogDensity:      0.1,
				FogColor:        "#FFCC99",
				AmbientSound:    "desert_wind",
			},
			SourceURL:       "https://starwars.fandom.com/wiki/Tatooine",
			WookieepediaURL: "https://starwars.fandom.com/wiki/Tatooine",
		},
		// Prequel Era Missions
		{
			Name:              "Boonta Eve Podrace",
			Description:       "Compete in the dangerous Boonta Eve Podrace on Tatooine. Navigate through the treacherous course while avoiding sabotage from rival racers.",
			ShortDescription:  "Win the Boonta Eve Podrace",
			Type:              "racing",
			Category:          "side",
			Difficulty:        7,
			MinLevel:          8,
			MaxLevel:          20,
			EstimatedDuration: 25,
			Era:               "prequel",
			Planet:            "Tatooine",
			Faction:           "neutral",
			Characters:        []string{"Anakin Skywalker", "Sebulba", "Watto", "Qui-Gon Jinn"},
			RequiredLevel:     8,
			ExperienceReward:  400,
			CreditsReward:     1500,
			ItemRewards:       []string{"Podracer Parts", "Racing Trophy", "Anakin's Podracer Card"},
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     24,
			UnitySceneName:    "BoontaEvePodrace",
			Environment3D: models.Environment3D{
				SkyboxTexture:   "/textures/skyboxes/tatooine_race.jpg",
				AmbientColor:    "#FF9944",
				SunColor:        "#FFAA44",
				SunIntensity:    1.3,
				TerrainType:     "desert_canyon",
				TerrainTexture:  "/textures/terrain/canyon_rock.jpg",
				TerrainScale:    200.0,
				TerrainHeight:   100.0,
				WeatherType:     "clear",
				ParticleEffects: []string{"dust_clouds", "engine_exhaust", "crowd_cheers"},
				MusicTrack:      "duel_of_fates",
				FogDensity:      0.05,
				FogColor:        "#FFAA77",
				SoundEffects:    []string{"podracer_engine", "crowd_roar", "collision"],
			},
			SourceURL:       "https://starwars.fandom.com/wiki/Boonta_Eve_Classic",
			WookieepediaURL: "https://starwars.fandom.com/wiki/Boonta_Eve_Classic",
		},
		// Collection Missions
		{
			Name:              "Collect Jedi Holocrons",
			Description:       "Search ancient Jedi temples across the galaxy to collect valuable holocrons containing Jedi knowledge and history.",
			ShortDescription:  "Collect ancient Jedi holocrons",
			Type:              "collection",
			Category:          "side",
			Difficulty:        5,
			MinLevel:          15,
			MaxLevel:          30,
			EstimatedDuration: 40,
			Era:               "prequel",
			Planet:            "Coruscant",
			Faction:           "republic",
			Characters:        []string{"Yoda", "Mace Windu", "Obi-Wan Kenobi"},
			RequiredLevel:     15,
			ExperienceReward:  600,
			CreditsReward:     800,
			ItemRewards:       []string{"Jedi Holocron", "Ancient Lightsaber", "Jedi Robes"},
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     36,
			UnitySceneName:    "JediTempleSearch",
			Environment3D: models.Environment3D{
				SkyboxTexture:   "/textures/skyboxes/coruscant_temple.jpg",
				AmbientColor:    "#4488CC",
				SunColor:        "#FFFFFF",
				SunIntensity:    0.8,
				TerrainType:     "temple_stone",
				TerrainTexture:  "/textures/terrain/temple_marble.jpg",
				TerrainScale:    50.0,
				TerrainHeight:   20.0,
				WeatherType:     "clear",
				ParticleEffects: []string{"force_energy", "light_beams"],
				MusicTrack:      "jedi_temple",
				FogDensity:      0.0,
				FogColor:        "#FFFFFF",
				SoundEffects:    []string{"force_hum", "lightsaber_ignite", "temple_echo"],
			},
			SourceURL:       "https://starwars.fandom.com/wiki/Holocron",
			WookieepediaURL: "https://starwars.fandom.com/wiki/Holocron",
		},
		// Stealth Missions
		{
			Name:              "Infiltrate Imperial Base",
			Description:       "Sneak into an Imperial military base to steal classified plans. Avoid detection by stormtroopers and security systems.",
			ShortDescription:  "Infiltrate Imperial base undetected",
			Type:              "stealth",
			Category:          "side",
			Difficulty:        6,
			MinLevel:          12,
			MaxLevel:          25,
			EstimatedDuration: 35,
			Era:               "original",
			Planet:            "Scarif",
			Faction:           "rebel",
			Characters:        []string{"Jyn Erso", "Cassian Andor", "K-2SO"},
			RequiredLevel:     12,
			ExperienceReward:  450,
			CreditsReward:     1200,
			ItemRewards:       []string{"Imperial Plans", "Stealth Suit", "Security Codes"},
			IsActive:          true,
			IsRepeatable:      true,
			CooldownHours:     24,
			UnitySceneName:    "ImperialInfiltration",
			Environment3D: models.Environment3D{
				SkyboxTexture:   "/textures/skyboxes/scarif_base.jpg",
				AmbientColor:    "#336633",
				SunColor:        "#88CC88",
				SunIntensity:    1.1,
				TerrainType:     "tropical_base",
				TerrainTexture:  "/textures/terrain/tropical_ground.jpg",
				TerrainScale:    75.0,
				TerrainHeight:   30.0,
				WeatherType:     "humid",
				ParticleEffects: []string{"mist", "security_beams"],
				MusicTrack:      "rogue_one_theme",
				FogDensity:      0.3,
				FogColor:        "#669966",
				SoundEffects:    []string{"jungle_ambient", "imperial_comms", "alarm"],
			},
			SourceURL:       "https://starwars.fandom.com/wiki/Battle_of_Scarif",
			WookieepediaURL: "https://starwars.fandom.com/wiki/Battle_of_Scarif",
		},
	}

	// Create missions
	for i, mission := range missions {
		var existingMission models.Mission
		result := db.Where("name = ?", mission.Name).First(&existingMission)
		
		if result.Error == gorm.ErrRecordNotFound {
			// Mission doesn't exist, create it
			if err := db.Create(&mission).Error; err != nil {
				log.Printf("Error creating mission %s: %v", mission.Name, err)
				continue
			}
			log.Printf("Created mission: %s", mission.Name)
			
			// Create objectives for this mission
			if err := createObjectivesForMission(db, mission.ID, mission.Type); err != nil {
				log.Printf("Error creating objectives for mission %s: %v", mission.Name, err)
			}
		} else {
			log.Printf("Mission %s already exists, skipping", mission.Name)
		}
		
		// Update the mission ID for objectives creation
		missions[i].ID = existingMission.ID
		if existingMission.ID == 0 {
			// Get the ID of the newly created mission
			db.Where("name = ?", mission.Name).First(&missions[i])
		}
	}

	log.Println("Mission seeding completed")
	return nil
}

// createObjectivesForMission creates appropriate objectives based on mission type
func createObjectivesForMission(db *gorm.DB, missionID int, missionType string) error {
	var objectives []models.MissionObjective

	switch missionType {
	case "rescue":
		objectives = []models.MissionObjective{
			{
				MissionID:        missionID,
				Name:             "Infiltrate the facility",
				Description:      "Enter the detention center without being detected",
				Type:             "reach",
				Target:           "detention_center",
				TargetCount:      1,
				OrderIndex:       1,
				ExperienceReward: 100,
				CreditsReward:    200,
			},
			{
				MissionID:        missionID,
				Name:             "Locate the prisoner",
				Description:      "Find Princess Leia in the detention cells",
				Type:             "interact",
				Target:           "princess_leia",
				TargetCount:      1,
				OrderIndex:       2,
				ExperienceReward: 150,
				CreditsReward:    300,
			},
			{
				MissionID:        missionID,
				Name:             "Escape with the prisoner",
				Description:      "Safely escort Princess Leia to the escape point",
				Type:             "escort",
				Target:           "escape_point",
				TargetCount:      1,
				OrderIndex:       3,
				ExperienceReward: 250,
				CreditsReward:    500,
			},
		}
	case "combat":
		objectives = []models.MissionObjective{
			{
				MissionID:        missionID,
				Name:             "Destroy enemy fighters",
				Description:      "Eliminate TIE fighters defending the target",
				Type:             "kill",
				Target:           "tie_fighter",
				TargetCount:      10,
				OrderIndex:       1,
				ExperienceReward: 200,
				CreditsReward:    400,
			},
			{
				MissionID:        missionID,
				Name:             "Reach the target",
				Description:      "Navigate to the Death Star's weak point",
				Type:             "reach",
				Target:           "exhaust_port",
				TargetCount:      1,
				OrderIndex:       2,
				ExperienceReward: 300,
				CreditsReward:    600,
			},
			{
				MissionID:        missionID,
				Name:             "Destroy the target",
				Description:      "Fire proton torpedoes into the exhaust port",
				Type:             "interact",
				Target:           "exhaust_port",
				TargetCount:      1,
				OrderIndex:       3,
				ExperienceReward: 500,
				CreditsReward:    1500,
			},
		}
	case "exploration":
		objectives = []models.MissionObjective{
			{
				MissionID:        missionID,
				Name:             "Explore the area",
				Description:      "Discover 5 points of interest",
				Type:             "collect",
				Target:           "point_of_interest",
				TargetCount:      5,
				OrderIndex:       1,
				ExperienceReward: 50,
				CreditsReward:    100,
			},
			{
				MissionID:        missionID,
				Name:             "Collect resources",
				Description:      "Gather valuable materials from the environment",
				Type:             "collect",
				Target:           "resource_node",
				TargetCount:      3,
				OrderIndex:       2,
				ExperienceReward: 100,
				CreditsReward:    200,
			},
		}
	case "racing":
		objectives = []models.MissionObjective{
			{
				MissionID:        missionID,
				Name:             "Complete the race",
				Description:      "Finish the podrace in first place",
				Type:             "reach",
				Target:           "finish_line",
				TargetCount:      1,
				OrderIndex:       1,
				ExperienceReward: 400,
				CreditsReward:    1500,
			},
		}
	case "collection":
		objectives = []models.MissionObjective{
			{
				MissionID:        missionID,
				Name:             "Find holocrons",
				Description:      "Locate and collect ancient Jedi holocrons",
				Type:             "collect",
				Target:           "holocron",
				TargetCount:      3,
				OrderIndex:       1,
				ExperienceReward: 200,
				CreditsReward:    300,
			},
		}
	case "stealth":
		objectives = []models.MissionObjective{
			{
				MissionID:        missionID,
				Name:             "Avoid detection",
				Description:      "Infiltrate without triggering alarms",
				Type:             "survive",
				Target:           "stealth_mode",
				TargetCount:      1,
				OrderIndex:       1,
				ExperienceReward: 150,
				CreditsReward:    300,
			},
			{
				MissionID:        missionID,
				Name:             "Steal the plans",
				Description:      "Access the computer terminal and download data",
				Type:             "interact",
				Target:           "computer_terminal",
				TargetCount:      1,
				OrderIndex:       2,
				ExperienceReward: 300,
				CreditsReward:    900,
			},
		}
	}

	// Create all objectives
	for _, objective := range objectives {
		if err := db.Create(&objective).Error; err != nil {
			return err
		}
	}

	return nil
}
