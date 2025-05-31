package handlers

import (
	"fmt"
	"log"
	"net/http"
	"starwars-api/database"
	"starwars-api/models"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ErrorResponse represents an API error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// SuccessResponse represents a successful API response with metadata
type SuccessResponse struct {
	Data      interface{} `json:"data"`
	Message   string      `json:"message,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// GetCharacters returns a paginated list of characters with enhanced error handling
func GetCharacters(c *gin.Context) {
	// Validate and parse query parameters
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid page parameter",
			Message: "Page must be a positive integer",
			Code:    http.StatusBadRequest,
		})
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 || limit > 100 {
		limit = 10 // Default to 10 if invalid
	}

	offset := (page - 1) * limit
	search := strings.TrimSpace(c.Query("search"))

	// Validate search parameter length
	if len(search) > 100 {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid search parameter",
			Message: "Search query too long (max 100 characters)",
			Code:    http.StatusBadRequest,
		})
		return
	}

	var characters []models.Character
	var total int64

	query := database.DB.Model(&models.Character{})

	// Apply search filter if provided
	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	// Get total count with error handling
	if err := query.Count(&total).Error; err != nil {
		log.Printf("Error counting characters: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to retrieve character count",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Get paginated results with preloaded relationships
	if err := query.Preload("Films").Preload("Species").Preload("Starships").
		Offset(offset).Limit(limit).Find(&characters).Error; err != nil {
		log.Printf("Error fetching characters: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to retrieve characters",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	// Build pagination URLs
	baseURL := "http://localhost:8080/api/people"
	var next, previous *string

	if int64(page*limit) < total {
		nextURL := fmt.Sprintf("%s?page=%d&limit=%d", baseURL, page+1, limit)
		if search != "" {
			nextURL += "&search=" + search
		}
		next = &nextURL
	}

	if page > 1 {
		prevURL := fmt.Sprintf("%s?page=%d&limit=%d", baseURL, page-1, limit)
		if search != "" {
			prevURL += "&search=" + search
		}
		previous = &prevURL
	}

	// Transform characters to include URL arrays for relationships
	transformedCharacters := make([]map[string]interface{}, len(characters))
	for i, char := range characters {
		transformedCharacters[i] = transformCharacterResponse(char)
	}

	response := models.PaginatedResponse{
		Count:    total,
		Next:     next,
		Previous: previous,
		Results:  transformedCharacters,
	}

	// Add response headers
	c.Header("X-Total-Count", fmt.Sprintf("%d", total))
	c.Header("X-Page", fmt.Sprintf("%d", page))
	c.Header("X-Limit", fmt.Sprintf("%d", limit))

	c.JSON(http.StatusOK, response)
}

// GetCharacterByID returns a specific character by ID
func GetCharacterByID(c *gin.Context) {
	id := c.Param("id")

	var character models.Character
	result := database.DB.Preload("Films").Preload("Species").Preload("Starships").
		Where("id = ?", id).First(&character)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	response := transformCharacterResponse(character)
	c.JSON(http.StatusOK, response)
}

// GetFilms returns all films
func GetFilms(c *gin.Context) {
	var films []models.Film
	database.DB.Preload("Characters").Find(&films)

	// Transform films to include URL arrays for relationships
	transformedFilms := make([]map[string]interface{}, len(films))
	for i, film := range films {
		transformedFilms[i] = transformFilmResponse(film)
	}

	response := models.PaginatedResponse{
		Count:    int64(len(films)),
		Next:     nil,
		Previous: nil,
		Results:  transformedFilms,
	}

	c.JSON(http.StatusOK, response)
}

// GetSpecies returns all species
func GetSpecies(c *gin.Context) {
	var species []models.Species
	database.DB.Preload("Characters").Find(&species)

	// Transform species to include URL arrays for relationships
	transformedSpecies := make([]map[string]interface{}, len(species))
	for i, sp := range species {
		transformedSpecies[i] = transformSpeciesResponse(sp)
	}

	response := models.PaginatedResponse{
		Count:    int64(len(species)),
		Next:     nil,
		Previous: nil,
		Results:  transformedSpecies,
	}

	c.JSON(http.StatusOK, response)
}

// GetStarships returns all starships
func GetStarships(c *gin.Context) {
	var starships []models.Starship
	database.DB.Preload("Pilots").Find(&starships)

	// Transform starships to include URL arrays for relationships
	transformedStarships := make([]map[string]interface{}, len(starships))
	for i, ship := range starships {
		transformedStarships[i] = transformStarshipResponse(ship)
	}

	response := models.PaginatedResponse{
		Count:    int64(len(starships)),
		Next:     nil,
		Previous: nil,
		Results:  transformedStarships,
	}

	c.JSON(http.StatusOK, response)
}

// GetPlanets returns all planets
func GetPlanets(c *gin.Context) {
	var planets []models.Planet
	database.DB.Find(&planets)

	// Transform planets to match SWAPI format
	transformedPlanets := make([]map[string]interface{}, len(planets))
	for i, planet := range planets {
		transformedPlanets[i] = transformPlanetResponse(planet)
	}

	response := models.PaginatedResponse{
		Count:    int64(len(planets)),
		Next:     nil,
		Previous: nil,
		Results:  transformedPlanets,
	}

	c.JSON(http.StatusOK, response)
}

// GetPlanetByID returns a specific planet by ID
func GetPlanetByID(c *gin.Context) {
	id := c.Param("id")

	var planet models.Planet
	result := database.DB.Where("id = ?", id).First(&planet)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Planet not found"})
		return
	}

	response := transformPlanetResponse(planet)
	c.JSON(http.StatusOK, response)
}

// GetOrganizations returns all organizations
func GetOrganizations(c *gin.Context) {
	var organizations []models.Organization
	database.DB.Preload("Members").Find(&organizations)

	// Transform organizations
	transformedOrganizations := make([]map[string]interface{}, len(organizations))
	for i, org := range organizations {
		transformedOrganizations[i] = transformOrganizationResponse(org)
	}

	response := models.PaginatedResponse{
		Count:    int64(len(organizations)),
		Next:     nil,
		Previous: nil,
		Results:  transformedOrganizations,
	}

	c.JSON(http.StatusOK, response)
}

// GetWeapons returns all weapons
func GetWeapons(c *gin.Context) {
	var weapons []models.Weapon
	database.DB.Preload("Owners").Find(&weapons)

	// Transform weapons
	transformedWeapons := make([]map[string]interface{}, len(weapons))
	for i, weapon := range weapons {
		transformedWeapons[i] = transformWeaponResponse(weapon)
	}

	response := models.PaginatedResponse{
		Count:    int64(len(weapons)),
		Next:     nil,
		Previous: nil,
		Results:  transformedWeapons,
	}

	c.JSON(http.StatusOK, response)
}

// Helper functions to transform responses to match SWAPI format

func transformCharacterResponse(char models.Character) map[string]interface{} {
	// Extract URL arrays from relationships
	filmURLs := make([]string, len(char.Films))
	for i, film := range char.Films {
		filmURLs[i] = film.URL
	}

	speciesURLs := make([]string, len(char.Species))
	for i, species := range char.Species {
		speciesURLs[i] = species.URL
	}

	starshipURLs := make([]string, len(char.Starships))
	for i, starship := range char.Starships {
		starshipURLs[i] = starship.URL
	}

	vehicleURLs := make([]string, len(char.Vehicles))
	for i, vehicle := range char.Vehicles {
		vehicleURLs[i] = vehicle.URL
	}

	return map[string]interface{}{
		"url":        char.URL,
		"name":       char.Name,
		"birth_year": char.BirthYear,
		"eye_color":  char.EyeColor,
		"gender":     char.Gender,
		"homeworld":  char.Homeworld,
		"hair_color": char.HairColor,
		"height":     char.Height,
		"mass":       char.Mass,
		"films":      filmURLs,
		"species":    speciesURLs,
		"starships":  starshipURLs,
		"vehicles":   vehicleURLs,
		"created":    char.CreatedAt,
		"edited":     char.UpdatedAt,
	}
}

func transformFilmResponse(film models.Film) map[string]interface{} {
	characterURLs := make([]string, len(film.Characters))
	for i, char := range film.Characters {
		characterURLs[i] = char.URL
	}

	return map[string]interface{}{
		"url":           film.URL,
		"title":         film.Title,
		"episode_id":    film.EpisodeID,
		"opening_crawl": film.OpeningCrawl,
		"director":      film.Director,
		"producer":      film.Producer,
		"release_date":  film.ReleaseDate,
		"characters":    characterURLs,
		"created":       film.CreatedAt,
		"edited":        film.UpdatedAt,
	}
}

func transformSpeciesResponse(species models.Species) map[string]interface{} {
	characterURLs := make([]string, len(species.Characters))
	for i, char := range species.Characters {
		characterURLs[i] = char.URL
	}

	return map[string]interface{}{
		"url":              species.URL,
		"name":             species.Name,
		"classification":   species.Classification,
		"designation":      species.Designation,
		"average_height":   species.AverageHeight,
		"average_lifespan": species.AverageLifespan,
		"skin_colors":      species.SkinColors,
		"hair_colors":      species.HairColors,
		"eye_colors":       species.EyeColors,
		"language":         species.Language,
		"homeworld":        species.HomeworldURL,
		"people":           characterURLs,
		"created":          species.CreatedAt,
		"edited":           species.UpdatedAt,
	}
}

func transformStarshipResponse(starship models.Starship) map[string]interface{} {
	pilotURLs := make([]string, len(starship.Pilots))
	for i, pilot := range starship.Pilots {
		pilotURLs[i] = pilot.URL
	}

	return map[string]interface{}{
		"url":                    starship.URL,
		"name":                   starship.Name,
		"model":                  starship.Model,
		"manufacturer":           starship.Manufacturer,
		"cost_in_credits":        starship.CostInCredits,
		"length":                 starship.Length,
		"max_atmosphering_speed": starship.MaxAtmospheringSpeed,
		"crew":                   starship.Crew,
		"passengers":             starship.Passengers,
		"cargo_capacity":         starship.CargoCapacity,
		"consumables":            starship.Consumables,
		"hyperdrive_rating":      starship.HyperdriveRating,
		"MGLT":                   starship.MGLT,
		"starship_class":         starship.StarshipClass,
		"pilots":                 pilotURLs,
		"created":                starship.CreatedAt,
		"edited":                 starship.UpdatedAt,
	}
}

func transformPlanetResponse(planet models.Planet) map[string]interface{} {
	residentURLs := make([]string, len(planet.Residents))
	for i, resident := range planet.Residents {
		residentURLs[i] = resident.URL
	}

	filmURLs := make([]string, len(planet.Films))
	for i, film := range planet.Films {
		filmURLs[i] = film.URL
	}

	return map[string]interface{}{
		"url":             planet.URL,
		"name":            planet.Name,
		"rotation_period": planet.RotationPeriod,
		"orbital_period":  planet.OrbitalPeriod,
		"diameter":        planet.Diameter,
		"climate":         planet.Climate,
		"gravity":         planet.Gravity,
		"terrain":         planet.Terrain,
		"surface_water":   planet.SurfaceWater,
		"population":      planet.Population,
		"residents":       residentURLs,
		"films":           filmURLs,
		"created":         planet.CreatedAt,
		"edited":          planet.UpdatedAt,
	}
}

func transformOrganizationResponse(org models.Organization) map[string]interface{} {
	memberURLs := make([]string, len(org.Members))
	for i, member := range org.Members {
		memberURLs[i] = member.URL
	}

	return map[string]interface{}{
		"url":         org.URL,
		"name":        org.Name,
		"type":        org.Type,
		"description": org.Description,
		"founded":     org.Founded,
		"dissolved":   org.Dissolved,
		"homeworld":   org.Homeworld,
		"leader":      org.Leader,
		"members":     memberURLs,
		"created":     org.CreatedAt,
		"edited":      org.UpdatedAt,
	}
}

func transformWeaponResponse(weapon models.Weapon) map[string]interface{} {
	ownerURLs := make([]string, len(weapon.Owners))
	for i, owner := range weapon.Owners {
		ownerURLs[i] = owner.URL
	}

	return map[string]interface{}{
		"url":          weapon.URL,
		"name":         weapon.Name,
		"type":         weapon.Type,
		"manufacturer": weapon.Manufacturer,
		"model":        weapon.Model,
		"description":  weapon.Description,
		"length":       weapon.Length,
		"weight":       weapon.Weight,
		"color":        weapon.Color,
		"crystal_type": weapon.CrystalType,
		"owners":       ownerURLs,
		"created":      weapon.CreatedAt,
		"edited":       weapon.UpdatedAt,
	}
}
