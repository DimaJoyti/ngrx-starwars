package handlers

import (
	"net/http"
	"starwars-api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ResourceHandler struct {
	resourceService *services.ResourceService
}

func NewResourceHandler(resourceService *services.ResourceService) *ResourceHandler {
	return &ResourceHandler{resourceService: resourceService}
}

// GetPlayerResources returns the player's resources
// GET /api/v1/resources/:playerId
func (h *ResourceHandler) GetPlayerResources(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	resources, err := h.resourceService.GetPlayerResources(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resources)
}

// AddResources adds resources to a player's account
// POST /api/v1/resources/:playerId/add
func (h *ResourceHandler) AddResources(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		Credits        int    `json:"credits"`
		Crystals       int    `json:"crystals"`
		Experience     int    `json:"experience"`
		Durasteel      int    `json:"durasteel"`
		Transparisteel int    `json:"transparisteel"`
		Tibanna        int    `json:"tibanna"`
		Kyber          int    `json:"kyber"`
		Energy         int    `json:"energy"`
		Fuel           int    `json:"fuel"`
		Reputation     int    `json:"reputation"`
		Influence      int    `json:"influence"`
		Source         string `json:"source" binding:"required"`
		Description    string `json:"description"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.resourceService.AddResources(
		uint(playerID),
		request.Credits,
		request.Crystals,
		request.Experience,
		request.Durasteel,
		request.Transparisteel,
		request.Tibanna,
		request.Kyber,
		request.Energy,
		request.Fuel,
		request.Reputation,
		request.Influence,
		request.Source,
		request.Description,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resources added successfully"})
}

// SpendResources deducts resources from a player's account
// POST /api/v1/resources/:playerId/spend
func (h *ResourceHandler) SpendResources(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		Credits        int    `json:"credits"`
		Crystals       int    `json:"crystals"`
		Durasteel      int    `json:"durasteel"`
		Transparisteel int    `json:"transparisteel"`
		Tibanna        int    `json:"tibanna"`
		Kyber          int    `json:"kyber"`
		Energy         int    `json:"energy"`
		Fuel           int    `json:"fuel"`
		Source         string `json:"source" binding:"required"`
		Description    string `json:"description"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.resourceService.SpendResources(
		uint(playerID),
		request.Credits,
		request.Crystals,
		request.Durasteel,
		request.Transparisteel,
		request.Tibanna,
		request.Kyber,
		request.Energy,
		request.Fuel,
		request.Source,
		request.Description,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resources spent successfully"})
}

// GetResourceTransactions returns transaction history for a player
// GET /api/v1/resources/:playerId/transactions
func (h *ResourceHandler) GetResourceTransactions(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	transactions, err := h.resourceService.GetResourceTransactions(uint(playerID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}

// GetAvailableConversions returns available resource conversions
// GET /api/v1/resources/conversions
func (h *ResourceHandler) GetAvailableConversions(c *gin.Context) {
	conversions, err := h.resourceService.GetAvailableConversions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"conversions": conversions})
}

// ConvertResources converts one resource type to another
// POST /api/v1/resources/:playerId/convert
func (h *ResourceHandler) ConvertResources(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		ConversionID uint `json:"conversion_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.resourceService.ConvertResources(uint(playerID), request.ConversionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resources converted successfully"})
}

// UpgradeResourceGeneration upgrades resource generation rates
// POST /api/v1/resources/:playerId/upgrade
func (h *ResourceHandler) UpgradeResourceGeneration(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		ResourceType string `json:"resource_type" binding:"required"`
		UpgradeCost  int    `json:"upgrade_cost" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.resourceService.UpgradeResourceGeneration(uint(playerID), request.ResourceType, request.UpgradeCost)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resource generation upgraded successfully"})
}

// GetResourceTypes returns information about different resource types
// GET /api/v1/resources/types
func (h *ResourceHandler) GetResourceTypes(c *gin.Context) {
	// Return static resource type information
	resourceTypes := []gin.H{
		{
			"name":         "credits",
			"display_name": "Credits",
			"description":  "The primary currency used throughout the galaxy",
			"category":     "currency",
			"icon":         "/icons/credits.png",
			"color":        "#FFD700",
			"rarity":       "common",
		},
		{
			"name":         "crystals",
			"display_name": "Crystals",
			"description":  "Premium currency for special purchases",
			"category":     "currency",
			"icon":         "/icons/crystals.png",
			"color":        "#00FFFF",
			"rarity":       "rare",
		},
		{
			"name":         "durasteel",
			"display_name": "Durasteel",
			"description":  "Basic material for ship construction",
			"category":     "material",
			"icon":         "/icons/durasteel.png",
			"color":        "#C0C0C0",
			"rarity":       "common",
		},
		{
			"name":         "transparisteel",
			"display_name": "Transparisteel",
			"description":  "Transparent material for cockpits and viewports",
			"category":     "material",
			"icon":         "/icons/transparisteel.png",
			"color":        "#E0E0E0",
			"rarity":       "uncommon",
		},
		{
			"name":         "tibanna",
			"display_name": "Tibanna Gas",
			"description":  "Essential gas for blaster weapons",
			"category":     "material",
			"icon":         "/icons/tibanna.png",
			"color":        "#FF6600",
			"rarity":       "uncommon",
		},
		{
			"name":         "kyber",
			"display_name": "Kyber Crystals",
			"description":  "Rare crystals used in advanced weapons",
			"category":     "material",
			"icon":         "/icons/kyber.png",
			"color":        "#9966FF",
			"rarity":       "legendary",
		},
		{
			"name":         "energy",
			"display_name": "Energy",
			"description":  "Power required for ship operations",
			"category":     "energy",
			"icon":         "/icons/energy.png",
			"color":        "#00FF00",
			"rarity":       "common",
		},
		{
			"name":         "fuel",
			"display_name": "Fuel",
			"description":  "Fuel required for space travel",
			"category":     "energy",
			"icon":         "/icons/fuel.png",
			"color":        "#FF9900",
			"rarity":       "common",
		},
	}

	c.JSON(http.StatusOK, gin.H{"resource_types": resourceTypes})
}

// GetResourceBundles returns available resource bundles for purchase
// GET /api/v1/resources/bundles
func (h *ResourceHandler) GetResourceBundles(c *gin.Context) {
	// Return static bundle information (would be from database in real implementation)
	bundles := []gin.H{
		{
			"id":           1,
			"name":         "Starter Pack",
			"description":  "Perfect for new pilots",
			"type":         "starter",
			"cost":         0,
			"crystal_cost": 0,
			"contents": gin.H{
				"credits":   500,
				"durasteel": 25,
				"tibanna":   10,
				"energy":    50,
				"fuel":      50,
			},
			"is_limited":    true,
			"max_purchases": 1,
		},
		{
			"id":           2,
			"name":         "Resource Boost",
			"description":  "Quick resource boost",
			"type":         "purchase",
			"cost":         1000,
			"crystal_cost": 0,
			"contents": gin.H{
				"credits":        1000,
				"durasteel":      50,
				"transparisteel": 20,
				"tibanna":        30,
			},
			"is_limited":    false,
			"max_purchases": 0,
		},
		{
			"id":           3,
			"name":         "Premium Pack",
			"description":  "High-value premium resources",
			"type":         "premium",
			"cost":         0,
			"crystal_cost": 100,
			"contents": gin.H{
				"credits":        5000,
				"durasteel":      200,
				"transparisteel": 100,
				"tibanna":        150,
				"kyber":          5,
			},
			"is_limited":    false,
			"max_purchases": 0,
		},
	}

	c.JSON(http.StatusOK, gin.H{"bundles": bundles})
}

// RegisterResourceRoutes registers all resource-related routes
func RegisterResourceRoutes(router *gin.Engine, resourceService *services.ResourceService) {
	handler := NewResourceHandler(resourceService)

	v1 := router.Group("/api/v1")
	{
		resources := v1.Group("/resources")
		{
			// Resource management
			resources.GET("/:playerId", handler.GetPlayerResources)
			resources.POST("/:playerId/add", handler.AddResources)
			resources.POST("/:playerId/spend", handler.SpendResources)
			resources.GET("/:playerId/transactions", handler.GetResourceTransactions)

			// Resource conversion
			resources.GET("/conversions", handler.GetAvailableConversions)
			resources.POST("/:playerId/convert", handler.ConvertResources)

			// Resource upgrades
			resources.POST("/:playerId/upgrade", handler.UpgradeResourceGeneration)

			// Resource information
			resources.GET("/types", handler.GetResourceTypes)
			resources.GET("/bundles", handler.GetResourceBundles)
		}
	}
}
