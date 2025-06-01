package models

import (
	"time"
)

// Character represents a Star Wars character
type Character struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	URL       string    `json:"url" gorm:"unique"`
	Name      string    `json:"name"`
	BirthYear string    `json:"birth_year"`
	EyeColor  string    `json:"eye_color"`
	Gender    string    `json:"gender"`
	Homeworld string    `json:"homeworld"`
	HairColor string    `json:"hair_color"`
	Height    string    `json:"height"`
	Mass      string    `json:"mass"`
	CreatedAt time.Time `json:"created"`
	UpdatedAt time.Time `json:"edited"`

	// Many-to-many relationships
	Films     []Film     `json:"films" gorm:"many2many:character_films;"`
	Species   []Species  `json:"species" gorm:"many2many:character_species;"`
	Starships []Starship `json:"starships" gorm:"many2many:character_starships;"`
	Vehicles  []Vehicle  `json:"vehicles" gorm:"many2many:character_vehicles;"`
}

// Film represents a Star Wars movie
type Film struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	URL          string    `json:"url" gorm:"unique"`
	Title        string    `json:"title"`
	EpisodeID    int       `json:"episode_id"`
	OpeningCrawl string    `json:"opening_crawl"`
	Director     string    `json:"director"`
	Producer     string    `json:"producer"`
	ReleaseDate  string    `json:"release_date"`
	CreatedAt    time.Time `json:"created"`
	UpdatedAt    time.Time `json:"edited"`

	// Many-to-many relationships
	Characters []Character `json:"characters" gorm:"many2many:character_films;"`
	Planets    []Planet    `json:"planets" gorm:"many2many:film_planets;"`
	Species    []Species   `json:"species" gorm:"many2many:film_species;"`
	Starships  []Starship  `json:"starships" gorm:"many2many:film_starships;"`
	Vehicles   []Vehicle   `json:"vehicles" gorm:"many2many:film_vehicles;"`
}

// Species represents a Star Wars species
type Species struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	URL             string    `json:"url" gorm:"unique"`
	Name            string    `json:"name"`
	Classification  string    `json:"classification"`
	Designation     string    `json:"designation"`
	AverageHeight   string    `json:"average_height"`
	AverageLifespan string    `json:"average_lifespan"`
	SkinColors      string    `json:"skin_colors"`
	HairColors      string    `json:"hair_colors"`
	EyeColors       string    `json:"eye_colors"`
	Language        string    `json:"language"`
	HomeworldURL    string    `json:"homeworld"`
	CreatedAt       time.Time `json:"created"`
	UpdatedAt       time.Time `json:"edited"`

	// Many-to-many relationships
	Characters []Character `json:"people" gorm:"many2many:character_species;"`
	Films      []Film      `json:"films" gorm:"many2many:film_species;"`
}

// Starship represents a Star Wars starship with enhanced data from Bright Data MCP
type Starship struct {
	ID                   uint      `json:"id" gorm:"primaryKey"`
	URL                  string    `json:"url" gorm:"unique"`
	Name                 string    `json:"name"`
	Model                string    `json:"model"`
	Manufacturer         string    `json:"manufacturer"`
	CostInCredits        string    `json:"cost_in_credits"`
	Length               string    `json:"length"`
	MaxAtmospheringSpeed string    `json:"max_atmosphering_speed"`
	Crew                 string    `json:"crew"`
	Passengers           string    `json:"passengers"`
	CargoCapacity        string    `json:"cargo_capacity"`
	Consumables          string    `json:"consumables"`
	HyperdriveRating     string    `json:"hyperdrive_rating"`
	MGLT                 string    `json:"MGLT"`
	StarshipClass        string    `json:"starship_class"`
	CreatedAt            time.Time `json:"created"`
	UpdatedAt            time.Time `json:"updated"`

	// Enhanced data from Bright Data MCP (Wookieepedia scraping)
	TechnicalSpecs *StarshipTechnicalSpecs `json:"technical_specs" gorm:"embedded"`
	PhysicsConfig  *StarshipPhysicsConfig  `json:"physics_config" gorm:"embedded"`
	Model3DConfig  *Model3DConfig          `json:"model_3d_config" gorm:"embedded"`
	GameplayStats  *GameplayStats          `json:"gameplay_stats" gorm:"embedded"`
	WeaponSystems  []WeaponSystem          `json:"weapon_systems" gorm:"foreignKey:StarshipID"`

	// Many-to-many relationships
	Pilots []Character `json:"pilots" gorm:"many2many:character_starships;"`
	Films  []Film      `json:"films" gorm:"many2many:film_starships;"`
}

