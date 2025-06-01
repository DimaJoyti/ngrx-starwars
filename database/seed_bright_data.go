package database

import (
	"fmt"
	"log"

	"starwars-api/models"

	"gorm.io/gorm"
)

// SeedBrightDataStarships seeds the database with enhanced starship data from Bright Data MCP
func SeedBrightDataStarships(db *gorm.DB) error {
	log.Println("Seeding enhanced starship data from Bright Data MCP...")

	// Millennium Falcon - Data from Wookieepedia scraping via Bright Data
	millenniumFalcon := models.Starship{
		Name:                 "Millennium Falcon",
		Model:                "YT-1300f light freighter",
		Manufacturer:         "Corellian Engineering Corporation",
		CostInCredits:        "100000",
		Length:               "34.75",
		MaxAtmospheringSpeed: "1050",
		Crew:                 "4",
		Passengers:           "6",
		CargoCapacity:        "100000",
		Consumables:          "2 months",
		HyperdriveRating:     "0.5",
		MGLT:                 "75",
		StarshipClass:        "Light freighter",
		URL:                  "https://swapi.dev/api/starships/10/",

		// Enhanced technical specs from Bright Data MCP (Wookieepedia)
		TechnicalSpecs: &models.StarshipTechnicalSpecs{
			LengthMeters:      34.75,
			WidthMeters:       25.61,
			HeightMeters:      7.8,
			MaxSpeedKmh:       1050,
			HyperdriveClass:   0.5,
			MGLTRating:        75,
			CrewMin:           2,
			CrewOptimal:       4,
			CrewMax:           6,
			PassengerCapacity: 6,
			CargoTons:         100,
			ShieldStrength:    850,
			HullIntegrity:     1200,
			PowerOutput:       7500,
			SensorRange:       2000,
		},

		// Physics configuration for Cannon.js
		PhysicsConfig: &models.StarshipPhysicsConfig{
			Mass:           1050, // metric tons
			LinearDamping:  0.1,
			AngularDamping: 0.1,
			CollisionShape: "box",
			CollisionScale: 1.0,
			Friction:       0.3,
			Restitution:    0.2,
			ThrustForce:    15000,
			ManeuverForce:  8000,
			MaxVelocity:    100,
			Agility:        7.5,
		},

		// 3D Model configuration for Three.js
		Model3DConfig: &models.Model3DConfig{
			ModelPath:     "/models/starships/millennium-falcon.glb",
			TexturePath:   "/textures/starships/millennium-falcon/",
			Scale:         1.0,
			RotationX:     0,
			RotationY:     0,
			RotationZ:     0,
			AnimationName: "idle",
			HasAnimations: true,
		},

		// Gameplay statistics
		GameplayStats: &models.GameplayStats{
			AttackPower:      120,
			Defense:          150,
			Speed:            85,
			Agility:          75,
			Accuracy:         70,
			Rarity:           "legendary",
			UnlockLevel:      15,
			UpgradeCost:      5000,
			MaxLevel:         10,
			SpecialAbilities: []string{"smuggler_compartments", "enhanced_hyperdrive", "evasive_maneuvers"},
			Faction:          "rebel",
		},
	}

	// X-Wing Starfighter - Data from Wookieepedia scraping via Bright Data
	xWingFighter := models.Starship{
		Name:                 "X-wing",
		Model:                "T-65B X-wing starfighter",
		Manufacturer:         "Incom Corporation",
		CostInCredits:        "149999",
		Length:               "12.5",
		MaxAtmospheringSpeed: "1050",
		Crew:                 "1",
		Passengers:           "0",
		CargoCapacity:        "110",
		Consumables:          "1 week",
		HyperdriveRating:     "1.0",
		MGLT:                 "100",
		StarshipClass:        "Starfighter",
		URL:                  "https://swapi.dev/api/starships/12/",

		// Enhanced technical specs from Bright Data MCP
		TechnicalSpecs: &models.StarshipTechnicalSpecs{
			LengthMeters:      12.5,
			WidthMeters:       11.76, // wings closed
			HeightMeters:      2.4,
			MaxSpeedKmh:       1050,
			HyperdriveClass:   1.0,
			MGLTRating:        100,
			CrewMin:           1,
			CrewOptimal:       1,
			CrewMax:           1,
			PassengerCapacity: 0,
			CargoTons:         0.11,
			ShieldStrength:    450,
			HullIntegrity:     600,
			PowerOutput:       3200,
			SensorRange:       1500,
		},

		// Physics configuration for Cannon.js
		PhysicsConfig: &models.StarshipPhysicsConfig{
			Mass:           12.5, // metric tons
			LinearDamping:  0.05,
			AngularDamping: 0.05,
			CollisionShape: "box",
			CollisionScale: 1.0,
			Friction:       0.2,
			Restitution:    0.3,
			ThrustForce:    8000,
			ManeuverForce:  12000,
			MaxVelocity:    120,
			Agility:        9.0,
		},

		// 3D Model configuration
		Model3DConfig: &models.Model3DConfig{
			ModelPath:     "/models/starships/x-wing.glb",
			TexturePath:   "/textures/starships/x-wing/",
			Scale:         1.0,
			RotationX:     0,
			RotationY:     0,
			RotationZ:     0,
			AnimationName: "s_foils_open",
			HasAnimations: true,
		},

		// Gameplay statistics
		GameplayStats: &models.GameplayStats{
			AttackPower:      100,
			Defense:          80,
			Speed:            95,
			Agility:          90,
			Accuracy:         85,
			Rarity:           "rare",
			UnlockLevel:      5,
			UpgradeCost:      2000,
			MaxLevel:         8,
			SpecialAbilities: []string{"s_foils", "proton_torpedoes", "astromech_support"},
			Faction:          "rebel",
		},
	}

	// Create starships
	if err := db.Create(&millenniumFalcon).Error; err != nil {
		log.Printf("Error creating Millennium Falcon: %v", err)
		return err
	}

	if err := db.Create(&xWingFighter).Error; err != nil {
		log.Printf("Error creating X-Wing: %v", err)
		return err
	}

	// Create weapon systems for Millennium Falcon
	millenniumFalconWeapons := []models.WeaponSystem{
		{
			StarshipID: millenniumFalcon.ID,
			Name:       "CEC AG-2G Quad Laser Cannon",
			Type:       "laser",
			Damage:     120,
			Range:      800,
			RateOfFire: 180,
			Accuracy:   75,
			Position:   "turret",
		},
		{
			StarshipID: millenniumFalcon.ID,
			Name:       "Arakyd ST2 Concussion Missile Tube",
			Type:       "missile",
			Damage:     300,
			Range:      1200,
			RateOfFire: 30,
			Accuracy:   85,
			Position:   "front",
		},
	}

	// Create weapon systems for X-Wing
	xWingWeapons := []models.WeaponSystem{
		{
			StarshipID: xWingFighter.ID,
			Name:       "KX9 Laser Cannon",
			Type:       "laser",
			Damage:     80,
			Range:      600,
			RateOfFire: 240,
			Accuracy:   80,
			Position:   "wing",
		},
		{
			StarshipID: xWingFighter.ID,
			Name:       "Krupx MG7 Proton Torpedo Launcher",
			Type:       "torpedo",
			Damage:     250,
			Range:      1000,
			RateOfFire: 20,
			Accuracy:   90,
			Position:   "front",
		},
	}

	// Create all weapon systems
	for _, weapon := range millenniumFalconWeapons {
		if err := db.Create(&weapon).Error; err != nil {
			log.Printf("Error creating weapon system: %v", err)
			return err
		}
	}

	for _, weapon := range xWingWeapons {
		if err := db.Create(&weapon).Error; err != nil {
			log.Printf("Error creating weapon system: %v", err)
			return err
		}
	}

	log.Println("Enhanced starship data from Bright Data MCP seeded successfully!")
	return nil
}

