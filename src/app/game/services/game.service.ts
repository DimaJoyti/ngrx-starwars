import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Player {
  id: number;
  username: string;
  email: string;
  level: number;
  experience: number;
  credits: number;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  player_id: number;
  total_games_played: number;
  total_score: number;
  best_score: number;
  correct_answers: number;
  total_questions: number;
  best_streak: number;
  current_streak: number;
  cards_collected: number;
  battles_won: number;
  battles_lost: number;
  planets_visited: number;
  artifacts_found: number;
  accuracy: number;
  average_score: number;
}

export interface GameSession {
  id: string;
  player_id: number;
  game_type: string;
  score: number;
  duration: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/game';
  
  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  public currentPlayer$ = this.currentPlayerSubject.asObservable();

  constructor(private http: HttpClient) {
    // Завантажуємо поточного гравця при ініціалізації
    this.loadCurrentPlayer();
  }

  // === PLAYER METHODS ===

  createPlayer(username: string, email: string): Observable<Player> {
    const body = { username, email };
    return this.http.post<Player>(`${this.apiUrl}/player/create`, body);
  }

  getPlayer(playerId: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/player/${playerId}`);
  }

  updatePlayer(playerId: number, updates: Partial<Player>): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/player/${playerId}`, updates);
  }

  getPlayerStats(playerId: number): Observable<PlayerStats> {
    return this.http.get<PlayerStats>(`${this.apiUrl}/player/${playerId}/stats`);
  }

  addExperience(playerId: number, experience: number): Observable<{message: string, new_level?: number}> {
    const body = { experience };
    return this.http.post<{message: string, new_level?: number}>(`${this.apiUrl}/player/${playerId}/experience`, body);
  }

  addCredits(playerId: number, credits: number): Observable<{message: string}> {
    const body = { credits };
    return this.http.post<{message: string}>(`${this.apiUrl}/player/${playerId}/credits`, body);
  }

  // === GAME SESSION METHODS ===

  createGameSession(playerId: number, gameType: string): Observable<GameSession> {
    const body = { player_id: playerId, game_type: gameType };
    return this.http.post<GameSession>(`${this.apiUrl}/session/create`, body);
  }

  completeGameSession(sessionId: string, score: number): Observable<GameSession> {
    const body = { score };
    return this.http.put<GameSession>(`${this.apiUrl}/session/${sessionId}/complete`, body);
  }

  // === UTILITY METHODS ===

  getCurrentPlayer(): Player | null {
    return this.currentPlayerSubject.value;
  }

  setCurrentPlayer(player: Player): void {
    this.currentPlayerSubject.next(player);
    // Зберігаємо в localStorage для збереження між сесіями
    localStorage.setItem('currentPlayer', JSON.stringify(player));
  }

  private loadCurrentPlayer(): void {
    const savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
      try {
        const player = JSON.parse(savedPlayer);
        this.currentPlayerSubject.next(player);
      } catch (error) {
        console.error('Помилка завантаження збереженого гравця:', error);
        localStorage.removeItem('currentPlayer');
      }
    }
  }

  logout(): void {
    this.currentPlayerSubject.next(null);
    localStorage.removeItem('currentPlayer');
  }

  // === LEVEL CALCULATION ===

  calculateLevel(experience: number): number {
    // Формула: рівень = floor(sqrt(досвід / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  getExperienceForLevel(level: number): number {
    // Зворотна формула: досвід = (рівень - 1)² * 100
    return Math.pow(level - 1, 2) * 100;
  }

  getExperienceForNextLevel(currentLevel: number): number {
    return this.getExperienceForLevel(currentLevel + 1);
  }

  getExperienceProgress(currentExperience: number, currentLevel: number): number {
    const currentLevelExp = this.getExperienceForLevel(currentLevel);
    const nextLevelExp = this.getExperienceForLevel(currentLevel + 1);
    const progressExp = currentExperience - currentLevelExp;
    const totalExpNeeded = nextLevelExp - currentLevelExp;
    
    return Math.min(100, Math.max(0, (progressExp / totalExpNeeded) * 100));
  }

  // === DEMO METHODS ===

  // Створює демо-гравця для тестування
  createDemoPlayer(): Observable<Player> {
    const demoUsername = `DemoPlayer_${Date.now()}`;
    const demoEmail = `demo_${Date.now()}@example.com`;
    
    return this.createPlayer(demoUsername, demoEmail).pipe(
      map(player => {
        this.setCurrentPlayer(player);
        return player;
      })
    );
  }

  // Завантажує або створює тестового гравця
  ensureTestPlayer(): Observable<Player> {
    const currentPlayer = this.getCurrentPlayer();
    
    if (currentPlayer) {
      // Перевіряємо, чи гравець все ще існує на сервері
      return this.getPlayer(currentPlayer.id).pipe(
        map(player => {
          this.setCurrentPlayer(player);
          return player;
        })
      );
    } else {
      // Створюємо нового демо-гравця
      return this.createDemoPlayer();
    }
  }
}
