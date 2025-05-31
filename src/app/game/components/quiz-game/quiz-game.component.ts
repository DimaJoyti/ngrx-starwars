import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { QuizService } from '../../services/quiz.service';
import { 
  QuizGameState, 
  QuizQuestion, 
  QuizAnswerResponse,
  QUIZ_CATEGORIES, 
  QUIZ_DIFFICULTIES,
  QUIZ_SETTINGS 
} from '../../models/quiz.models';

@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="quiz-game-container">
      <!-- Налаштування гри (показуємо коли гра не активна) -->
      <mat-card *ngIf="!gameState.isGameActive && !gameState.isLoading" class="game-setup-card">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon class="text-yellow-500">quiz</mat-icon>
            Галактична Вікторина
          </mat-card-title>
          <mat-card-subtitle>
            Перевірте свої знання про всесвіт Star Wars!
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="space-y-6">
          <!-- Вибір категорії -->
          <div>
            <label class="block text-sm font-medium mb-2">Категорія питань</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                *ngFor="let category of categories"
                (click)="onCategoryChange(category.value)"
                [class]="'category-button ' + (gameState.selectedCategory === category.value ? 'selected' : '')"
                class="p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105"
              >
                <div class="text-2xl mb-1">{{ category.icon }}</div>
                <div class="text-xs font-medium">{{ category.label }}</div>
              </button>
            </div>
          </div>

          <!-- Вибір складності -->
          <div>
            <label class="block text-sm font-medium mb-2">Рівень складності</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                *ngFor="let difficulty of difficulties"
                (click)="onDifficultyChange(difficulty.value)"
                [class]="'difficulty-button ' + (gameState.selectedDifficulty === difficulty.value ? 'selected' : '')"
                class="p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105"
              >
                <div [class]="difficulty.color" class="font-bold mb-1">{{ difficulty.label }}</div>
                <div class="text-xs">{{ difficulty.points }}</div>
              </button>
            </div>
          </div>

          <!-- Правила гри -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2">📋 Правила гри:</h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• {{ QUIZ_SETTINGS.QUESTIONS_PER_GAME }} питань за гру</li>
              <li>• {{ QUIZ_SETTINGS.QUESTION_TIME_LIMIT }} секунд на кожне питання</li>
              <li>• Бонус {{ QUIZ_SETTINGS.SPEED_BONUS_POINTS }} очок за швидку відповідь (менше {{ QUIZ_SETTINGS.SPEED_BONUS_THRESHOLD }} сек)</li>
              <li>• Досвід нараховується за набрані очки</li>
            </ul>
          </div>
        </mat-card-content>

        <mat-card-actions class="flex justify-center">
          <button
            mat-raised-button
            color="primary"
            (click)="startGame()"
            class="px-8 py-2 text-lg"
          >
            <mat-icon class="mr-2">play_arrow</mat-icon>
            Почати гру
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Завантаження -->
      <mat-card *ngIf="gameState.isLoading" class="loading-card">
        <mat-card-content class="text-center py-8">
          <mat-icon class="animate-spin text-4xl text-blue-500 mb-4">refresh</mat-icon>
          <p class="text-lg">Підготовка питань...</p>
        </mat-card-content>
      </mat-card>

      <!-- Активна гра -->
      <div *ngIf="gameState.isGameActive && gameState.currentQuestion" class="game-active">
        <!-- Прогрес гри -->
        <mat-card class="progress-card mb-4">
          <mat-card-content class="py-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium">
                Питання {{ gameState.currentQuestionIndex + 1 }} з {{ gameState.totalQuestions }}
              </span>
              <span class="text-sm font-medium">
                Очки: {{ gameState.session?.score || 0 }}
              </span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getProgressPercentage()"
              class="mb-3"
            ></mat-progress-bar>

            <!-- Таймер -->
            <div class="flex justify-between items-center">
              <span class="text-sm">Час:</span>
              <div class="flex items-center gap-2">
                <mat-progress-bar
                  mode="determinate"
                  [value]="getTimeProgressPercentage()"
                  [color]="gameState.timeLeft <= 10 ? 'warn' : 'primary'"
                  class="w-20"
                ></mat-progress-bar>
                <span [class]="gameState.timeLeft <= 10 ? 'text-red-500 font-bold' : 'text-gray-600'">
                  {{ gameState.timeLeft }}с
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Питання -->
        <mat-card class="question-card">
          <mat-card-header>
            <mat-card-title class="flex items-center gap-2">
              <span class="text-2xl">{{ getCategoryIcon(gameState.currentQuestion.category) }}</span>
              <span [class]="getDifficultyColor(gameState.currentQuestion.difficulty)">
                {{ gameState.currentQuestion.category | titlecase }}
              </span>
              <mat-chip [color]="gameState.currentQuestion.difficulty === 1 ? 'primary' : gameState.currentQuestion.difficulty === 2 ? 'accent' : 'warn'">
                {{ gameState.currentQuestion.points }} очок
              </mat-chip>
            </mat-card-title>
          </mat-card-header>

          <mat-card-content class="py-6">
            <h2 class="text-xl font-semibold mb-6 leading-relaxed">
              {{ gameState.currentQuestion.question }}
            </h2>

            <!-- Підказка -->
            <div *ngIf="gameState.currentQuestion.hint && gameState.timeLeft <= 15"
                 class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <div class="flex items-center">
                <mat-icon class="text-yellow-600 mr-2">lightbulb</mat-icon>
                <span class="text-sm text-yellow-800">
                  <strong>Підказка:</strong> {{ gameState.currentQuestion.hint }}
                </span>
              </div>
            </div>

            <!-- Варіанти відповідей -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                *ngFor="let answer of gameState.currentQuestion.answers; let i = index"
                (click)="selectAnswer(answer)"
                [disabled]="gameState.isAnswered"
                [class]="getAnswerButtonClass(answer)"
                class="p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-102 disabled:cursor-not-allowed"
              >
                <span class="font-medium mr-2">{{ getAnswerLetter(i) }}.</span>
                {{ answer }}
              </button>
            </div>

            <!-- Пояснення після відповіді -->
            <div *ngIf="gameState.showExplanation && gameState.lastAnswerResult"
                 class="mt-6 p-4 rounded-lg"
                 [class]="gameState.lastAnswerResult.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
              <div class="flex items-center mb-2">
                <mat-icon [class]="gameState.lastAnswerResult.is_correct ? 'text-green-600' : 'text-red-600'" class="mr-2">
                  {{ gameState.lastAnswerResult.is_correct ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <span class="font-semibold" [class]="gameState.lastAnswerResult.is_correct ? 'text-green-800' : 'text-red-800'">
                  {{ gameState.lastAnswerResult.is_correct ? 'Правильно!' : 'Неправильно!' }}
                </span>
                <span class="ml-auto font-bold">
                  +{{ gameState.lastAnswerResult.points_earned }} очок
                </span>
              </div>

              <p *ngIf="gameState.lastAnswerResult.explanation" class="text-sm text-gray-700 mb-2">
                {{ gameState.lastAnswerResult.explanation }}
              </p>

              <div class="text-sm text-gray-600">
                Серія правильних відповідей: {{ gameState.lastAnswerResult.current_streak }}
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./quiz-game.component.scss']
})
export class QuizGameComponent implements OnInit, OnDestroy {
  gameState: QuizGameState = {
    currentQuestionIndex: 0,
    totalQuestions: QUIZ_SETTINGS.QUESTIONS_PER_GAME,
    timeLeft: QUIZ_SETTINGS.QUESTION_TIME_LIMIT,
    isAnswered: false,
    showExplanation: false,
    categories: [],
    selectedDifficulty: 1,
    isGameActive: false,
    isLoading: false
  };

