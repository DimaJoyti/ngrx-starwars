package main

import (
	"log"
	"os"
	"starwars-api/database"
	"starwars-api/handlers"
	"starwars-api/middleware"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	// Set Gin mode based on environment
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	// Initialize database
	database.Initialize()

	// Create Gin router
	router := gin.New()

	// Setup middleware
	router.Use(middleware.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.SetupCORS())

	// Setup rate limiting (100 requests per minute per IP)
	rateLimiter := middleware.NewRateLimiter(100, time.Minute)
	router.Use(middleware.RateLimit(rateLimiter))

	// Setup API routes with versioning
	v1 := router.Group("/api/v1")
	{
		// Characters endpoints
		v1.GET("/people", handlers.GetCharacters)
		v1.GET("/people/:id", handlers.GetCharacterByID)

		// Films endpoints
		v1.GET("/films", handlers.GetFilms)

		// Species endpoints
		v1.GET("/species", handlers.GetSpecies)

		// Starships endpoints
		v1.GET("/starships", handlers.GetStarships)

		// Planets endpoints
		v1.GET("/planets", handlers.GetPlanets)
		v1.GET("/planets/:id", handlers.GetPlanetByID)

		// Organizations endpoints
		v1.GET("/organizations", handlers.GetOrganizations)

		// Weapons endpoints
		v1.GET("/weapons", handlers.GetWeapons)

		// Game endpoints
		game := v1.Group("/game")
		{
			// Player endpoints
			game.POST("/player/create", handlers.CreatePlayer)
			game.GET("/player/:id", handlers.GetPlayerProfile)
			game.PUT("/player/:id", handlers.UpdatePlayerProfile)
			game.GET("/player/:id/stats", handlers.GetPlayerStats)
			game.POST("/player/:id/experience", handlers.AddExperience)
			game.POST("/player/:id/credits", handlers.AddCredits)

			// Game session endpoints
			game.POST("/session/create", handlers.CreateGameSession)
			game.PUT("/session/:id/complete", handlers.CompleteGameSession)

			// Quiz endpoints
			quiz := game.Group("/quiz")
			{
				quiz.GET("/questions", handlers.GetQuizQuestions)
				quiz.GET("/categories", handlers.GetQuizCategories)
				quiz.POST("/session/create", handlers.CreateQuizSession)
				quiz.POST("/session/:sessionId/answer", handlers.SubmitQuizAnswer)
				quiz.PUT("/session/:sessionId/complete", handlers.CompleteQuizSession)
				quiz.GET("/leaderboard", handlers.GetQuizLeaderboard)
			}
		}
	}

	// Legacy API routes (for backward compatibility)
	api := router.Group("/api")
	{
		// Characters endpoints
		api.GET("/people", handlers.GetCharacters)
		api.GET("/people/:id", handlers.GetCharacterByID)

		// Films endpoints
		api.GET("/films", handlers.GetFilms)

		// Species endpoints
		api.GET("/species", handlers.GetSpecies)

		// Starships endpoints
		api.GET("/starships", handlers.GetStarships)

		// Planets endpoints
		api.GET("/planets", handlers.GetPlanets)
		api.GET("/planets/:id", handlers.GetPlanetByID)

		// Organizations endpoints
		api.GET("/organizations", handlers.GetOrganizations)

		// Weapons endpoints
		api.GET("/weapons", handlers.GetWeapons)
	}

	// Health check endpoint with detailed information
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "Star Wars API is running",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC(),
			"uptime":    time.Since(time.Now()).String(),
		})
	})

	// API documentation endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"name":        "Star Wars API",
			"description": "A comprehensive REST API providing Star Wars data from all eras",
			"version":     "2.0.0",
			"endpoints": gin.H{
				"characters":    "/api/people",
				"films":         "/api/films",
				"species":       "/api/species",
				"starships":     "/api/starships",
				"planets":       "/api/planets",
				"organizations": "/api/organizations",
				"weapons":       "/api/weapons",
				"health":        "/health",
			},
			"features": []string{
				"30+ characters from all Star Wars eras",
				"9 main saga films",
				"10+ species",
				"10+ starships including Death Star",
				"10+ planets",
				"Organizations (Jedi, Sith, Empire, Rebels)",
				"Weapons including lightsabers",
				"Pagination and search",
				"SWAPI-compatible format",
			},
			"documentation": "https://github.com/DimaJoyti/ngrx-starwars",
		})
	})

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("🚀 Starting Star Wars API server on port %s", port)
	log.Printf("📡 API endpoints available at http://localhost:%s/api/", port)
	log.Printf("🏥 Health check at http://localhost:%s/health", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatal("❌ Failed to start server:", err)
	}
}
