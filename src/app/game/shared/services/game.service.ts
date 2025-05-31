import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';

import {
  GameSession,
  QuizQuestion,
  GameCard,
  CardPack,
  Battle,
  Artifact,
  GalaxyMap
} from '../models/game.model';
import { Player, PlayerStats, Achievement } from '../models/player.model';
import { ErrorHandlerService } from '../../../shared/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/game/';
  private readonly timeout = 10000;
  private readonly retryAttempts = 2;

  // Поточний гравець
  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  public currentPlayer$ = this.currentPlayerSubject.asObservable();

  // Поточна сесія гри
  private currentSessionSubject = new BehaviorSubject<GameSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.loadCurrentPlayer();
  }

  // === PLAYER MANAGEMENT ===

  /**
   * Завантажити поточного гравця
   */
  private loadCurrentPlayer(): void {
    const savedPlayer = localStorage.getItem('starwars_game_player');
    if (savedPlayer) {
      try {
        const player = JSON.parse(savedPlayer);
        this.currentPlayerSubject.next(player);
      } catch (error) {
        console.error('Error loading saved player:', error);
        localStorage.removeItem('starwars_game_player');
      }
    }
  }

  /**
   * Створити нового гравця
   */
  createPlayer(username: string, email?: string): Observable<Player> {
    const playerData = { username, email };
    
    return this.http.post<Player>(`${this.baseUrl}player/create`, playerData)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        tap(player => {
          this.currentPlayerSubject.next(player);
          localStorage.setItem('starwars_game_player', JSON.stringify(player));
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Отримати профіль гравця
   */
  getPlayerProfile(playerId: number): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}player/${playerId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Оновити профіль гравця
   */
  updatePlayerProfile(playerId: number, updates: Partial<Player>): Observable<Player> {
    return this.http.put<Player>(`${this.baseUrl}player/${playerId}`, updates)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        tap(player => {
          this.currentPlayerSubject.next(player);
          localStorage.setItem('starwars_game_player', JSON.stringify(player));
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Отримати статистику гравця
   */
  getPlayerStats(playerId: number): Observable<PlayerStats> {
    return this.http.get<PlayerStats>(`${this.baseUrl}player/${playerId}/stats`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Отримати досягнення гравця
   */
  getPlayerAchievements(playerId: number): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.baseUrl}player/${playerId}/achievements`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // === GAME SESSION MANAGEMENT ===

  /**
   * Створити нову ігрову сесію
   */
  createGameSession(gameType: string, data?: any): Observable<GameSession> {
    const sessionData = { gameType, data };
    
    return this.http.post<GameSession>(`${this.baseUrl}session/create`, sessionData)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        tap(session => this.currentSessionSubject.next(session)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Завершити ігрову сесію
   */
  completeGameSession(sessionId: string, finalData: any): Observable<GameSession> {
    return this.http.put<GameSession>(`${this.baseUrl}session/${sessionId}/complete`, finalData)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        tap(() => this.currentSessionSubject.next(null)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // === UTILITY METHODS ===

  /**
   * Отримати поточного гравця
   */
  getCurrentPlayer(): Player | null {
    return this.currentPlayerSubject.value;
  }

  /**
   * Перевірити, чи гравець увійшов в систему
   */
  isPlayerLoggedIn(): boolean {
    return this.currentPlayerSubject.value !== null;
  }

  /**
   * Вийти з гри
   */
  logout(): void {
    this.currentPlayerSubject.next(null);
    this.currentSessionSubject.next(null);
    localStorage.removeItem('starwars_game_player');
  }

  /**
   * Додати досвід гравцю
   */
  addExperience(playerId: number, experience: number): Observable<Player> {
    return this.http.post<Player>(`${this.baseUrl}player/${playerId}/experience`, { experience })
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        tap(player => {
          this.currentPlayerSubject.next(player);
          localStorage.setItem('starwars_game_player', JSON.stringify(player));
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Додати кредити гравцю
   */
  addCredits(playerId: number, credits: number): Observable<Player> {
    return this.http.post<Player>(`${this.baseUrl}player/${playerId}/credits`, { credits })
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        tap(player => {
          this.currentPlayerSubject.next(player);
          localStorage.setItem('starwars_game_player', JSON.stringify(player));
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }
}
