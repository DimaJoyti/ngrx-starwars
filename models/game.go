package models

import (
	"encoding/json"
	"time"
)

// Player представляє гравця в грі
type Player struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Username   string    `json:"username" gorm:"uniqueIndex;not null"`
	Email      string    `json:"email" gorm:"index"`
	Level      int       `json:"level" gorm:"default:1"`
	Experience int       `json:"experience" gorm:"default:0"`
	Credits    int       `json:"credits" gorm:"default:100"`
	Avatar     string    `json:"avatar"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// PlayerStats представляє статистику гравця
type PlayerStats struct {
	PlayerID         uint `json:"player_id" gorm:"primaryKey"`
	TotalGamesPlayed int  `json:"total_games_played" gorm:"default:0"`
	TotalScore       int  `json:"total_score" gorm:"default:0"`
	BestScore        int  `json:"best_score" gorm:"default:0"`
	CorrectAnswers   int  `json:"correct_answers" gorm:"default:0"`
	TotalQuestions   int  `json:"total_questions" gorm:"default:0"`
	CurrentStreak    int  `json:"current_streak" gorm:"default:0"`
	BestStreak       int  `json:"best_streak" gorm:"default:0"`
	CardsCollected   int  `json:"cards_collected" gorm:"default:0"`
	BattlesWon       int  `json:"battles_won" gorm:"default:0"`
	BattlesLost      int  `json:"battles_lost" gorm:"default:0"`
	PlanetsVisited   int  `json:"planets_visited" gorm:"default:0"`
	ArtifactsFound   int  `json:"artifacts_found" gorm:"default:0"`
	Player           Player `json:"player" gorm:"foreignKey:PlayerID"`
}

// QuizQuestion представляє питання для вікторини
type QuizQuestion struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	Category      string `json:"category" gorm:"not null"` // characters, planets, starships, etc.
	Question      string `json:"question" gorm:"not null"`
	CorrectAnswer string `json:"correct_answer" gorm:"not null"`
	WrongAnswers  string `json:"wrong_answers" gorm:"type:json"` // JSON array
	Difficulty    int    `json:"difficulty" gorm:"default:1"`    // 1-easy, 2-medium, 3-hard
	Points        int    `json:"points" gorm:"default:10"`
	Hint          string `json:"hint"`
	Explanation   string `json:"explanation"`
}

// GetWrongAnswersArray повертає неправильні відповіді як масив
func (q *QuizQuestion) GetWrongAnswersArray() []string {
	var answers []string
	if q.WrongAnswers != "" {
		json.Unmarshal([]byte(q.WrongAnswers), &answers)
	}
	return answers
}

// SetWrongAnswersArray встановлює неправильні відповіді з масиву
func (q *QuizQuestion) SetWrongAnswersArray(answers []string) error {
	data, err := json.Marshal(answers)
	if err != nil {
		return err
	}
	q.WrongAnswers = string(data)
	return nil
}

// GameSession представляє ігрову сесію
type GameSession struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	PlayerID    uint      `json:"player_id" gorm:"not null"`
	GameType    string    `json:"game_type" gorm:"not null"` // quiz, battle, exploration
	Score       int       `json:"score" gorm:"default:0"`
	Data        string    `json:"data" gorm:"type:json"` // JSON data specific to game type
	StartedAt   time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at"`
	Player      Player    `json:"player" gorm:"foreignKey:PlayerID"`
}

// GameCard представляє ігрову картку
type GameCard struct {
	ID               uint   `json:"id" gorm:"primaryKey"`
	EntityType       string `json:"entity_type" gorm:"not null"` // character, planet, starship, etc.
	EntityID         uint   `json:"entity_id" gorm:"not null"`
	Name             string `json:"name" gorm:"not null"`
	Description      string `json:"description"`
	ImageURL         string `json:"image_url"`
	Rarity           string `json:"rarity" gorm:"default:'common'"` // common, rare, epic, legendary
	PowerLevel       int    `json:"power_level" gorm:"default:50"`
	SpecialAbilities string `json:"special_abilities" gorm:"type:json"` // JSON array
	Stats            string `json:"stats" gorm:"type:json"`             // JSON object with attack, defense, etc.
}

// GetSpecialAbilitiesArray повертає спеціальні здібності як масив
func (c *GameCard) GetSpecialAbilitiesArray() []string {
	var abilities []string
	if c.SpecialAbilities != "" {
		json.Unmarshal([]byte(c.SpecialAbilities), &abilities)
	}
	return abilities
}

// SetSpecialAbilitiesArray встановлює спеціальні здібності з масиву
func (c *GameCard) SetSpecialAbilitiesArray(abilities []string) error {
	data, err := json.Marshal(abilities)
	if err != nil {
		return err
	}
	c.SpecialAbilities = string(data)
	return nil
}

// CardStats представляє статистики картки
type CardStats struct {
	Attack  int `json:"attack"`
	Defense int `json:"defense"`
	Speed   int `json:"speed"`
	Special int `json:"special"`
}

// GetStatsObject повертає статистики як об'єкт
func (c *GameCard) GetStatsObject() CardStats {
	var stats CardStats
	if c.Stats != "" {
		json.Unmarshal([]byte(c.Stats), &stats)
	}
	return stats
}

