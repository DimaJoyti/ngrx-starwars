export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  answers: string[];
  difficulty: number;
  points: number;
  hint?: string;
}

export interface QuizSession {
  id: string;
  player_id: number;
  category?: string;
  difficulty?: number;
  score: number;
  questions_answered: number;
  correct_answers: number;
  current_streak: number;
  best_streak: number;
  hints_used: number;
  started_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  question_id: number;
  selected_answer: string;
  time_spent: number;
}

export interface QuizAnswerResponse {
  is_correct: boolean;
  correct_answer: string;
  points_earned: number;
  current_score: number;
  current_streak: number;
  explanation?: string;
}

export interface QuizSessionResult {
  session: QuizSession;
  experience_gained: number;
  final_score: number;
  accuracy: number;
}

export interface QuizLeaderboardEntry {
  player_id: number;
  username: string;
  best_score: number;
  total_games: number;
  accuracy: number;
}

export interface QuizGameState {
  currentQuestion?: QuizQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  session?: QuizSession;
  timeLeft: number;
  isAnswered: boolean;
  showExplanation: boolean;
  selectedAnswer?: string;
  lastAnswerResult?: QuizAnswerResponse;
  categories: string[];
  selectedCategory?: string;
  selectedDifficulty: number;
  isGameActive: boolean;
  isLoading: boolean;
}

export const QUIZ_CATEGORIES = [
  { value: '', label: 'Всі категорії', icon: '🌌' },
  { value: 'characters', label: 'Персонажі', icon: '👥' },
  { value: 'planets', label: 'Планети', icon: '🪐' },
  { value: 'starships', label: 'Кораблі', icon: '🚀' },
  { value: 'organizations', label: 'Організації', icon: '⚔️' },
  { value: 'weapons', label: 'Зброя', icon: '⚡' },
  { value: 'films', label: 'Фільми', icon: '🎬' }
];

export const QUIZ_DIFFICULTIES = [
  { value: 0, label: 'Всі рівні', color: 'text-gray-500', points: 'Змішані очки' },
  { value: 1, label: 'Легкий', color: 'text-green-500', points: '10 очок' },
  { value: 2, label: 'Середній', color: 'text-yellow-500', points: '15 очок' },
  { value: 3, label: 'Важкий', color: 'text-red-500', points: '20 очок' }
];

export const QUIZ_SETTINGS = {
  QUESTION_TIME_LIMIT: 30, // секунд
  QUESTIONS_PER_GAME: 10,
  SPEED_BONUS_THRESHOLD: 10, // секунд для бонусу за швидкість
  SPEED_BONUS_POINTS: 5
};
