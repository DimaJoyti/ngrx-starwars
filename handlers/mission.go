package handlers

import (
	"net/http"
	"strconv"
	"time"

	"starwars-api/services"

	"github.com/gin-gonic/gin"
)

type MissionHandler struct {
	missionService *services.MissionService
}

func NewMissionHandler(missionService *services.MissionService) *MissionHandler {
	return &MissionHandler{
		missionService: missionService,
	}
}

// GetAllMissions handles GET /api/v1/missions
func (h *MissionHandler) GetAllMissions(c *gin.Context) {
	missions, err := h.missionService.GetAllMissions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch missions",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"missions": missions,
			"count":    len(missions),
		},
		Message:   "Missions retrieved successfully",
		Timestamp: time.Now(),
	})
}

// GetMissionsByType handles GET /api/v1/missions/type/:type
func (h *MissionHandler) GetMissionsByType(c *gin.Context) {
	missionType := c.Param("type")

	missions, err := h.missionService.GetMissionsByType(missionType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch missions by type",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"missions": missions,
			"type":     missionType,
			"count":    len(missions),
		},
		Message:   "Missions by type retrieved successfully",
		Timestamp: time.Now(),
	})
}

// GetMissionsByCategory handles GET /api/v1/missions/category/:category
func (h *MissionHandler) GetMissionsByCategory(c *gin.Context) {
	category := c.Param("category")

	missions, err := h.missionService.GetMissionsByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch missions by category",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"missions": missions,
			"category": category,
			"count":    len(missions),
		},
		Message:   "Missions by category retrieved successfully",
		Timestamp: time.Now(),
	})
}

// GetAvailableMissions handles GET /api/v1/missions/available/:playerID
func (h *MissionHandler) GetAvailableMissions(c *gin.Context) {
	playerID, err := strconv.Atoi(c.Param("playerID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid player ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Get player level from query params or default to 1
	playerLevel := 1
	if levelStr := c.Query("level"); levelStr != "" {
		if level, err := strconv.Atoi(levelStr); err == nil {
			playerLevel = level
		}
	}

	missions, err := h.missionService.GetAvailableMissionsForPlayer(playerID, playerLevel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch available missions",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"missions":     missions,
			"player_id":    playerID,
			"player_level": playerLevel,
			"count":        len(missions),
		},
		Message:   "Available missions retrieved successfully",
		Timestamp: time.Now(),
	})
}

// StartMission handles POST /api/v1/missions/:missionID/start
func (h *MissionHandler) StartMission(c *gin.Context) {
	missionID, err := strconv.Atoi(c.Param("missionID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid mission ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	var requestBody struct {
		PlayerID int `json:"player_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	progress, err := h.missionService.StartMission(requestBody.PlayerID, missionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Mission start failed",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"progress": progress,
		},
		Message:   "Mission started successfully",
		Timestamp: time.Now(),
	})
}

// GetMissionProgress handles GET /api/v1/missions/:missionID/progress/:playerID
func (h *MissionHandler) GetMissionProgress(c *gin.Context) {
	missionID, err := strconv.Atoi(c.Param("missionID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid mission ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	playerID, err := strconv.Atoi(c.Param("playerID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid player ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	progress, err := h.missionService.GetMissionProgress(playerID, missionID)
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error:   "Not found",
			Message: "Mission progress not found",
			Code:    http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data:      progress,
		Message:   "Mission progress retrieved successfully",
		Timestamp: time.Now(),
	})
}

// UpdateObjectiveProgress handles PUT /api/v1/missions/:missionID/objectives/:objectiveID/progress
func (h *MissionHandler) UpdateObjectiveProgress(c *gin.Context) {
	missionID, err := strconv.Atoi(c.Param("missionID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid mission ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	objectiveID, err := strconv.Atoi(c.Param("objectiveID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid objective ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	var requestBody struct {
		PlayerID int `json:"player_id" binding:"required"`
		Progress int `json:"progress" binding:"required"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	err = h.missionService.UpdateObjectiveProgress(requestBody.PlayerID, missionID, objectiveID, requestBody.Progress)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Update failed",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data:      nil,
		Message:   "Objective progress updated successfully",
		Timestamp: time.Now(),
	})
}

