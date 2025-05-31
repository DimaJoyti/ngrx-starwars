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

// Starship represents a Star Wars starship
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
	UpdatedAt            time.Time `json:"edited"`

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

// Planet represents a Star Wars planet
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
