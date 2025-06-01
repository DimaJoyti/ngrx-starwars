package database

import (
	"log"
	"starwars-api/models"

	"gorm.io/gorm"
)

// SeedGameData seeds the database with game-related data
func SeedGameData(db *gorm.DB) {
	log.Println("Seeding game data...")

	// Seed ship templates
	SeedShipTemplates(db)

	// Seed achievements
	SeedAchievements(db)

	// Seed resource conversions
	SeedResourceConversions(db)

	log.Println("Game data seeding completed")
}

// SeedShipTemplates creates ship templates for purchase
func SeedShipTemplates(db *gorm.DB) {
	var count int64
	db.Model(&models.ShipTemplate{}).Count(&count)

	if count > 0 {
		log.Println("Ship templates already exist, skipping seed")
		return
	}

	log.Println("Seeding ship templates...")

	templates := []models.ShipTemplate{
		// Rebel Alliance Ships
		{
			Name:            "T-65 X-wing",
			Class:           "Fighter",
			Faction:         "Rebel Alliance",
			Model:           "X-wing Starfighter",
			Description:     "The backbone of the Rebel Alliance fleet. Fast, maneuverable, and equipped with proton torpedoes.",
			BaseHealth:      100,
			BaseShield:      50,
			BaseAttack:      15,
			BaseDefense:     8,
			BaseSpeed:       75,
			BaseManeuver:    80,
			BaseEnergy:      100,
			BaseFuel:        100,
			Cost:            1500,
			MaintenanceCost: 15,
			IsAvailable:     true,
			RequiredLevel:   1,
			ModelPath:       "/models/ships/x-wing.glb",
			TexturePath:     "/textures/ships/x-wing.jpg",
			Scale:           1.0,
		},
		{
			Name:            "BTL Y-wing",
			Class:           "Bomber",
			Faction:         "Rebel Alliance",
			Model:           "Y-wing Starfighter",
			Description:     "A sturdy bomber with heavy armor and powerful weapons. Slower but more durable than fighters.",
			BaseHealth:      150,
			BaseShield:      30,
			BaseAttack:      20,
			BaseDefense:     12,
			BaseSpeed:       60,
			BaseManeuver:    50,
			BaseEnergy:      120,
			BaseFuel:        80,
			Cost:            2000,
			MaintenanceCost: 20,
			IsAvailable:     true,
			RequiredLevel:   3,
			ModelPath:       "/models/ships/y-wing.glb",
			TexturePath:     "/textures/ships/y-wing.jpg",
			Scale:           1.2,
		},
		{
			Name:            "RZ-1 A-wing",
			Class:           "Interceptor",
			Faction:         "Rebel Alliance",
			Model:           "A-wing Interceptor",
			Description:     "The fastest fighter in the Rebel fleet. Lightly armored but incredibly fast and maneuverable.",
			BaseHealth:      80,
			BaseShield:      40,
			BaseAttack:      12,
			BaseDefense:     6,
			BaseSpeed:       95,
			BaseManeuver:    90,
			BaseEnergy:      90,
			BaseFuel:        110,
			Cost:            2500,
			MaintenanceCost: 25,
			IsAvailable:     true,
			RequiredLevel:   5,
			ModelPath:       "/models/ships/a-wing.glb",
			TexturePath:     "/textures/ships/a-wing.jpg",
			Scale:           0.8,
		},
		// Imperial Ships
		{
			Name:            "TIE/ln Fighter",
			Class:           "Fighter",
			Faction:         "Galactic Empire",
			Model:           "TIE Fighter",
			Description:     "The standard Imperial fighter. Fast and cheap, but lacks shields and heavy armor.",
			BaseHealth:      60,
			BaseShield:      0,
			BaseAttack:      14,
			BaseDefense:     4,
			BaseSpeed:       85,
			BaseManeuver:    85,
			BaseEnergy:      80,
			BaseFuel:        60,
			Cost:            800,
			MaintenanceCost: 8,
			IsAvailable:     true,
			RequiredLevel:   1,
			ModelPath:       "/models/ships/tie-fighter.glb",
			TexturePath:     "/textures/ships/tie-fighter.jpg",
			Scale:           0.9,
		},
		{
			Name:            "TIE/IN Interceptor",
			Class:           "Interceptor",
			Faction:         "Galactic Empire",
			Model:           "TIE Interceptor",
			Description:     "An advanced TIE fighter with improved speed and firepower. Still lacks shields.",
			BaseHealth:      70,
			BaseShield:      0,
			BaseAttack:      18,
			BaseDefense:     5,
			BaseSpeed:       90,
			BaseManeuver:    88,
			BaseEnergy:      85,
			BaseFuel:        65,
			Cost:            1200,
			MaintenanceCost: 12,
			IsAvailable:     true,
			RequiredLevel:   4,
			ModelPath:       "/models/ships/tie-interceptor.glb",
			TexturePath:     "/textures/ships/tie-interceptor.jpg",
			Scale:           0.9,
		},
		{
			Name:            "TIE/sa Bomber",
			Class:           "Bomber",
			Faction:         "Galactic Empire",
			Model:           "TIE Bomber",
			Description:     "Imperial bomber with heavy ordnance capacity. Slow but devastating against capital ships.",
			BaseHealth:      120,
			BaseShield:      0,
			BaseAttack:      25,
			BaseDefense:     10,
			BaseSpeed:       50,
			BaseManeuver:    40,
			BaseEnergy:      100,
			BaseFuel:        70,
			Cost:            1800,
			MaintenanceCost: 18,
			IsAvailable:     true,
			RequiredLevel:   6,
			ModelPath:       "/models/ships/tie-bomber.glb",
			TexturePath:     "/textures/ships/tie-bomber.jpg",
			Scale:           1.1,
		},
		// Freighters and Transports
		{
			Name:            "YT-1300 Light Freighter",
			Class:           "Freighter",
			Faction:         "Civilian",
			Model:           "Corellian Light Freighter",
			Description:     "A versatile light freighter. Not built for combat but can be heavily modified.",
			BaseHealth:      200,
			BaseShield:      80,
			BaseAttack:      10,
			BaseDefense:     15,
			BaseSpeed:       65,
			BaseManeuver:    60,
			BaseEnergy:      150,
			BaseFuel:        200,
			Cost:            5000,
			MaintenanceCost: 50,
			IsAvailable:     true,
			RequiredLevel:   8,
			ModelPath:       "/models/ships/yt-1300.glb",
			TexturePath:     "/textures/ships/yt-1300.jpg",
			Scale:           1.5,
		},
		// Prequel Era Ships
		{
			Name:            "Delta-7 Aethersprite",
			Class:           "Fighter",
			Faction:         "Galactic Republic",
			Model:           "Jedi Starfighter",
			Description:     "A Jedi starfighter designed for Force-sensitive pilots. Highly maneuverable.",
			BaseHealth:      90,
			BaseShield:      60,
			BaseAttack:      16,
			BaseDefense:     7,
			BaseSpeed:       80,
			BaseManeuver:    95,
			BaseEnergy:      110,
			BaseFuel:        90,
			Cost:            3000,
			MaintenanceCost: 30,
			IsAvailable:     true,
			RequiredLevel:   7,
			ModelPath:       "/models/ships/delta-7.glb",
			TexturePath:     "/textures/ships/delta-7.jpg",
			Scale:           0.8,
		},
		{
			Name:            "ARC-170 Starfighter",
			Class:           "Heavy Fighter",
			Faction:         "Galactic Republic",
			Model:           "ARC-170",
			Description:     "A heavy fighter used by clone pilots. Well-armed and armored for long missions.",
			BaseHealth:      140,
			BaseShield:      70,
			BaseAttack:      22,
			BaseDefense:     11,
			BaseSpeed:       70,
			BaseManeuver:    65,
			BaseEnergy:      130,
			BaseFuel:        120,
			Cost:            3500,
			MaintenanceCost: 35,
			IsAvailable:     true,
			RequiredLevel:   9,
			ModelPath:       "/models/ships/arc-170.glb",
			TexturePath:     "/textures/ships/arc-170.jpg",
			Scale:           1.3,
		},
		// Sequel Era Ships
		{
			Name:            "T-70 X-wing",
			Class:           "Fighter",
			Faction:         "Resistance",
			Model:           "T-70 X-wing",
			Description:     "An updated version of the classic X-wing with improved systems and firepower.",
			BaseHealth:      110,
			BaseShield:      60,
			BaseAttack:      18,
			BaseDefense:     9,
			BaseSpeed:       78,
			BaseManeuver:    82,
			BaseEnergy:      105,
			BaseFuel:        105,
			Cost:            4000,
			MaintenanceCost: 40,
			IsAvailable:     true,
			RequiredLevel:   10,
			ModelPath:       "/models/ships/t-70-x-wing.glb",
			TexturePath:     "/textures/ships/t-70-x-wing.jpg",
			Scale:           1.0,
		},
		{
			Name:            "TIE/fo Fighter",
			Class:           "Fighter",
			Faction:         "First Order",
			Model:           "First Order TIE Fighter",
			Description:     "An improved TIE fighter with better armor and life support systems.",
			BaseHealth:      75,
			BaseShield:      20,
			BaseAttack:      16,
			BaseDefense:     6,
			BaseSpeed:       87,
			BaseManeuver:    86,
			BaseEnergy:      85,
			BaseFuel:        70,
			Cost:            1500,
			MaintenanceCost: 15,
			IsAvailable:     true,
			RequiredLevel:   5,
			ModelPath:       "/models/ships/tie-fo.glb",
			TexturePath:     "/textures/ships/tie-fo.jpg",
			Scale:           0.9,
		},
	}

	for _, template := range templates {
		if err := db.Create(&template).Error; err != nil {
			log.Printf("Error creating ship template %s: %v", template.Name, err)
		} else {
			log.Printf("Created ship template: %s", template.Name)
		}
	}

	log.Println("Ship templates seeded successfully")
}