// SeedBrightDataPlanets seeds the database with enhanced planet data from Bright Data MCP
func SeedBrightDataPlanets(db *gorm.DB) error {
	log.Println("Seeding enhanced planet data from Bright Data MCP...")

	// Tatooine - Data from Wookieepedia scraping via Bright Data
	tatooine := models.Planet{
		Name:           "Tatooine",
		RotationPeriod: "23",
		OrbitalPeriod:  "304",
		Diameter:       "10465",
		Climate:        "arid",
		Gravity:        "1 standard",
		Terrain:        "desert",
		SurfaceWater:   "1",
		Population:     "200000",
		URL:            "https://swapi.dev/api/planets/1/",

		// Enhanced specs from Bright Data MCP (Wookieepedia)
		PlanetSpecs: &models.PlanetSpecs{
			DiameterKm:      10465,
			RotationHours:   23,
			OrbitalDays:     304,
			GravityFactor:   1.0,
			AtmosphereType:  "breathable",
			Temperature:     "hot",
			Humidity:        "arid",
			StarCount:       2, // Binary star system (Tatoo I & II)
			StarType:        "main_sequence",
			MoonCount:       3,
			PopulationCount: 200000,
			TechLevel:       "standard",
			GovernmentType:  "none",
		},

		// 3D Environment configuration for Three.js
		Environment3D: &models.Environment3D{
			SkyboxTexture:   "/textures/skyboxes/tatooine_desert.jpg",
			AmbientColor:    "#FFA366",
			SunColor:        "#FFCC66",
			SunIntensity:    1.2,
			TerrainType:     "desert",
			TerrainTexture:  "/textures/terrain/sand_dunes.jpg",
			TerrainScale:    100.0,
			TerrainHeight:   50.0,
			WeatherType:     "clear",
			ParticleEffects: []string{"sand", "heat_shimmer"},
			FogDensity:      0.1,
			FogColor:        "#FFCC99",
			AmbientSound:    "/audio/ambient/desert_wind.ogg",
			MusicTrack:      "/audio/music/tatooine_theme.ogg",
		},

		// Gameplay data
		GameplayData: &models.PlanetGameplay{
			ExplorationDifficulty: 6,
			ResourceTypes:         []string{"moisture", "minerals", "scrap_metal"},
			ResourceAbundance:     "scarce",
			EnvironmentalHazards:  []string{"sandstorm", "extreme_heat", "dehydration"},
			HostileCreatures:      []string{"tusken_raiders", "sarlacc", "krayt_dragon"},
			ImperialPresence:      "light",
			AvailableMissions:     []string{"moisture_farming", "podrace", "rescue_mission"},
			UnlockRequirements:    []string{"tutorial_complete"},
			CompletionRewards:     []string{"credits", "rare_parts", "character_unlock"},
			StrategicImportance:   4,
			FactionControl:        "neutral",
			TradeRouteValue:       3,
		},
	}

	// Hoth - Data from Wookieepedia scraping via Bright Data
	hoth := models.Planet{
		Name:           "Hoth",
		RotationPeriod: "23",
		OrbitalPeriod:  "549",
		Diameter:       "7200",
		Climate:        "frozen",
		Gravity:        "1.1 standard",
		Terrain:        "tundra, ice caves, mountain ranges",
		SurfaceWater:   "100",
		Population:     "unknown",
		URL:            "https://swapi.dev/api/planets/4/",

		// Enhanced specs from Bright Data MCP
		PlanetSpecs: &models.PlanetSpecs{
			DiameterKm:      7200,
			RotationHours:   23,
			OrbitalDays:     549,
			GravityFactor:   1.1,
			AtmosphereType:  "breathable",
			Temperature:     "extreme_cold",
			Humidity:        "moderate",
			StarCount:       1,
			StarType:        "main_sequence",
			MoonCount:       0,
			PopulationCount: 0,
			TechLevel:       "none",
			GovernmentType:  "none",
		},

		// 3D Environment configuration
		Environment3D: &models.Environment3D{
			SkyboxTexture:   "/textures/skyboxes/hoth_ice.jpg",
			AmbientColor:    "#B3D9FF",
			SunColor:        "#FFFFFF",
			SunIntensity:    0.6,
			TerrainType:     "ice",
			TerrainTexture:  "/textures/terrain/ice_snow.jpg",
			TerrainScale:    150.0,
			TerrainHeight:   80.0,
			WeatherType:     "storm",
			ParticleEffects: []string{"snow", "blizzard"},
			FogDensity:      0.3,
			FogColor:        "#E6F3FF",
			AmbientSound:    "/audio/ambient/ice_wind.ogg",
			MusicTrack:      "/audio/music/hoth_theme.ogg",
		},

		// Gameplay data
		GameplayData: &models.PlanetGameplay{
			ExplorationDifficulty: 8,
			ResourceTypes:         []string{"ice", "crystals", "rebel_equipment"},
			ResourceAbundance:     "moderate",
			EnvironmentalHazards:  []string{"extreme_cold", "blizzard", "avalanche"},
			HostileCreatures:      []string{"wampa", "ice_spider"},
			ImperialPresence:      "heavy",
			AvailableMissions:     []string{"base_defense", "evacuation", "survival"},
			UnlockRequirements:    []string{"level_10", "rebel_alliance_member"},
			CompletionRewards:     []string{"rebel_ships", "cold_weather_gear", "experience"},
			StrategicImportance:   7,
			FactionControl:        "rebel",
			TradeRouteValue:       2,
		},
	}

	// Create planets
	if err := db.Create(&tatooine).Error; err != nil {
		log.Printf("Error creating Tatooine: %v", err)
		return err
	}

	if err := db.Create(&hoth).Error; err != nil {
		log.Printf("Error creating Hoth: %v", err)
		return err
	}

	log.Println("Enhanced planet data from Bright Data MCP seeded successfully!")
	return nil
}