// Vehicle represents a Star Wars vehicle
type Vehicle struct {
	ID                   uint      `json:"id" gorm:"primaryKey"`
	URL                  string    `json:"url" gorm:"unique"`
	Name                 string    `json:"name"`
	Model                string    `json:"model"`
	Manufacturer         string    `json:"manufacturer"`
	CostInCredits        string    `json:"cost_in_credits"`
	Length               string    `json:"length"`
	MaxAtmospheringSpeed string    `json:"max_atmosphering_speed"`
	Crew                 string    `json:"crew"`
	Passengers           string    `json:"passengers"`
	CargoCapacity        string    `json:"cargo_capacity"`
	Consumables          string    `json:"consumables"`
	VehicleClass         string    `json:"vehicle_class"`
	CreatedAt            time.Time `json:"created"`
	UpdatedAt            time.Time `json:"edited"`

	// Many-to-many relationships
	Pilots []Character `json:"pilots" gorm:"many2many:character_vehicles;"`
	Films  []Film      `json:"films" gorm:"many2many:film_vehicles;"`
}

// Planet represents a Star Wars planet with enhanced data from Bright Data MCP
type Planet struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	URL            string    `json:"url" gorm:"unique"`
	Name           string    `json:"name"`
	RotationPeriod string    `json:"rotation_period"`
	OrbitalPeriod  string    `json:"orbital_period"`
	Diameter       string    `json:"diameter"`
	Climate        string    `json:"climate"`
	Gravity        string    `json:"gravity"`
	Terrain        string    `json:"terrain"`
	SurfaceWater   string    `json:"surface_water"`
	Population     string    `json:"population"`
	CreatedAt      time.Time `json:"created"`
	UpdatedAt      time.Time `json:"edited"`

	// Enhanced data from Bright Data MCP (Wookieepedia scraping)
	PlanetSpecs   *PlanetSpecs    `json:"planet_specs" gorm:"embedded"`
	Environment3D *Environment3D  `json:"environment_3d" gorm:"embedded"`
	GameplayData  *PlanetGameplay `json:"gameplay_data" gorm:"embedded"`

	// Many-to-many relationships
	Residents []Character `json:"residents" gorm:"foreignKey:Homeworld;references:URL"`
	Films     []Film      `json:"films" gorm:"many2many:film_planets;"`
}

// Organization represents a Star Wars organization
type Organization struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	URL         string    `json:"url" gorm:"unique"`
	Name        string    `json:"name"`
	Type        string    `json:"type"` // government, military, religious, criminal, etc.
	Description string    `json:"description"`
	Founded     string    `json:"founded"`
	Dissolved   string    `json:"dissolved"`
	Homeworld   string    `json:"homeworld"`
	Leader      string    `json:"leader"`
	CreatedAt   time.Time `json:"created"`
	UpdatedAt   time.Time `json:"edited"`

	// Many-to-many relationships
	Members []Character `json:"members" gorm:"many2many:character_organizations;"`
}

// Weapon represents a Star Wars weapon
type Weapon struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	URL          string    `json:"url" gorm:"unique"`
	Name         string    `json:"name"`
	Type         string    `json:"type"` // lightsaber, blaster, superweapon, etc.
	Manufacturer string    `json:"manufacturer"`
	Model        string    `json:"model"`
	Description  string    `json:"description"`
	Length       string    `json:"length"`
	Weight       string    `json:"weight"`
	Color        string    `json:"color"`        // for lightsabers
	CrystalType  string    `json:"crystal_type"` // for lightsabers
	CreatedAt    time.Time `json:"created"`
	UpdatedAt    time.Time `json:"edited"`

	// Many-to-many relationships
	Owners []Character `json:"owners" gorm:"many2many:character_weapons;"`
}

