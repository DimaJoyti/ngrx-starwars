package handlers

import (
	"net/http"
	"starwars-api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AchievementHandler struct {
	achievementService *services.AchievementService
}

func NewAchievementHandler(achievementService *services.AchievementService) *AchievementHandler {
	return &AchievementHandler{achievementService: achievementService}
}

// GetAllAchievements returns all available achievements
// GET /api/v1/achievements
func (h *AchievementHandler) GetAllAchievements(c *gin.Context) {
	achievements, err := h.achievementService.GetAllAchievements()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"achievements": achievements})
}

// GetPlayerAchievements returns a player's achievement progress
// GET /api/v1/achievements/:playerId
func (h *AchievementHandler) GetPlayerAchievements(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	achievements, err := h.achievementService.GetPlayerAchievements(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"achievements": achievements})
}

// GetAchievementsByCategory returns achievements filtered by category
// GET /api/v1/achievements/category/:category
func (h *AchievementHandler) GetAchievementsByCategory(c *gin.Context) {
	category := c.Param("category")

	achievements, err := h.achievementService.GetAchievementsByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"achievements": achievements})
}

// UpdateProgress updates progress on an achievement
// POST /api/v1/achievements/:playerId/progress
func (h *AchievementHandler) UpdateProgress(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		AchievementName string `json:"achievement_name" binding:"required"`
		ProgressValue   int    `json:"progress_value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.achievementService.UpdateProgress(uint(playerID), request.AchievementName, request.ProgressValue)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Achievement progress updated successfully"})
}

// GetPlayerAchievementStats returns achievement statistics for a player
// GET /api/v1/achievements/:playerId/stats
func (h *AchievementHandler) GetPlayerAchievementStats(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	stats, err := h.achievementService.GetPlayerAchievementStats(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

// GetLeaderboard returns achievement leaderboard
// GET /api/v1/achievements/leaderboard
func (h *AchievementHandler) GetLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 100
	}

	leaderboard, err := h.achievementService.GetLeaderboard(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
}

// ClaimRewards marks achievement rewards as claimed
// POST /api/v1/achievements/:playerId/:achievementId/claim
func (h *AchievementHandler) ClaimRewards(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	achievementIDStr := c.Param("achievementId")
	achievementID, err := strconv.ParseUint(achievementIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid achievement ID"})
		return
	}

	err = h.achievementService.ClaimRewards(uint(playerID), uint(achievementID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rewards claimed successfully"})
}

// GetUnnotifiedAchievements returns achievements that have been unlocked but not notified
// GET /api/v1/achievements/:playerId/unnotified
func (h *AchievementHandler) GetUnnotifiedAchievements(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	achievements, err := h.achievementService.GetUnnotifiedAchievements(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"achievements": achievements})
}

// MarkAsNotified marks achievements as notified
// POST /api/v1/achievements/:playerId/notify
func (h *AchievementHandler) MarkAsNotified(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		AchievementIDs []uint `json:"achievement_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.achievementService.MarkAsNotified(uint(playerID), request.AchievementIDs)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Achievements marked as notified"})
}

// InitializePlayerAchievements creates achievement progress records for a new player
// POST /api/v1/achievements/:playerId/initialize
func (h *AchievementHandler) InitializePlayerAchievements(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	err = h.achievementService.InitializePlayerAchievements(uint(playerID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Player achievements initialized successfully"})
}

// GetAchievementCategories returns available achievement categories
// GET /api/v1/achievements/categories
func (h *AchievementHandler) GetAchievementCategories(c *gin.Context) {
	// Return static category information (would be from database in real implementation)
	categories := []gin.H{
		{
			"name":         "combat",
			"display_name": "Combat",
			"description":  "Achievements related to battles and combat",
			"icon":         "/icons/combat.png",
			"color":        "#FF0000",
		},
		{
			"name":         "exploration",
			"display_name": "Exploration",
			"description":  "Achievements for exploring the galaxy",
			"icon":         "/icons/exploration.png",
			"color":        "#00FF00",
		},
		{
			"name":         "collection",
			"display_name": "Collection",
			"description":  "Achievements for collecting ships, items, and artifacts",
			"icon":         "/icons/collection.png",
			"color":        "#0000FF",
		},
		{
			"name":         "social",
			"display_name": "Social",
			"description":  "Achievements for multiplayer and social activities",
			"icon":         "/icons/social.png",
			"color":        "#FF00FF",
		},
		{
			"name":         "progression",
			"display_name": "Progression",
			"description":  "Achievements for character and fleet progression",
			"icon":         "/icons/progression.png",
			"color":        "#FFFF00",
		},
		{
			"name":         "special",
			"display_name": "Special",
			"description":  "Special event and limited-time achievements",
			"icon":         "/icons/special.png",
			"color":        "#FF8800",
		},
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

// GetAchievementRarities returns information about achievement rarities
// GET /api/v1/achievements/rarities
func (h *AchievementHandler) GetAchievementRarities(c *gin.Context) {
	rarities := []gin.H{
		{
			"name":         "common",
			"display_name": "Common",
			"description":  "Easy to obtain achievements",
			"color":        "#FFFFFF",
			"points_range": "10-25",
		},
		{
			"name":         "rare",
			"display_name": "Rare",
			"description":  "Moderately difficult achievements",
			"color":        "#00FF00",
			"points_range": "25-50",
		},
		{
			"name":         "epic",
			"display_name": "Epic",
			"description":  "Challenging achievements",
			"color":        "#9966FF",
			"points_range": "50-100",
		},
		{
			"name":         "legendary",
			"display_name": "Legendary",
			"description":  "Extremely difficult achievements",
			"color":        "#FF8800",
			"points_range": "100-500",
		},
	}

	c.JSON(http.StatusOK, gin.H{"rarities": rarities})
}

// RegisterAchievementRoutes registers all achievement-related routes
func RegisterAchievementRoutes(router *gin.Engine, achievementService *services.AchievementService) {
	handler := NewAchievementHandler(achievementService)

	v1 := router.Group("/api/v1")
	{
		achievements := v1.Group("/achievements")
		{
			// Achievement information
			achievements.GET("", handler.GetAllAchievements)
			achievements.GET("/categories", handler.GetAchievementCategories)
			achievements.GET("/rarities", handler.GetAchievementRarities)
			achievements.GET("/category/:category", handler.GetAchievementsByCategory)

			// Player achievements
			achievements.GET("/:playerId", handler.GetPlayerAchievements)
			achievements.GET("/:playerId/stats", handler.GetPlayerAchievementStats)
			achievements.GET("/:playerId/unnotified", handler.GetUnnotifiedAchievements)
			achievements.POST("/:playerId/initialize", handler.InitializePlayerAchievements)
			achievements.POST("/:playerId/progress", handler.UpdateProgress)
			achievements.POST("/:playerId/notify", handler.MarkAsNotified)
			achievements.POST("/:playerId/:achievementId/claim", handler.ClaimRewards)

			// Leaderboard
			achievements.GET("/leaderboard", handler.GetLeaderboard)
		}
	}
}