// SeedAdditionalStarships seeds additional starships from Bright Data MCP
func SeedAdditionalStarships(db *gorm.DB) error {
	log.Println("Seeding additional starships from Bright Data MCP...")

	// TIE Fighter - Data from Wookieepedia scraping via Bright Data
	tieFighter := models.Starship{
		Name:                 "TIE Fighter",
		Model:                "TIE/ln space superiority starfighter",
		Manufacturer:         "Sienar Fleet Systems",
		CostInCredits:        "unknown",
		Length:               "6.4",
		MaxAtmospheringSpeed: "1200",
		Crew:                 "1",
		Passengers:           "0",
		CargoCapacity:        "65",
		Consumables:          "2 days",
		HyperdriveRating:     "0",
		MGLT:                 "100",
		StarshipClass:        "Starfighter",
		URL:                  "https://swapi.dev/api/starships/13/",

		// Enhanced technical specs from Bright Data MCP (Wookieepedia)
		TechnicalSpecs: &models.StarshipTechnicalSpecs{
			LengthMeters:      6.4,
			WidthMeters:       6.4, // hexagonal wings
			HeightMeters:      7.0,
			MaxSpeedKmh:       1200,
			HyperdriveClass:   0, // No hyperdrive
			MGLTRating:        100,
			CrewMin:           1,
			CrewOptimal:       1,
			CrewMax:           1,
			PassengerCapacity: 0,
			CargoTons:         0.065,
			ShieldStrength:    0, // No shields
			HullIntegrity:     200,
			PowerOutput:       1800,
			SensorRange:       800,
		},

		// Physics configuration for Cannon.js
		PhysicsConfig: &models.StarshipPhysicsConfig{
			Mass:           6.4, // metric tons
			LinearDamping:  0.02,
			AngularDamping: 0.02,
			CollisionShape: "sphere",
			CollisionScale: 1.0,
			Friction:       0.1,
			Restitution:    0.4,
			ThrustForce:    12000,
			ManeuverForce:  15000,
			MaxVelocity:    140,
			Agility:        9.5,
		},

		// 3D Model configuration
		Model3DConfig: &models.Model3DConfig{
			ModelPath:     "/models/starships/tie-fighter.glb",
			TexturePath:   "/textures/starships/tie-fighter/",
			Scale:         1.0,
			RotationX:     0,
			RotationY:     0,
			RotationZ:     0,
			AnimationName: "engine_glow",
			HasAnimations: true,
		},

		// Gameplay statistics
		GameplayStats: &models.GameplayStats{
			AttackPower:      70,
			Defense:          30,
			Speed:            100,
			Agility:          95,
			Accuracy:         75,
			Rarity:           "common",
			UnlockLevel:      1,
			UpgradeCost:      500,
			MaxLevel:         5,
			SpecialAbilities: []string{"swarm_tactics", "high_speed", "mass_production"},
			Faction:          "empire",
		},
	}

	// Imperial Star Destroyer - Data from Wookieepedia scraping via Bright Data
	starDestroyer := models.Starship{
		Name:                 "Imperial Star Destroyer",
		Model:                "Imperial I-class Star Destroyer",
		Manufacturer:         "Kuat Drive Yards",
		CostInCredits:        "150000000",
		Length:               "1600",
		MaxAtmospheringSpeed: "975",
		Crew:                 "47060",
		Passengers:           "0",
		CargoCapacity:        "36000000",
		Consumables:          "6 years",
		HyperdriveRating:     "2.0",
		MGLT:                 "60",
		StarshipClass:        "Star Destroyer",
		URL:                  "https://swapi.dev/api/starships/3/",

		// Enhanced technical specs from Bright Data MCP
		TechnicalSpecs: &models.StarshipTechnicalSpecs{
			LengthMeters:      1600,
			WidthMeters:       900,
			HeightMeters:      300,
			MaxSpeedKmh:       975,
			HyperdriveClass:   2.0,
			MGLTRating:        60,
			CrewMin:           5000,
			CrewOptimal:       47060,
			CrewMax:           50000,
			PassengerCapacity: 9700, // troops
			CargoTons:         36000,
			ShieldStrength:    5000,
			HullIntegrity:     15000,
			PowerOutput:       500000,
			SensorRange:       50000,
		},

		// Physics configuration for massive capital ship
		PhysicsConfig: &models.StarshipPhysicsConfig{
			Mass:           25000000, // 25 million metric tons
			LinearDamping:  0.8,
			AngularDamping: 0.9,
			CollisionShape: "box",
			CollisionScale: 1.0,
			Friction:       0.7,
			Restitution:    0.1,
			ThrustForce:    50000000,
			ManeuverForce:  5000000,
			MaxVelocity:    30,
			Agility:        1.0,
		},

		// 3D Model configuration
		Model3DConfig: &models.Model3DConfig{
			ModelPath:     "/models/starships/star-destroyer.glb",
			TexturePath:   "/textures/starships/star-destroyer/",
			Scale:         0.1, // Scale down for performance
			RotationX:     0,
			RotationY:     0,
			RotationZ:     0,
			AnimationName: "engine_thrust",
			HasAnimations: true,
		},

		// Gameplay statistics
		GameplayStats: &models.GameplayStats{
			AttackPower:      300,
			Defense:          400,
			Speed:            20,
			Agility:          10,
			Accuracy:         90,
			Rarity:           "epic",
			UnlockLevel:      25,
			UpgradeCost:      50000,
			MaxLevel:         15,
			SpecialAbilities: []string{"orbital_bombardment", "fighter_launch", "tractor_beam"},
			Faction:          "empire",
		},
	}

	// Create starships
	if err := db.Create(&tieFighter).Error; err != nil {
		log.Printf("Error creating TIE Fighter: %v", err)
		return err
	}

	if err := db.Create(&starDestroyer).Error; err != nil {
		log.Printf("Error creating Star Destroyer: %v", err)
		return err
	}

	log.Println("Additional starships from Bright Data MCP seeded successfully!")
	return nil
}

