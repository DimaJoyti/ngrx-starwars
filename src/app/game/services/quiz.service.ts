import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  QuizQuestion, 
  QuizSession, 
  QuizAnswer, 
  QuizAnswerResponse, 
  QuizSessionResult, 
  QuizLeaderboardEntry,
  QuizGameState,
  QUIZ_SETTINGS
} from '../models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/game/quiz';
  
  private gameStateSubject = new BehaviorSubject<QuizGameState>({
    currentQuestionIndex: 0,
    totalQuestions: QUIZ_SETTINGS.QUESTIONS_PER_GAME,
    timeLeft: QUIZ_SETTINGS.QUESTION_TIME_LIMIT,
    isAnswered: false,
    showExplanation: false,
    categories: [],
    selectedDifficulty: 1,
    isGameActive: false,
    isLoading: false
  });

  public gameState$ = this.gameStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Отримати питання для вікторини
  getQuestions(category?: string, difficulty?: number, limit: number = 1): Observable<QuizQuestion[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (category) {
      params = params.set('category', category);
    }
    
    if (difficulty && difficulty > 0) {
      params = params.set('difficulty', difficulty.toString());
    }

    return this.http.get<{questions: QuizQuestion[]}>(`${this.apiUrl}/questions`, { params })
      .pipe(map(response => response.questions || []));
  }

  // Отримати категорії питань
  getCategories(): Observable<string[]> {
    return this.http.get<{categories: string[]}>(`${this.apiUrl}/categories`)
      .pipe(map(response => response.categories || []));
  }

  // Створити нову сесію вікторини
  createQuizSession(playerId: number, category?: string, difficulty?: number): Observable<QuizSession> {
    const body = {
      player_id: playerId,
      category: category || undefined,
      difficulty: difficulty || 1
    };

    return this.http.post<QuizSession>(`${this.apiUrl}/session/create`, body);
  }

  // Відправити відповідь на питання
  submitAnswer(sessionId: string, answer: QuizAnswer): Observable<QuizAnswerResponse> {
    return this.http.post<QuizAnswerResponse>(`${this.apiUrl}/session/${sessionId}/answer`, answer);
  }

  // Завершити сесію вікторини
  completeQuizSession(sessionId: string): Observable<QuizSessionResult> {
    return this.http.put<QuizSessionResult>(`${this.apiUrl}/session/${sessionId}/complete`, {});
  }

  // Отримати таблицю лідерів
  getLeaderboard(limit: number = 10): Observable<QuizLeaderboardEntry[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{leaderboard: QuizLeaderboardEntry[]}>(`${this.apiUrl}/leaderboard`, { params })
      .pipe(map(response => response.leaderboard || []));
  }

  // Методи для управління станом гри
  updateGameState(updates: Partial<QuizGameState>): void {
    const currentState = this.gameStateSubject.value;
    this.gameStateSubject.next({ ...currentState, ...updates });
  }

  getCurrentGameState(): QuizGameState {
    return this.gameStateSubject.value;
  }

  resetGameState(): void {
    this.gameStateSubject.next({
      currentQuestionIndex: 0,
      totalQuestions: QUIZ_SETTINGS.QUESTIONS_PER_GAME,
      timeLeft: QUIZ_SETTINGS.QUESTION_TIME_LIMIT,
      isAnswered: false,
      showExplanation: false,
      categories: [],
      selectedDifficulty: 1,
      isGameActive: false,
      isLoading: false
    });
  }

  // Почати нову гру
  startNewGame(playerId: number, category?: string, difficulty?: number): Observable<{session: QuizSession, question: QuizQuestion}> {
    this.updateGameState({ isLoading: true });
    
    return new Observable(observer => {
      // Створюємо сесію
      this.createQuizSession(playerId, category, difficulty).subscribe({
        next: (session) => {
          // Отримуємо перше питання
          this.getQuestions(category, difficulty, 1).subscribe({
            next: (questions) => {
              if (questions.length > 0) {
                this.updateGameState({
                  session,
                  currentQuestion: questions[0],
                  currentQuestionIndex: 0,
                  isGameActive: true,
                  isLoading: false,
                  timeLeft: QUIZ_SETTINGS.QUESTION_TIME_LIMIT,
                  isAnswered: false,
                  showExplanation: false,
                  selectedCategory: category,
                  selectedDifficulty: difficulty || 1
                });
                
                observer.next({ session, question: questions[0] });
                observer.complete();
              } else {
                observer.error('Не вдалося отримати питання');
              }
            },
            error: (error) => {
              this.updateGameState({ isLoading: false });
              observer.error(error);
            }
          });
        },
        error: (error) => {
          this.updateGameState({ isLoading: false });
          observer.error(error);
        }
      });
    });
  }

  // Отримати наступне питання
  getNextQuestion(): Observable<QuizQuestion | null> {
    const state = this.getCurrentGameState();
    
    if (!state.session || state.currentQuestionIndex >= QUIZ_SETTINGS.QUESTIONS_PER_GAME - 1) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    return this.getQuestions(state.selectedCategory, state.selectedDifficulty, 1)
      .pipe(map(questions => {
        if (questions.length > 0) {
          const nextIndex = state.currentQuestionIndex + 1;
          this.updateGameState({
            currentQuestion: questions[0],
            currentQuestionIndex: nextIndex,
            timeLeft: QUIZ_SETTINGS.QUESTION_TIME_LIMIT,
            isAnswered: false,
            showExplanation: false,
            selectedAnswer: undefined,
            lastAnswerResult: undefined
          });
          return questions[0];
        }
        return null;
      }));
  }

  // Обробити відповідь гравця
  processAnswer(selectedAnswer: string, timeSpent: number): Observable<QuizAnswerResponse> {
    const state = this.getCurrentGameState();
    
    if (!state.session || !state.currentQuestion) {
      throw new Error('Немає активної сесії або питання');
    }

    const answer: QuizAnswer = {
      question_id: state.currentQuestion.id,
      selected_answer: selectedAnswer,
      time_spent: timeSpent
    };

    return this.submitAnswer(state.session.id, answer).pipe(
      map(response => {
        this.updateGameState({
          isAnswered: true,
          selectedAnswer,
          lastAnswerResult: response,
          showExplanation: true
        });
        return response;
      })
    );
  }

  // Завершити поточну гру
  finishGame(): Observable<QuizSessionResult> {
    const state = this.getCurrentGameState();
    
    if (!state.session) {
      throw new Error('Немає активної сесії');
    }

    return this.completeQuizSession(state.session.id).pipe(
      map(result => {
        this.updateGameState({
          isGameActive: false,
          showExplanation: false
        });
        return result;
      })
    );
  }
}