  categories = QUIZ_CATEGORIES;
  difficulties = QUIZ_DIFFICULTIES;
  QUIZ_SETTINGS = QUIZ_SETTINGS;
  
  private subscriptions: Subscription[] = [];
  private timer?: Subscription;
  private currentPlayerId = 1; // TODO: Отримувати з сервісу аутентифікації

  constructor(
    private quizService: QuizService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Підписуємося на стан гри
    const gameStateSub = this.quizService.gameState$.subscribe(state => {
      this.gameState = state;
    });
    this.subscriptions.push(gameStateSub);

    // Завантажуємо категорії
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopTimer();
  }

  private loadCategories(): void {
    const categoriesSub = this.quizService.getCategories().subscribe({
      next: (categories) => {
        this.quizService.updateGameState({ categories });
      },
      error: (error) => {
        console.error('Помилка завантаження категорій:', error);
      }
    });
    this.subscriptions.push(categoriesSub);
  }

  startGame(): void {
    const category = this.gameState.selectedCategory;
    const difficulty = this.gameState.selectedDifficulty;

    const startSub = this.quizService.startNewGame(this.currentPlayerId, category, difficulty).subscribe({
      next: ({ session, question }) => {
        console.log('Гра розпочата:', { session, question });
        this.startTimer();
      },
      error: (error) => {
        console.error('Помилка початку гри:', error);
      }
    });
    this.subscriptions.push(startSub);
  }