// SeedAchievements creates initial achievements
func SeedAchievements(db *gorm.DB) {
	var count int64
	db.Model(&models.Achievement{}).Count(&count)

	if count > 0 {
		log.Println("Achievements already exist, skipping seed")
		return
	}

	log.Println("Seeding achievements...")

	achievements := []models.Achievement{
		// Combat Achievements
		{
			Name:             "first_blood",
			Title:            "First Blood",
			Description:      "Win your first battle",
			Category:         "combat",
			Type:             "boolean",
			Target:           1,
			Condition:        "win_battle",
			Difficulty:       "easy",
			Points:           10,
			CreditsReward:    100,
			ExperienceReward: 50,
			Icon:             "/icons/achievements/first_blood.png",
			Color:            "#FF4444",
			Rarity:           "common",
			IsActive:         true,
		},
		{
			Name:             "ace_pilot",
			Title:            "Ace Pilot",
			Description:      "Win 10 battles",
			Category:         "combat",
			Type:             "count",
			Target:           10,
			Condition:        "win_battle",
			Difficulty:       "medium",
			Points:           50,
			CreditsReward:    500,
			ExperienceReward: 250,
			Icon:             "/icons/achievements/ace_pilot.png",
			Color:            "#FF8800",
			Rarity:           "rare",
			IsActive:         true,
		},
		{
			Name:             "fleet_commander",
			Title:            "Fleet Commander",
			Description:      "Win 100 battles",
			Category:         "combat",
			Type:             "count",
			Target:           100,
			Condition:        "win_battle",
			Difficulty:       "hard",
			Points:           200,
			CreditsReward:    2000,
			ExperienceReward: 1000,
			Icon:             "/icons/achievements/fleet_commander.png",
			Color:            "#8800FF",
			Rarity:           "epic",
			IsActive:         true,
		},
		// Collection Achievements
		{
			Name:             "ship_collector",
			Title:            "Ship Collector",
			Description:      "Own 5 different ships",
			Category:         "collection",
			Type:             "count",
			Target:           5,
			Condition:        "own_ships",
			Difficulty:       "easy",
			Points:           25,
			CreditsReward:    250,
			ExperienceReward: 100,
			Icon:             "/icons/achievements/ship_collector.png",
			Color:            "#4488FF",
			Rarity:           "common",
			IsActive:         true,
		},
		{
			Name:             "fleet_admiral",
			Title:            "Fleet Admiral",
			Description:      "Own 20 different ships",
			Category:         "collection",
			Type:             "count",
			Target:           20,
			Condition:        "own_ships",
			Difficulty:       "hard",
			Points:           100,
			CreditsReward:    1000,
			ExperienceReward: 500,
			Icon:             "/icons/achievements/fleet_admiral.png",
			Color:            "#FF8800",
			Rarity:           "epic",
			IsActive:         true,
		},
		// Progression Achievements
		{
			Name:             "padawan",
			Title:            "Padawan",
			Description:      "Reach level 10",
			Category:         "progression",
			Type:             "milestone",
			Target:           10,
			Condition:        "player_level",
			Difficulty:       "easy",
			Points:           20,
			CreditsReward:    200,
			ExperienceReward: 100,
			Icon:             "/icons/achievements/padawan.png",
			Color:            "#00FF00",
			Rarity:           "common",
			IsActive:         true,
		},
		{
			Name:             "jedi_knight",
			Title:            "Jedi Knight",
			Description:      "Reach level 25",
			Category:         "progression",
			Type:             "milestone",
			Target:           25,
			Condition:        "player_level",
			Difficulty:       "medium",
			Points:           50,
			CreditsReward:    500,
			ExperienceReward: 250,
			Icon:             "/icons/achievements/jedi_knight.png",
			Color:            "#0088FF",
			Rarity:           "rare",
			IsActive:         true,
		},
		{
			Name:             "jedi_master",
			Title:            "Jedi Master",
			Description:      "Reach level 50",
			Category:         "progression",
			Type:             "milestone",
			Target:           50,
			Condition:        "player_level",
			Difficulty:       "hard",
			Points:           150,
			CreditsReward:    1500,
			ExperienceReward: 750,
			Icon:             "/icons/achievements/jedi_master.png",
			Color:            "#8800FF",
			Rarity:           "epic",
			IsActive:         true,
		},
		// Exploration Achievements
		{
			Name:             "explorer",
			Title:            "Explorer",
			Description:      "Complete 5 exploration missions",
			Category:         "exploration",
			Type:             "count",
			Target:           5,
			Condition:        "complete_exploration_mission",
			Difficulty:       "easy",
			Points:           15,
			CreditsReward:    150,
			ExperienceReward: 75,
			Icon:             "/icons/achievements/explorer.png",
			Color:            "#00FF88",
			Rarity:           "common",
			IsActive:         true,
		},
		{
			Name:             "galactic_wanderer",
			Title:            "Galactic Wanderer",
			Description:      "Complete 25 exploration missions",
			Category:         "exploration",
			Type:             "count",
			Target:           25,
			Condition:        "complete_exploration_mission",
			Difficulty:       "medium",
			Points:           75,
			CreditsReward:    750,
			ExperienceReward: 375,
			Icon:             "/icons/achievements/galactic_wanderer.png",
			Color:            "#FF8800",
			Rarity:           "rare",
			IsActive:         true,
		},
	}

	for _, achievement := range achievements {
		if err := db.Create(&achievement).Error; err != nil {
			log.Printf("Error creating achievement %s: %v", achievement.Name, err)
		} else {
			log.Printf("Created achievement: %s", achievement.Title)
		}
	}

	log.Println("Achievements seeded successfully")
}