// CompleteMission handles POST /api/v1/missions/:missionID/complete
func (h *MissionHandler) CompleteMission(c *gin.Context) {
	missionID, err := strconv.Atoi(c.Param("missionID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid mission ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	var requestBody struct {
		PlayerID int `json:"player_id" binding:"required"`
		Rating   int `json:"rating" binding:"required,min=1,max=5"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	progress, err := h.missionService.CompleteMission(requestBody.PlayerID, missionID, requestBody.Rating)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Mission completion failed",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"progress": progress,
		},
		Message:   "Mission completed successfully",
		Timestamp: time.Now(),
	})
}

// GetPlayerMissionHistory handles GET /api/v1/missions/history/:playerID
func (h *MissionHandler) GetPlayerMissionHistory(c *gin.Context) {
	playerID, err := strconv.Atoi(c.Param("playerID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid player ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	history, err := h.missionService.GetPlayerMissionHistory(playerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch mission history",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"history":   history,
			"player_id": playerID,
			"count":     len(history),
		},
		Message:   "Mission history retrieved successfully",
		Timestamp: time.Now(),
	})
}

// GetMissionStatistics handles GET /api/v1/missions/:missionID/statistics
func (h *MissionHandler) GetMissionStatistics(c *gin.Context) {
	missionID, err := strconv.Atoi(c.Param("missionID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "Invalid parameter",
			Message: "Invalid mission ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	stats, err := h.missionService.GetMissionStatistics(missionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch mission statistics",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"mission_id": missionID,
			"statistics": stats,
		},
		Message:   "Mission statistics retrieved successfully",
		Timestamp: time.Now(),
	})
}

// SyncWithBrightData handles POST /api/v1/missions/sync/bright-data
func (h *MissionHandler) SyncWithBrightData(c *gin.Context) {
	err := h.missionService.SyncWithBrightData()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Sync error",
			Message: "Failed to sync with Bright Data",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"sync_completed": true,
		},
		Message:   "Bright Data sync completed successfully",
		Timestamp: time.Now(),
	})
}

// GetSyncHistory handles GET /api/v1/missions/sync/history
func (h *MissionHandler) GetSyncHistory(c *gin.Context) {
	history, err := h.missionService.GetSyncHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:   "Database error",
			Message: "Failed to fetch sync history",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data: map[string]interface{}{
			"history": history,
			"count":   len(history),
		},
		Message:   "Sync history retrieved successfully",
		Timestamp: time.Now(),
	})
}

// GetLastSyncStatus handles GET /api/v1/missions/sync/status
func (h *MissionHandler) GetLastSyncStatus(c *gin.Context) {
	status, err := h.missionService.GetLastSyncStatus()
	if err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error:   "Not found",
			Message: "No sync history found",
			Code:    http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, SuccessResponse{
		Data:      status,
		Message:   "Last sync status retrieved successfully",
		Timestamp: time.Now(),
	})
}

// RegisterMissionRoutes registers all mission-related routes
func RegisterMissionRoutes(router *gin.Engine, missionService *services.MissionService) {
	handler := NewMissionHandler(missionService)

	v1 := router.Group("/api/v1")
	{
		// Mission CRUD operations
		v1.GET("/missions", handler.GetAllMissions)
		v1.GET("/missions/type/:type", handler.GetMissionsByType)
		v1.GET("/missions/category/:category", handler.GetMissionsByCategory)
		v1.GET("/missions/available/:playerID", handler.GetAvailableMissions)

		// Mission progress operations
		v1.POST("/missions/:missionID/start", handler.StartMission)
		v1.POST("/missions/:missionID/complete", handler.CompleteMission)
		v1.GET("/missions/:missionID/progress/:playerID", handler.GetMissionProgress)
		v1.PUT("/missions/:missionID/objectives/:objectiveID/progress", handler.UpdateObjectiveProgress)

		// Mission history and statistics
		v1.GET("/missions/history/:playerID", handler.GetPlayerMissionHistory)
		v1.GET("/missions/:missionID/statistics", handler.GetMissionStatistics)

		// Bright Data integration
		v1.POST("/missions/sync/bright-data", handler.SyncWithBrightData)
		v1.GET("/missions/sync/history", handler.GetSyncHistory)
		v1.GET("/missions/sync/status", handler.GetLastSyncStatus)
	}
}