// Event represents a significant Star Wars event
type Event struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	URL         string    `json:"url" gorm:"unique"`
	Name        string    `json:"name"`
	Type        string    `json:"type"` // battle, treaty, founding, etc.
	Date        string    `json:"date"` // BBY/ABY format
	Location    string    `json:"location"`
	Description string    `json:"description"`
	Outcome     string    `json:"outcome"`
	Era         string    `json:"era"` // Old Republic, Imperial, New Republic, etc.
	CreatedAt   time.Time `json:"created"`
	UpdatedAt   time.Time `json:"edited"`

	// Many-to-many relationships
	Participants []Character `json:"participants" gorm:"many2many:character_events;"`
	Films        []Film      `json:"films" gorm:"many2many:film_events;"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Count    int64       `json:"count"`
	Next     *string     `json:"next"`
	Previous *string     `json:"previous"`
	Results  interface{} `json:"results"`
}

// ===== ENHANCED MODELS FROM BRIGHT DATA MCP =====

// StarshipTechnicalSpecs contains detailed technical specifications from Bright Data (Wookieepedia)
type StarshipTechnicalSpecs struct {
	// Dimensions (from Wookieepedia data)
	LengthMeters float64 `json:"length_meters"` // Millennium Falcon: 34.75m, X-Wing: 12.5m
	WidthMeters  float64 `json:"width_meters"`  // Millennium Falcon: 25.61m, X-Wing: 11.76m (closed)
	HeightMeters float64 `json:"height_meters"` // Millennium Falcon: 7.8m, X-Wing: 2.4m

	// Performance specs (from Bright Data scraping)
	MaxSpeedKmh     int     `json:"max_speed_kmh"`    // Atmospheric speed
	HyperdriveClass float64 `json:"hyperdrive_class"` // Millennium Falcon: 0.5, X-Wing: 1.0
	MGLTRating      int     `json:"mglt_rating"`      // Space speed rating

	// Capacity specifications
	CrewMin           int     `json:"crew_min"`           // Minimum crew required
	CrewOptimal       int     `json:"crew_optimal"`       // Optimal crew size
	CrewMax           int     `json:"crew_max"`           // Maximum crew capacity
	PassengerCapacity int     `json:"passenger_capacity"` // Additional passengers
	CargoTons         float64 `json:"cargo_tons"`         // Cargo capacity in metric tons

	// Combat and systems
	ShieldStrength int `json:"shield_strength"` // Shield power rating
	HullIntegrity  int `json:"hull_integrity"`  // Hull durability
	PowerOutput    int `json:"power_output"`    // Reactor output
	SensorRange    int `json:"sensor_range"`    // Sensor detection range
}

// StarshipPhysicsConfig for Cannon.js physics simulation
type StarshipPhysicsConfig struct {
	// Physics properties for 3D simulation
	Mass           float64 `json:"mass"`            // in metric tons
	LinearDamping  float64 `json:"linear_damping"`  // 0.0 - 1.0
	AngularDamping float64 `json:"angular_damping"` // 0.0 - 1.0

	// Collision shape configuration
	CollisionShape string  `json:"collision_shape"` // "box", "sphere", "hull"
	CollisionScale float64 `json:"collision_scale"` // scale factor for collision mesh

	// Material properties
	Friction    float64 `json:"friction"`    // surface friction
	Restitution float64 `json:"restitution"` // bounciness

	// Flight characteristics
	ThrustForce   float64 `json:"thrust_force"`   // forward thrust
	ManeuverForce float64 `json:"maneuver_force"` // turning force
	MaxVelocity   float64 `json:"max_velocity"`   // speed limit
	Agility       float64 `json:"agility"`        // maneuverability rating 1-10
}

// Model3DConfig contains 3D model configuration for Three.js
type Model3DConfig struct {
	ModelPath     string  `json:"model_path"`     // Path to 3D model file (.glb/.gltf)
	TexturePath   string  `json:"texture_path"`   // Path to texture files
	Scale         float64 `json:"scale"`          // Model scale factor
	RotationX     float64 `json:"rotation_x"`     // Initial X rotation
	RotationY     float64 `json:"rotation_y"`     // Initial Y rotation
	RotationZ     float64 `json:"rotation_z"`     // Initial Z rotation
	AnimationName string  `json:"animation_name"` // Default animation name
	HasAnimations bool    `json:"has_animations"` // Whether model has animations
}

// GameplayStats contains game-specific statistics and balancing
type GameplayStats struct {
	// Combat stats
	AttackPower int `json:"attack_power"` // Base attack damage
	Defense     int `json:"defense"`      // Damage reduction
	Speed       int `json:"speed"`        // Movement speed rating
	Agility     int `json:"agility"`      // Dodge/maneuver rating
	Accuracy    int `json:"accuracy"`     // Weapon accuracy bonus

	// Game progression
	Rarity      string `json:"rarity"`       // "common", "rare", "epic", "legendary"
	UnlockLevel int    `json:"unlock_level"` // Required level to unlock
	UpgradeCost int    `json:"upgrade_cost"` // Cost to upgrade
	MaxLevel    int    `json:"max_level"`    // Maximum upgrade level

	// Special abilities
	SpecialAbilities []string `json:"special_abilities"` // List of special abilities
	Faction          string   `json:"faction"`           // "rebel", "empire", "neutral"
}

// WeaponSystem represents a starship's weapon system
type WeaponSystem struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	StarshipID uint   `json:"starship_id"`  // Foreign key
	Name       string `json:"name"`         // e.g., "Quad Laser Cannon"
	Type       string `json:"type"`         // "laser", "ion", "missile", "torpedo"
	Damage     int    `json:"damage"`       // Base damage per shot
	Range      int    `json:"range"`        // Maximum effective range
	RateOfFire int    `json:"rate_of_fire"` // Shots per minute
	Accuracy   int    `json:"accuracy"`     // Accuracy rating 1-100
	Position   string `json:"position"`     // "front", "rear", "turret", "wing"
}

// ===== PLANET ENHANCED MODELS FROM BRIGHT DATA MCP =====

// PlanetSpecs contains detailed planet specifications from Bright Data (Wookieepedia)
type PlanetSpecs struct {
	// Physical characteristics (from Tatooine, Coruscant, Hoth data)
	DiameterKm    float64 `json:"diameter_km"`    // Tatooine: 10,465 km
	RotationHours float64 `json:"rotation_hours"` // Tatooine: 23 hours
	OrbitalDays   float64 `json:"orbital_days"`   // Tatooine: 304 days
	GravityFactor float64 `json:"gravity_factor"` // 1.0 = standard gravity

	// Atmospheric data
	AtmosphereType string `json:"atmosphere_type"` // "breathable", "toxic", "none"
	Temperature    string `json:"temperature"`     // "hot", "cold", "temperate", "extreme"
	Humidity       string `json:"humidity"`        // "arid", "humid", "moderate"

	// Star system
	StarCount int    `json:"star_count"` // Tatooine: 2 (binary system)
	StarType  string `json:"star_type"`  // "main_sequence", "red_giant", etc.
	MoonCount int    `json:"moon_count"` // Number of natural satellites

	// Population and civilization
	PopulationCount int64  `json:"population_count"` // Actual population number
	TechLevel       string `json:"tech_level"`       // "primitive", "standard", "advanced"
	GovernmentType  string `json:"government_type"`  // "none", "tribal", "republic", "empire"
}

// Environment3D contains 3D environment configuration for Three.js
type Environment3D struct {
	// Skybox and lighting
	SkyboxTexture string  `json:"skybox_texture"` // Path to skybox texture
	AmbientColor  string  `json:"ambient_color"`  // Hex color for ambient light
	SunColor      string  `json:"sun_color"`      // Hex color for directional light
	SunIntensity  float64 `json:"sun_intensity"`  // Light intensity 0.0-2.0

	// Terrain configuration
	TerrainType    string  `json:"terrain_type"`    // "desert", "ice", "forest", "city", "ocean"
	TerrainTexture string  `json:"terrain_texture"` // Path to terrain texture
	TerrainScale   float64 `json:"terrain_scale"`   // Terrain size multiplier
	TerrainHeight  float64 `json:"terrain_height"`  // Maximum terrain height

	// Weather and effects
	WeatherType     string   `json:"weather_type"`     // "clear", "storm", "fog", "snow"
	ParticleEffects []string `json:"particle_effects"` // ["sand", "snow", "rain", "ash"]
	FogDensity      float64  `json:"fog_density"`      // Fog density 0.0-1.0
	FogColor        string   `json:"fog_color"`        // Hex color for fog

	// Audio environment
	AmbientSound string `json:"ambient_sound"` // Path to ambient audio file
	MusicTrack   string `json:"music_track"`   // Path to background music
}

// PlanetGameplay contains game-specific planet data
type PlanetGameplay struct {
	// Exploration mechanics
	ExplorationDifficulty int      `json:"exploration_difficulty"` // 1-10 difficulty rating
	ResourceTypes         []string `json:"resource_types"`         // ["crystals", "metals", "energy"]
	ResourceAbundance     string   `json:"resource_abundance"`     // "scarce", "moderate", "abundant"

	// Hazards and challenges
	EnvironmentalHazards []string `json:"environmental_hazards"` // ["sandstorm", "extreme_cold", "radiation"]
	HostileCreatures     []string `json:"hostile_creatures"`     // ["tusken_raiders", "wampa", "sarlacc"]
	ImperialPresence     string   `json:"imperial_presence"`     // "none", "light", "moderate", "heavy"

	// Missions and quests
	AvailableMissions  []string `json:"available_missions"`  // Mission types available
	UnlockRequirements []string `json:"unlock_requirements"` // Requirements to access planet
	CompletionRewards  []string `json:"completion_rewards"`  // Rewards for planet completion

	// Strategic value
	StrategicImportance int    `json:"strategic_importance"` // 1-10 importance rating
	FactionControl      string `json:"faction_control"`      // "rebel", "empire", "neutral", "contested"
	TradeRouteValue     int    `json:"trade_route_value"`    // Economic importance 1-10
}