  selectAnswer(answer: string): void {
    if (this.gameState.isAnswered || !this.gameState.isGameActive) {
      return;
    }

    this.stopTimer();
    const timeSpent = QUIZ_SETTINGS.QUESTION_TIME_LIMIT - this.gameState.timeLeft;

    const answerSub = this.quizService.processAnswer(answer, timeSpent).subscribe({
      next: (response: QuizAnswerResponse) => {
        console.log('Відповідь обробена:', response);
        // Показуємо результат на 3 секунди, потім переходимо до наступного питання
        setTimeout(() => {
          this.nextQuestion();
        }, 3000);
      },
      error: (error) => {
        console.error('Помилка обробки відповіді:', error);
      }
    });
    this.subscriptions.push(answerSub);
  }

  nextQuestion(): void {
    if (this.gameState.currentQuestionIndex >= QUIZ_SETTINGS.QUESTIONS_PER_GAME - 1) {
      this.finishGame();
      return;
    }

    const nextSub = this.quizService.getNextQuestion().subscribe({
      next: (question) => {
        if (question) {
          this.startTimer();
        } else {
          this.finishGame();
        }
      },
      error: (error) => {
        console.error('Помилка отримання наступного питання:', error);
      }
    });
    this.subscriptions.push(nextSub);
  }

  finishGame(): void {
    const finishSub = this.quizService.finishGame().subscribe({
      next: (result) => {
        console.log('Гра завершена:', result);
        // TODO: Показати результати гри
      },
      error: (error) => {
        console.error('Помилка завершення гри:', error);
      }
    });
    this.subscriptions.push(finishSub);
  }

  private startTimer(): void {
    this.stopTimer();
    
    this.timer = interval(1000).pipe(
      takeWhile(() => this.gameState.timeLeft > 0 && !this.gameState.isAnswered)
    ).subscribe(() => {
      const newTimeLeft = this.gameState.timeLeft - 1;
      this.quizService.updateGameState({ timeLeft: newTimeLeft });
      
      if (newTimeLeft <= 0) {
        // Час вийшов - автоматично відповідаємо неправильно
        this.selectAnswer('');
      }
    });
  }

  private stopTimer(): void {
    if (this.timer) {
      this.timer.unsubscribe();
      this.timer = undefined;
    }
  }

  onCategoryChange(category: string): void {
    this.quizService.updateGameState({ selectedCategory: category });
  }

  onDifficultyChange(difficulty: number): void {
    this.quizService.updateGameState({ selectedDifficulty: difficulty });
  }

  getProgressPercentage(): number {
    return (this.gameState.currentQuestionIndex / this.gameState.totalQuestions) * 100;
  }

  getTimeProgressPercentage(): number {
    return (this.gameState.timeLeft / QUIZ_SETTINGS.QUESTION_TIME_LIMIT) * 100;
  }

  getAnswerButtonClass(answer: string): string {
    if (!this.gameState.isAnswered) {
      return 'answer-button';
    }

    if (this.gameState.selectedAnswer === answer) {
      return this.gameState.lastAnswerResult?.is_correct ? 'answer-correct' : 'answer-wrong';
    }

    if (this.gameState.lastAnswerResult?.correct_answer === answer) {
      return 'answer-correct';
    }

    return 'answer-disabled';
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.icon || '❓';
  }

  getDifficultyColor(difficulty: number): string {
    const diff = this.difficulties.find(d => d.value === difficulty);
    return diff?.color || 'text-gray-500';
  }

  getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
