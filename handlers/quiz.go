package handlers

import (
	"net/http"
	"strconv"
	"time"
	"math/rand"

	"starwars-api/database"
	"starwars-api/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// === QUIZ QUESTION HANDLERS ===

// GetQuizQuestions отримує питання для вікторини
func GetQuizQuestions(c *gin.Context) {
	category := c.Query("category")
	difficulty := c.Query("difficulty")
	limitStr := c.DefaultQuery("limit", "10")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 50 {
		limit = 10
	}

	query := database.DB.Model(&models.QuizQuestion{})
	
	if category != "" {
		query = query.Where("category = ?", category)
	}
	
	if difficulty != "" {
		if diff, err := strconv.Atoi(difficulty); err == nil && diff >= 1 && diff <= 3 {
			query = query.Where("difficulty = ?", diff)
		}
	}

	var questions []models.QuizQuestion
	if err := query.Order("RANDOM()").Limit(limit).Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
		return
	}

	// Перемішуємо відповіді для кожного питання
	for i := range questions {
		wrongAnswers := questions[i].GetWrongAnswersArray()
		allAnswers := append(wrongAnswers, questions[i].CorrectAnswer)
		
		// Перемішуємо відповіді
		rand.Shuffle(len(allAnswers), func(i, j int) {
			allAnswers[i], allAnswers[j] = allAnswers[j], allAnswers[i]
		})
		
		// Створюємо відповідь без правильної відповіді (для безпеки)
		response := gin.H{
			"id":          questions[i].ID,
			"category":    questions[i].Category,
			"question":    questions[i].Question,
			"answers":     allAnswers,
			"difficulty":  questions[i].Difficulty,
			"points":      questions[i].Points,
			"hint":        questions[i].Hint,
		}
		
		if i == 0 {
			c.JSON(http.StatusOK, gin.H{
				"questions": []gin.H{response},
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"questions": []gin.H{}})
}

// GetQuizCategories отримує доступні категорії питань
func GetQuizCategories(c *gin.Context) {
	var categories []string
	if err := database.DB.Model(&models.QuizQuestion{}).
		Distinct("category").
		Pluck("category", &categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

// === QUIZ SESSION HANDLERS ===

// CreateQuizSession створює нову сесію вікторини
func CreateQuizSession(c *gin.Context) {
	var req struct {
		PlayerID   uint   `json:"player_id" binding:"required"`
		Category   string `json:"category"`
		Difficulty int    `json:"difficulty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Перевіряємо, чи існує гравець
	var player models.Player
	if err := database.DB.First(&player, req.PlayerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	session := models.QuizSession{
		ID:         uuid.New().String(),
		PlayerID:   req.PlayerID,
		Category:   req.Category,
		Difficulty: req.Difficulty,
		StartedAt:  time.Now(),
	}

	if err := database.DB.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create quiz session"})
		return
	}

	c.JSON(http.StatusCreated, session)
}

// SubmitQuizAnswer обробляє відповідь на питання
func SubmitQuizAnswer(c *gin.Context) {
	sessionID := c.Param("sessionId")
	
	var req struct {
		QuestionID     uint   `json:"question_id" binding:"required"`
		SelectedAnswer string `json:"selected_answer" binding:"required"`
		TimeSpent      int    `json:"time_spent"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Знаходимо сесію
	var session models.QuizSession
	if err := database.DB.Where("id = ?", sessionID).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Quiz session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Знаходимо питання
	var question models.QuizQuestion
	if err := database.DB.First(&question, req.QuestionID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Перевіряємо правильність відповіді
	isCorrect := req.SelectedAnswer == question.CorrectAnswer
	pointsEarned := 0
	if isCorrect {
		pointsEarned = question.Points
		// Бонус за швидкість (якщо відповів швидко)
		if req.TimeSpent < 10 {
			pointsEarned += 5
		}
	}

	// Створюємо запис відповіді
	answer := models.QuizAnswer{
		SessionID:      sessionID,
		QuestionID:     req.QuestionID,
		SelectedAnswer: req.SelectedAnswer,
		IsCorrect:      isCorrect,
		TimeSpent:      req.TimeSpent,
		PointsEarned:   pointsEarned,
		AnsweredAt:     time.Now(),
	}

	if err := database.DB.Create(&answer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save answer"})
		return
	}

	// Оновлюємо статистику сесії
	session.QuestionsAnswered++
	session.Score += pointsEarned
	if isCorrect {
		session.CorrectAnswers++
		session.CurrentStreak++
		if session.CurrentStreak > session.BestStreak {
			session.BestStreak = session.CurrentStreak
		}
	} else {
		session.CurrentStreak = 0
	}

	if err := database.DB.Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update session"})
		return
	}

	response := gin.H{
		"is_correct":      isCorrect,
		"correct_answer":  question.CorrectAnswer,
		"points_earned":   pointsEarned,
		"current_score":   session.Score,
		"current_streak":  session.CurrentStreak,
		"explanation":     question.Explanation,
	}

	c.JSON(http.StatusOK, response)
}

// CompleteQuizSession завершує сесію вікторини
func CompleteQuizSession(c *gin.Context) {
	sessionID := c.Param("sessionId")

	var session models.QuizSession
	if err := database.DB.Where("id = ?", sessionID).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Quiz session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Завершуємо сесію
	now := time.Now()
	session.CompletedAt = &now

	if err := database.DB.Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete session"})
		return
	}

	// Оновлюємо статистику гравця
	var stats models.PlayerStats
	if err := database.DB.Where("player_id = ?", session.PlayerID).First(&stats).Error; err != nil {
		// Створюємо статистику, якщо її немає
		stats = models.PlayerStats{PlayerID: session.PlayerID}
	}

	stats.TotalGamesPlayed++
	stats.TotalScore += session.Score
	stats.CorrectAnswers += session.CorrectAnswers
	stats.TotalQuestions += session.QuestionsAnswered
	if session.Score > stats.BestScore {
		stats.BestScore = session.Score
	}
	if session.BestStreak > stats.BestStreak {
		stats.BestStreak = session.BestStreak
	}

	if err := database.DB.Save(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update player stats"})
		return
	}

	// Додаємо досвід гравцю
	experienceGained := session.Score / 10 // 1 досвід за кожні 10 очок
	if experienceGained > 0 {
		var player models.Player
		if err := database.DB.First(&player, session.PlayerID).Error; err == nil {
			player.Experience += experienceGained
			newLevel := calculateLevel(player.Experience)
			if newLevel > player.Level {
				player.Level = newLevel
				player.Credits += (newLevel - player.Level) * 50 // Бонус за рівень
			}
			player.UpdatedAt = time.Now()
			database.DB.Save(&player)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"session":            session,
		"experience_gained":  experienceGained,
		"final_score":        session.Score,
		"accuracy":           float64(session.CorrectAnswers) / float64(session.QuestionsAnswered) * 100,
	})
}

// GetQuizLeaderboard отримує таблицю лідерів
func GetQuizLeaderboard(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 100 {
		limit = 10
	}

	var leaderboard []struct {
		PlayerID     uint   `json:"player_id"`
		Username     string `json:"username"`
		BestScore    int    `json:"best_score"`
		TotalGames   int    `json:"total_games"`
		Accuracy     float64 `json:"accuracy"`
	}

	if err := database.DB.Table("player_stats").
		Select("player_stats.player_id, players.username, player_stats.best_score, player_stats.total_games_played as total_games, CASE WHEN player_stats.total_questions > 0 THEN CAST(player_stats.correct_answers AS FLOAT) / player_stats.total_questions * 100 ELSE 0 END as accuracy").
		Joins("JOIN players ON players.id = player_stats.player_id").
		Where("player_stats.total_games_played > 0").
		Order("player_stats.best_score DESC").
		Limit(limit).
		Scan(&leaderboard).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
}