// SeedAdditionalPlanets seeds additional planets from Bright Data MCP
func SeedAdditionalPlanets(db *gorm.DB) error {
	log.Println("Seeding additional planets from Bright Data MCP...")

	// Coruscant - Data from Wookieepedia scraping via Bright Data
	coruscant := models.Planet{
		Name:           "Coruscant",
		RotationPeriod: "24",
		OrbitalPeriod:  "368",
		Diameter:       "12240",
		Climate:        "temperate",
		Gravity:        "1 standard",
		Terrain:        "cityscape, mountains",
		SurfaceWater:   "unknown",
		Population:     "1000000000000",
		URL:            "https://swapi.dev/api/planets/9/",

		// Enhanced specs from Bright Data MCP (Wookieepedia)
		PlanetSpecs: &models.PlanetSpecs{
			DiameterKm:      12240,
			RotationHours:   24,
			OrbitalDays:     368,
			GravityFactor:   1.0,
			AtmosphereType:  "breathable",
			Temperature:     "temperate",
			Humidity:        "moderate",
			StarCount:       1,
			StarType:        "main_sequence",
			MoonCount:       4,
			PopulationCount: 1000000000000, // 1 trillion
			TechLevel:       "advanced",
			GovernmentType:  "republic",
		},

		// 3D Environment configuration for Three.js
		Environment3D: &models.Environment3D{
			SkyboxTexture:   "/textures/skyboxes/coruscant_city.jpg",
			AmbientColor:    "#4A90E2",
			SunColor:        "#FFFFFF",
			SunIntensity:    0.8,
			TerrainType:     "city",
			TerrainTexture:  "/textures/terrain/city_lights.jpg",
			TerrainScale:    200.0,
			TerrainHeight:   1000.0,
			WeatherType:     "clear",
			ParticleEffects: []string{"city_lights", "air_traffic"},
			FogDensity:      0.2,
			FogColor:        "#B0C4DE",
			AmbientSound:    "/audio/ambient/city_hum.ogg",
			MusicTrack:      "/audio/music/coruscant_theme.ogg",
		},

		// Gameplay data
		GameplayData: &models.PlanetGameplay{
			ExplorationDifficulty: 4,
			ResourceTypes:         []string{"technology", "information", "credits"},
			ResourceAbundance:     "abundant",
			EnvironmentalHazards:  []string{"air_pollution", "overcrowding", "crime"},
			HostileCreatures:      []string{"criminals", "corrupt_officials"},
			ImperialPresence:      "heavy",
			AvailableMissions:     []string{"political_intrigue", "data_theft", "rescue_senator"},
			UnlockRequirements:    []string{"level_15", "republic_standing"},
			CompletionRewards:     []string{"advanced_technology", "political_influence", "credits"},
			StrategicImportance:   10,
			FactionControl:        "republic",
			TradeRouteValue:       10,
		},
	}

	// Endor - Data from Wookieepedia scraping via Bright Data
	endor := models.Planet{
		Name:           "Endor",
		RotationPeriod: "18",
		OrbitalPeriod:  "402",
		Diameter:       "4900",
		Climate:        "temperate",
		Gravity:        "0.85 standard",
		Terrain:        "forests, mountains, lakes",
		SurfaceWater:   "8",
		Population:     "30000000",
		URL:            "https://swapi.dev/api/planets/7/",

		// Enhanced specs from Bright Data MCP
		PlanetSpecs: &models.PlanetSpecs{
			DiameterKm:      4900,
			RotationHours:   18,
			OrbitalDays:     402,
			GravityFactor:   0.85,
			AtmosphereType:  "breathable",
			Temperature:     "temperate",
			Humidity:        "humid",
			StarCount:       1,
			StarType:        "main_sequence",
			MoonCount:       0, // Endor is itself a moon
			PopulationCount: 30000000,
			TechLevel:       "primitive",
			GovernmentType:  "tribal",
		},

		// 3D Environment configuration
		Environment3D: &models.Environment3D{
			SkyboxTexture:   "/textures/skyboxes/endor_forest.jpg",
			AmbientColor:    "#228B22",
			SunColor:        "#FFFFE0",
			SunIntensity:    0.7,
			TerrainType:     "forest",
			TerrainTexture:  "/textures/terrain/forest_floor.jpg",
			TerrainScale:    120.0,
			TerrainHeight:   100.0,
			WeatherType:     "clear",
			ParticleEffects: []string{"leaves", "forest_mist", "fireflies"},
			FogDensity:      0.15,
			FogColor:        "#90EE90",
			AmbientSound:    "/audio/ambient/forest_sounds.ogg",
			MusicTrack:      "/audio/music/endor_theme.ogg",
		},

		// Gameplay data
		GameplayData: &models.PlanetGameplay{
			ExplorationDifficulty: 5,
			ResourceTypes:         []string{"wood", "medicinal_plants", "rare_crystals"},
			ResourceAbundance:     "moderate",
			EnvironmentalHazards:  []string{"dense_forest", "wild_animals", "imperial_patrols"},
			HostileCreatures:      []string{"gorax", "boar_wolf", "imperial_scouts"},
			ImperialPresence:      "moderate",
			AvailableMissions:     []string{"ewok_alliance", "shield_generator", "forest_survival"},
			UnlockRequirements:    []string{"level_12", "rebel_alliance_member"},
			CompletionRewards:     []string{"ewok_allies", "forest_knowledge", "stealth_training"},
			StrategicImportance:   8,
			FactionControl:        "neutral",
			TradeRouteValue:       4,
		},
	}

	// Create planets
	if err := db.Create(&coruscant).Error; err != nil {
		log.Printf("Error creating Coruscant: %v", err)
		return err
	}

	if err := db.Create(&endor).Error; err != nil {
		log.Printf("Error creating Endor: %v", err)
		return err
	}

	log.Println("Additional planets from Bright Data MCP seeded successfully!")
	return nil
}

// SeedAllBrightDataEnhancements seeds all enhanced data from Bright Data MCP
func SeedAllBrightDataEnhancements(db *gorm.DB) error {
	log.Println("Starting comprehensive Bright Data MCP seeding...")

	// Seed enhanced starships
	if err := SeedBrightDataStarships(db); err != nil {
		return fmt.Errorf("failed to seed enhanced starships: %w", err)
	}

	// Seed enhanced planets
	if err := SeedBrightDataPlanets(db); err != nil {
		return fmt.Errorf("failed to seed enhanced planets: %w", err)
	}

	// Seed additional starships
	if err := SeedAdditionalStarships(db); err != nil {
		return fmt.Errorf("failed to seed additional starships: %w", err)
	}

	// Seed additional planets
	if err := SeedAdditionalPlanets(db); err != nil {
		return fmt.Errorf("failed to seed additional planets: %w", err)
	}

	log.Println("All Bright Data MCP enhancements seeded successfully!")
	return nil
}