// SeedResourceConversions creates resource conversion options
func SeedResourceConversions(db *gorm.DB) {
	var count int64
	db.Model(&models.ResourceConversion{}).Count(&count)

	if count > 0 {
		log.Println("Resource conversions already exist, skipping seed")
		return
	}

	log.Println("Seeding resource conversions...")

	conversions := []models.ResourceConversion{
		{
			Name:             "Credits to Durasteel",
			Description:      "Convert credits to durasteel for ship construction",
			FromResourceType: "credits",
			FromAmount:       100,
			ToResourceType:   "durasteel",
			ToAmount:         10,
			IsActive:         true,
			RequiredLevel:    1,
			ConversionFee:    10,
		},
		{
			Name:             "Credits to Tibanna",
			Description:      "Convert credits to tibanna gas for weapons",
			FromResourceType: "credits",
			FromAmount:       150,
			ToResourceType:   "tibanna",
			ToAmount:         5,
			IsActive:         true,
			RequiredLevel:    3,
			ConversionFee:    15,
		},
		{
			Name:             "Durasteel to Transparisteel",
			Description:      "Refine durasteel into transparisteel",
			FromResourceType: "durasteel",
			FromAmount:       20,
			ToResourceType:   "transparisteel",
			ToAmount:         5,
			IsActive:         true,
			RequiredLevel:    5,
			ConversionFee:    50,
		},
		{
			Name:             "Crystals to Kyber",
			Description:      "Convert premium crystals to rare kyber crystals",
			FromResourceType: "crystals",
			FromAmount:       10,
			ToResourceType:   "kyber",
			ToAmount:         1,
			IsActive:         true,
			RequiredLevel:    10,
			ConversionFee:    0,
		},
	}

	for _, conversion := range conversions {
		if err := db.Create(&conversion).Error; err != nil {
			log.Printf("Error creating resource conversion %s: %v", conversion.Name, err)
		} else {
			log.Printf("Created resource conversion: %s", conversion.Name)
		}
	}

	log.Println("Resource conversions seeded successfully")
}
