export interface GameSession {
  id: string;
  playerId: number;
  gameType: 'quiz' | 'battle' | 'exploration';
  startedAt: Date;
  completedAt?: Date;
  score: number;
  data: any; // Специфічні дані для кожного типу гри
}

export interface QuizQuestion {
  id: number;
  category: 'characters' | 'planets' | 'starships' | 'organizations' | 'weapons' | 'films' | 'species';
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  difficulty: 1 | 2 | 3; // easy, medium, hard
  points: number;
  hint?: string;
  explanation?: string;
}

export interface QuizSession extends GameSession {
  gameType: 'quiz';
  data: {
    category: string;
    difficulty: number;
    questionsAnswered: number;
    correctAnswers: number;
    currentStreak: number;
    bestStreak: number;
    timeRemaining: number;
    hintsUsed: number;
    questions: QuizQuestion[];
    answers: QuizAnswer[];
  };
}

export interface QuizAnswer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}

export interface GameCard {
  id: number;
  entityType: 'character' | 'planet' | 'starship' | 'organization' | 'weapon';
  entityId: number;
  name: string;
  description: string;
  imageUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  powerLevel: number;
  specialAbilities: string[];
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    special?: number;
  };
}

export interface PlayerCard {
  id: number;
  playerId: number;
  cardId: number;
  card: GameCard;
  quantity: number;
  obtainedAt: Date;
  isNew?: boolean;
}

export interface CardPack {
  id: number;
  name: string;
  description: string;
  cost: number;
  cardCount: number;
  guaranteedRarity?: 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
}

export interface Battle {
  id: number;
  player1Id: number;
  player2Id?: number; // null для битв з AI
  winnerId?: number;
  battleData: {
    player1Team: GameCard[];
    player2Team: GameCard[];
    turns: BattleTurn[];
    duration: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface BattleTurn {
  turnNumber: number;
  playerId: number;
  action: 'attack' | 'defend' | 'special';
  targetCardId?: number;
  damage?: number;
  effect?: string;
}

export interface Artifact {
  id: number;
  name: string;
  description: string;
  type: 'weapon' | 'technology' | 'force' | 'knowledge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: {
    type: 'stat_boost' | 'ability_unlock' | 'experience_bonus' | 'credits_bonus';
    value: number;
    duration?: number; // в хвилинах, null для постійного ефекту
  };
  imageUrl?: string;
}

export interface Planet {
  id: number;
  name: string;
  description: string;
  climate: string;
  terrain: string;
  population: string;
  imageUrl?: string;
  visitCost: number; // енергія для відвідування
  artifacts: Artifact[];
  isUnlocked: boolean;
}

export interface GalaxyMap {
  systems: GalaxySystem[];
  playerPosition: {
    systemId: number;
    planetId: number;
  };
}

export interface GalaxySystem {
  id: number;
  name: string;
  description: string;
  planets: Planet[];
  isUnlocked: boolean;
  unlockRequirement?: {
    level?: number;
    achievement?: string;
    credits?: number;
  };
}
