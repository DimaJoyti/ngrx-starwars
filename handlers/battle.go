package handlers

import (
	"net/http"
	"starwars-api/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BattleHandler struct {
	battleService *services.BattleService
}

func NewBattleHandler(battleService *services.BattleService) *BattleHandler {
	return &BattleHandler{battleService: battleService}
}

// CreateBattle creates a new battle
// POST /api/v1/battle/create
func (h *BattleHandler) CreateBattle(c *gin.Context) {
	var request struct {
		BattleType    string `json:"battle_type" binding:"required"`
		PlayerFleetID uint   `json:"player_fleet_id" binding:"required"`
		EnemyFleetID  *uint  `json:"enemy_fleet_id"`
		LocationName  string `json:"location_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	battle, err := h.battleService.CreateBattle(
		request.BattleType,
		request.PlayerFleetID,
		request.EnemyFleetID,
		request.LocationName,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Battle created successfully",
		"battle":  battle,
	})
}

// StartBattle begins the battle
// POST /api/v1/battle/:battleId/start
func (h *BattleHandler) StartBattle(c *gin.Context) {
	battleIDStr := c.Param("battleId")
	battleID, err := strconv.ParseUint(battleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid battle ID"})
		return
	}

	battle, err := h.battleService.StartBattle(uint(battleID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Battle started successfully",
		"battle":  battle,
	})
}

// ExecuteAction executes a battle action
// POST /api/v1/battle/:battleId/action
func (h *BattleHandler) ExecuteAction(c *gin.Context) {
	battleIDStr := c.Param("battleId")
	battleID, err := strconv.ParseUint(battleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid battle ID"})
		return
	}

	var request struct {
		ParticipantID uint   `json:"participant_id" binding:"required"`
		SourceShipID  uint   `json:"source_ship_id" binding:"required"`
		TargetShipID  *uint  `json:"target_ship_id"`
		ActionType    string `json:"action_type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	action, err := h.battleService.ExecuteAction(
		uint(battleID),
		request.ParticipantID,
		request.SourceShipID,
		request.TargetShipID,
		request.ActionType,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Action executed successfully",
		"action":  action,
	})
}

// GetBattle returns battle details
// GET /api/v1/battle/:battleId
func (h *BattleHandler) GetBattle(c *gin.Context) {
	battleIDStr := c.Param("battleId")
	battleID, err := strconv.ParseUint(battleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid battle ID"})
		return
	}

	battle, err := h.battleService.GetBattle(uint(battleID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Battle not found"})
		return
	}

	c.JSON(http.StatusOK, battle)
}

// GetPlayerBattles returns battles for a player
// GET /api/v1/battle/player/:playerId
func (h *BattleHandler) GetPlayerBattles(c *gin.Context) {
	playerIDStr := c.Param("playerId")
	playerID, err := strconv.ParseUint(playerIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	battles, err := h.battleService.GetPlayerBattles(uint(playerID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"battles": battles})
}

// EndBattle manually ends a battle
// POST /api/v1/battle/:battleId/end
func (h *BattleHandler) EndBattle(c *gin.Context) {
	battleIDStr := c.Param("battleId")
	battleID, err := strconv.ParseUint(battleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid battle ID"})
		return
	}

	var request struct {
		WinnerID *uint `json:"winner_id"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.battleService.EndBattle(uint(battleID), request.WinnerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Battle ended successfully"})
}

// GetBattleTemplates returns available battle templates
// GET /api/v1/battle/templates
func (h *BattleHandler) GetBattleTemplates(c *gin.Context) {
	// This would be implemented when battle templates are added to the database
	// For now, return some mock templates
	templates := []gin.H{
		{
			"id":          1,
			"name":        "Asteroid Field Skirmish",
			"description": "A quick battle in an asteroid field",
			"type":        "pve",
			"difficulty":  3,
			"environment": "asteroid_field",
			"max_turns":   30,
			"rewards": gin.H{
				"experience": 150,
				"credits":    75,
			},
		},
		{
			"id":          2,
			"name":        "Imperial Patrol Encounter",
			"description": "Face off against an Imperial patrol",
			"type":        "pve",
			"difficulty":  5,
			"environment": "space",
			"max_turns":   40,
			"rewards": gin.H{
				"experience": 200,
				"credits":    100,
			},
		},
		{
			"id":          3,
			"name":        "Rebel Convoy Defense",
			"description": "Defend a Rebel convoy from Imperial attack",
			"type":        "pve",
			"difficulty":  7,
			"environment": "nebula",
			"max_turns":   50,
			"rewards": gin.H{
				"experience": 300,
				"credits":    150,
			},
		},
	}

	c.JSON(http.StatusOK, gin.H{"templates": templates})
}

// CreateQuickBattle creates a quick PvE battle
// POST /api/v1/battle/quick
func (h *BattleHandler) CreateQuickBattle(c *gin.Context) {
	var request struct {
		PlayerFleetID uint   `json:"player_fleet_id" binding:"required"`
		Difficulty    int    `json:"difficulty"`
		Environment   string `json:"environment"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if request.Difficulty == 0 {
		request.Difficulty = 3
	}
	if request.Environment == "" {
		request.Environment = "space"
	}

	locationName := "Quick Battle Zone"
	battle, err := h.battleService.CreateBattle(
		"pve",
		request.PlayerFleetID,
		nil, // No enemy fleet ID for PvE
		locationName,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Auto-start the battle
	battle, err = h.battleService.StartBattle(battle.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Quick battle created and started",
		"battle":  battle,
	})
}

// GetBattleStatus returns current battle status
// GET /api/v1/battle/:battleId/status
func (h *BattleHandler) GetBattleStatus(c *gin.Context) {
	battleIDStr := c.Param("battleId")
	battleID, err := strconv.ParseUint(battleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid battle ID"})
		return
	}

	battle, err := h.battleService.GetBattle(uint(battleID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Battle not found"})
		return
	}

	// Return simplified status
	status := gin.H{
		"id":           battle.ID,
		"status":       battle.Status,
		"current_turn": battle.CurrentTurn,
		"max_turns":    battle.MaxTurns,
		"participants": len(battle.Participants),
		"winner_id":    battle.WinnerID,
	}

	if battle.StartedAt != nil {
		status["started_at"] = battle.StartedAt
	}
	if battle.CompletedAt != nil {
		status["completed_at"] = battle.CompletedAt
		status["duration"] = battle.Duration
	}

	c.JSON(http.StatusOK, status)
}

// RegisterBattleRoutes registers all battle-related routes
func RegisterBattleRoutes(router *gin.Engine, battleService *services.BattleService) {
	handler := NewBattleHandler(battleService)

	v1 := router.Group("/api/v1")
	{
		battle := v1.Group("/battle")
		{
			// Battle management
			battle.POST("/create", handler.CreateBattle)
			battle.POST("/quick", handler.CreateQuickBattle)
			battle.GET("/templates", handler.GetBattleTemplates)

			// Battle operations
			battle.GET("/:battleId", handler.GetBattle)
			battle.GET("/:battleId/status", handler.GetBattleStatus)
			battle.POST("/:battleId/start", handler.StartBattle)
			battle.POST("/:battleId/action", handler.ExecuteAction)
			battle.POST("/:battleId/end", handler.EndBattle)

			// Player battles
			battle.GET("/player/:playerId", handler.GetPlayerBattles)
		}
	}
}
