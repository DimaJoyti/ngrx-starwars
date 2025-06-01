package handlers

import (
	"net/http"
	"starwars-api/models"
	"starwars-api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FleetHandler struct {
	fleetService *services.FleetService
}

func NewFleetHandler(fleetService *services.FleetService) *FleetHandler {
	return &FleetHandler{fleetService: fleetService}
}

// GetPlayerFleet returns the player's main fleet
// GET /api/v1/fleet/:playerId
func (h *FleetHandler) GetPlayerFleet(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	fleet, err := h.fleetService.GetPlayerFleet(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, fleet)
}

// GetPlayerShips returns all ships owned by a player
// GET /api/v1/fleet/:playerId/ships
func (h *FleetHandler) GetPlayerShips(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	ships, err := h.fleetService.GetPlayerShips(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ships": ships})
}

// AddShipToFleet adds a ship to a player's fleet
// POST /api/v1/fleet/:playerId/ships/:shipId
func (h *FleetHandler) AddShipToFleet(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	shipIDStr := c.Param("shipId")
	shipID, err := strconv.ParseUint(shipIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ship ID"})
		return
	}

	var request struct {
		FleetID uint `json:"fleet_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.fleetService.AddShipToFleet(uint(playerID), uint(shipID), request.FleetID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ship added to fleet successfully"})
}

// RemoveShipFromFleet removes a ship from a fleet
// DELETE /api/v1/fleet/:playerId/ships/:shipId
func (h *FleetHandler) RemoveShipFromFleet(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	shipIDStr := c.Param("shipId")
	shipID, err := strconv.ParseUint(shipIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ship ID"})
		return
	}

	err = h.fleetService.RemoveShipFromFleet(uint(playerID), uint(shipID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ship removed from fleet successfully"})
}

// GetAvailableShips returns ship templates available for purchase
// GET /api/v1/fleet/ships/available
func (h *FleetHandler) GetAvailableShips(c *gin.Context) {
	levelStr := c.DefaultQuery("level", "1")
	level, err := strconv.Atoi(levelStr)
	if err != nil {
		level = 1
	}

	templates, err := h.fleetService.GetAvailableShipTemplates(level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ships": templates})
}

// PurchaseShip creates a new ship from a template
// POST /api/v1/fleet/:playerId/ships/purchase
func (h *FleetHandler) PurchaseShip(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var request struct {
		TemplateID uint `json:"template_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ship, err := h.fleetService.PurchaseShip(uint(playerID), request.TemplateID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Ship purchased successfully",
		"ship":    ship,
	})
}

// UpgradeShip applies an upgrade to a ship
// POST /api/v1/fleet/:playerId/ships/:shipId/upgrade
func (h *FleetHandler) UpgradeShip(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	shipIDStr := c.Param("shipId")
	shipID, err := strconv.ParseUint(shipIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ship ID"})
		return
	}

	var upgradeData models.ShipUpgrade
	if err := c.ShouldBindJSON(&upgradeData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ship, err := h.fleetService.UpgradeShip(uint(playerID), uint(shipID), upgradeData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Ship upgraded successfully",
		"ship":    ship,
	})
}

// RepairShip restores a ship's health and shield
// POST /api/v1/fleet/:playerId/ships/:shipId/repair
func (h *FleetHandler) RepairShip(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	shipIDStr := c.Param("shipId")
	shipID, err := strconv.ParseUint(shipIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ship ID"})
		return
	}

	err = h.fleetService.RepairShip(uint(playerID), uint(shipID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ship repaired successfully"})
}

// GetPlayerHangar returns the player's hangar
// GET /api/v1/fleet/:playerId/hangar
func (h *FleetHandler) GetPlayerHangar(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	hangar, err := h.fleetService.GetPlayerHangar(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, hangar)
}

// UpgradeHangar increases hangar capacity
// POST /api/v1/fleet/:playerId/hangar/upgrade
func (h *FleetHandler) UpgradeHangar(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	hangar, err := h.fleetService.UpgradeHangar(uint(playerID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Hangar upgraded successfully",
		"hangar":  hangar,
	})
}

// RegisterFleetRoutes registers all fleet-related routes
func RegisterFleetRoutes(router *gin.Engine, fleetService *services.FleetService) {
	handler := NewFleetHandler(fleetService)

	v1 := router.Group("/api/v1")
	{
		fleet := v1.Group("/fleet")
		{
			// Fleet management
			fleet.GET("/:playerId", handler.GetPlayerFleet)
			fleet.GET("/:playerId/ships", handler.GetPlayerShips)
			fleet.POST("/:playerId/ships/:shipId", handler.AddShipToFleet)
			fleet.DELETE("/:playerId/ships/:shipId", handler.RemoveShipFromFleet)

			// Ship management
			fleet.GET("/ships/available", handler.GetAvailableShips)
			fleet.POST("/:playerId/ships/purchase", handler.PurchaseShip)
			fleet.POST("/:playerId/ships/:shipId/upgrade", handler.UpgradeShip)
			fleet.POST("/:playerId/ships/:shipId/repair", handler.RepairShip)

			// Hangar management
			fleet.GET("/:playerId/hangar", handler.GetPlayerHangar)
			fleet.POST("/:playerId/hangar/upgrade", handler.UpgradeHangar)
		}
	}
}
