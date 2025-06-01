package handlers

import (
	"net/http"
	"strconv"
	"time"

	"starwars-api/database"
	"starwars-api/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// === PLAYER HANDLERS ===

// CreatePlayer створює нового гравця
func CreatePlayer(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Перевіряємо, чи існує гравець з таким username
	var existingPlayer models.Player
	if err := database.DB.Where("username = ?", req.Username).First(&existingPlayer).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	player := models.Player{
		Username:   req.Username,
		Email:      req.Email,
		Level:      1,
		Experience: 0,
		Credits:    100,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := database.DB.Create(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create player"})
		return
	}

	// Створюємо початкову статистику для гравця
	stats := models.PlayerStats{
		PlayerID: player.ID,
	}
	database.DB.Create(&stats)

	c.JSON(http.StatusCreated, player)
}

// GetPlayerProfile отримує профіль гравця
func GetPlayerProfile(c *gin.Context) {
	playerID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var player models.Player
	if err := database.DB.First(&player, playerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, player)
}

// UpdatePlayerProfile оновлює профіль гравця
func UpdatePlayerProfile(c *gin.Context) {
	playerID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Avatar   string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var player models.Player
	if err := database.DB.First(&player, playerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Оновлюємо поля
	if req.Username != "" {
		player.Username = req.Username
	}
	if req.Email != "" {
		player.Email = req.Email
	}
	if req.Avatar != "" {
		player.Avatar = req.Avatar
	}
	player.UpdatedAt = time.Now()

	if err := database.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

// GetPlayerStats отримує статистику гравця
func GetPlayerStats(c *gin.Context) {
	playerID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var stats models.PlayerStats
	if err := database.DB.Where("player_id = ?", playerID).First(&stats).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Створюємо статистику, якщо її немає
			stats = models.PlayerStats{PlayerID: uint(playerID)}
			database.DB.Create(&stats)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	}

	// Обчислюємо додаткові метрики
	response := gin.H{
		"player_id":          stats.PlayerID,
		"total_games_played": stats.TotalGamesPlayed,
		"total_score":        stats.TotalScore,
		"best_score":         stats.BestScore,
		"correct_answers":    stats.CorrectAnswers,
		"total_questions":    stats.TotalQuestions,
		"current_streak":     stats.CurrentStreak,
		"best_streak":        stats.BestStreak,
		"cards_collected":    stats.CardsCollected,
		"battles_won":        stats.BattlesWon,
		"battles_lost":       stats.BattlesLost,
		"planets_visited":    stats.PlanetsVisited,
		"artifacts_found":    stats.ArtifactsFound,
	}

	// Обчислюємо точність
	if stats.TotalQuestions > 0 {
		response["accuracy"] = float64(stats.CorrectAnswers) / float64(stats.TotalQuestions) * 100
	} else {
		response["accuracy"] = 0.0
	}

	// Обчислюємо середній результат
	if stats.TotalGamesPlayed > 0 {
		response["average_score"] = float64(stats.TotalScore) / float64(stats.TotalGamesPlayed)
	} else {
		response["average_score"] = 0.0
	}

	c.JSON(http.StatusOK, response)
}

// AddExperience додає досвід гравцю
func AddExperience(c *gin.Context) {
	playerID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var req struct {
		Experience int `json:"experience" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var player models.Player
	if err := database.DB.First(&player, playerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Додаємо досвід
	player.Experience += req.Experience

	// Обчислюємо новий рівень
	newLevel := calculateLevel(player.Experience)
	if newLevel > player.Level {
		player.Level = newLevel
		// Можна додати бонуси за підвищення рівня
		player.Credits += (newLevel - player.Level) * 50
	}

	player.UpdatedAt = time.Now()

	if err := database.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

// AddCredits додає кредити гравцю
func AddCredits(c *gin.Context) {
	playerID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	var req struct {
		Credits int `json:"credits" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var player models.Player
	if err := database.DB.First(&player, playerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	player.Credits += req.Credits
	player.UpdatedAt = time.Now()

	if err := database.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

// === GAME SESSION HANDLERS ===

// CreateGameSession створює нову ігрову сесію
func CreateGameSession(c *gin.Context) {
	var req struct {
		PlayerID uint   `json:"player_id" binding:"required"`
		GameType string `json:"game_type" binding:"required"`
		Data     string `json:"data"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session := models.GameSession{
		ID:        uuid.New().String(),
		PlayerID:  req.PlayerID,
		GameType:  req.GameType,
		Data:      req.Data,
		Score:     0,
		StartedAt: time.Now(),
	}

	if err := database.DB.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	c.JSON(http.StatusCreated, session)
}

// CompleteGameSession завершує ігрову сесію
func CompleteGameSession(c *gin.Context) {
	sessionID := c.Param("id")

	var req struct {
		Score int    `json:"score"`
		Data  string `json:"data"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var session models.GameSession
	if err := database.DB.Where("id = ?", sessionID).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	now := time.Now()
	session.Score = req.Score
	session.Data = req.Data
	session.CompletedAt = &now

	if err := database.DB.Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete session"})
		return
	}

	c.JSON(http.StatusOK, session)
}

// === UTILITY FUNCTIONS ===

// calculateLevel обчислює рівень на основі досвіду
func calculateLevel(experience int) int {
	// Формула: level = floor(sqrt(experience / 100)) + 1
	level := 1
	for level*level*100 <= experience {
		level++
	}
	return level
}