// SetStatsObject встановлює статистики з об'єкта
func (c *GameCard) SetStatsObject(stats CardStats) error {
	data, err := json.Marshal(stats)
	if err != nil {
		return err
	}
	c.Stats = string(data)
	return nil
}

// PlayerCard представляє картку в колекції гравця
type PlayerCard struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	PlayerID   uint      `json:"player_id" gorm:"not null"`
	CardID     uint      `json:"card_id" gorm:"not null"`
	Quantity   int       `json:"quantity" gorm:"default:1"`
	ObtainedAt time.Time `json:"obtained_at"`
	Player     Player    `json:"player" gorm:"foreignKey:PlayerID"`
	Card       GameCard  `json:"card" gorm:"foreignKey:CardID"`
}

// CardPack представляє пакет карток
type CardPack struct {
	ID                uint   `json:"id" gorm:"primaryKey"`
	Name              string `json:"name" gorm:"not null"`
	Description       string `json:"description"`
	Cost              int    `json:"cost" gorm:"not null"`
	CardCount         int    `json:"card_count" gorm:"default:3"`
	GuaranteedRarity  string `json:"guaranteed_rarity"` // rare, epic, legendary
	ImageURL          string `json:"image_url"`
}

// Battle представляє битву між гравцями
type Battle struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	Player1ID   uint       `json:"player1_id" gorm:"not null"`
	Player2ID   *uint      `json:"player2_id"` // NULL для битв з AI
	WinnerID    *uint      `json:"winner_id"`
	BattleData  string     `json:"battle_data" gorm:"type:json"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`
	Player1     Player     `json:"player1" gorm:"foreignKey:Player1ID"`
	Player2     *Player    `json:"player2" gorm:"foreignKey:Player2ID"`
	Winner      *Player    `json:"winner" gorm:"foreignKey:WinnerID"`
}

// Artifact представляє артефакт для збору
type Artifact struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`
	Type        string `json:"type" gorm:"not null"` // weapon, technology, force, knowledge
	Rarity      string `json:"rarity" gorm:"default:'common'"`
	Effect      string `json:"effect" gorm:"type:json"` // JSON object with effect details
	ImageURL    string `json:"image_url"`
}

// PlayerArtifact представляє артефакт в колекції гравця
type PlayerArtifact struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	PlayerID   uint      `json:"player_id" gorm:"not null"`
	ArtifactID uint      `json:"artifact_id" gorm:"not null"`
	ObtainedAt time.Time `json:"obtained_at"`
	Player     Player    `json:"player" gorm:"foreignKey:PlayerID"`
	Artifact   Artifact  `json:"artifact" gorm:"foreignKey:ArtifactID"`
}

// Achievement представляє досягнення
type Achievement struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Category    string `json:"category" gorm:"not null"` // quiz, collection, battle, exploration
	Requirement int    `json:"requirement" gorm:"default:1"`
	Reward      string `json:"reward" gorm:"type:json"` // JSON object with reward details
}

// PlayerAchievement представляє досягнення гравця
type PlayerAchievement struct {
	ID            uint        `json:"id" gorm:"primaryKey"`
	PlayerID      uint        `json:"player_id" gorm:"not null"`
	AchievementID uint        `json:"achievement_id" gorm:"not null"`
	UnlockedAt    time.Time   `json:"unlocked_at"`
	Player        Player      `json:"player" gorm:"foreignKey:PlayerID"`
	Achievement   Achievement `json:"achievement" gorm:"foreignKey:AchievementID"`
}

// QuizSession представляє сесію вікторини
type QuizSession struct {
	ID               string     `json:"id" gorm:"primaryKey"`
	PlayerID         uint       `json:"player_id" gorm:"not null"`
	Category         string     `json:"category"`
	Difficulty       int        `json:"difficulty" gorm:"default:1"`
	Score            int        `json:"score" gorm:"default:0"`
	QuestionsAnswered int       `json:"questions_answered" gorm:"default:0"`
	CorrectAnswers   int        `json:"correct_answers" gorm:"default:0"`
	CurrentStreak    int        `json:"current_streak" gorm:"default:0"`
	BestStreak       int        `json:"best_streak" gorm:"default:0"`
	HintsUsed        int        `json:"hints_used" gorm:"default:0"`
	StartedAt        time.Time  `json:"started_at"`
	CompletedAt      *time.Time `json:"completed_at"`
	Player           Player     `json:"player" gorm:"foreignKey:PlayerID"`
}

// QuizAnswer представляє відповідь на питання
type QuizAnswer struct {
	ID             uint         `json:"id" gorm:"primaryKey"`
	SessionID      string       `json:"session_id" gorm:"not null"`
	QuestionID     uint         `json:"question_id" gorm:"not null"`
	SelectedAnswer string       `json:"selected_answer"`
	IsCorrect      bool         `json:"is_correct"`
	TimeSpent      int          `json:"time_spent"` // в секундах
	PointsEarned   int          `json:"points_earned" gorm:"default:0"`
	AnsweredAt     time.Time    `json:"answered_at"`
	Session        QuizSession  `json:"session" gorm:"foreignKey:SessionID"`
	Question       QuizQuestion `json:"question" gorm:"foreignKey:QuestionID"`
}
