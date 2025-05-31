import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GameService, Player, PlayerStats } from '../services/game.service';

@Component({
  selector: 'app-game-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="game-menu-container">
      <!-- Header з інформацією про гравця -->
      <div class="player-header" *ngIf="currentPlayer">
        <div class="player-info">
          <div class="player-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div class="player-details">
            <h2 class="player-name">{{ currentPlayer.username }}</h2>
            <div class="player-level">
              <span class="level-text">Рівень {{ currentPlayer.level }}</span>
              <mat-progress-bar 
                mode="determinate" 
                [value]="getExperienceProgress()"
                class="experience-bar">
              </mat-progress-bar>
              <span class="experience-text">
                {{ currentPlayer.experience }} / {{ getNextLevelExperience() }} XP
              </span>
            </div>
          </div>
          <div class="player-credits">
            <mat-icon>monetization_on</mat-icon>
            <span>{{ currentPlayer.credits }}</span>
          </div>
        </div>
      </div>

      <!-- Головне меню гри -->
      <div class="game-modes-section">
        <h1 class="section-title">Star Wars Galaxy Game</h1>
        <p class="section-subtitle">Оберіть режим гри та почніть свою пригоду в галактиці далеко-далеко...</p>

        <div class="game-modes-grid">
          <!-- Quiz Mode -->
          <mat-card class="game-mode-card quiz-card"
                    (click)="navigateToQuiz()"
                    style="cursor: pointer;">
            <mat-card-header>
              <div mat-card-avatar class="avatar-quiz">
                <mat-icon>quiz</mat-icon>
              </div>
              <mat-card-title>Галактична Вікторина</mat-card-title>
              <mat-card-subtitle>Перевірте свої знання Star Wars</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Відповідайте на питання про персонажів, планети, кораблі та події з усіх епох Star Wars.</p>
              <div class="mode-features">
                <div class="feature">
                  <mat-icon>timer</mat-icon>
                  <span>Швидкі раунди</span>
                </div>
                <div class="feature">
                  <mat-icon>leaderboard</mat-icon>
                  <span>Таблиця лідерів</span>
                </div>
                <div class="feature">
                  <mat-icon>star</mat-icon>
                  <span>Очки та досягнення</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary">
                <mat-icon>play_arrow</mat-icon>
                Почати вікторину
              </button>
            </mat-card-actions>
          </mat-card>

          <!-- Collection Mode -->
          <mat-card class="game-mode-card collection-card"
                    (click)="showComingSoon('Collection Game')"
                    style="cursor: pointer;">
            <mat-card-header>
              <div mat-card-avatar class="avatar-collection">
                <mat-icon>collections</mat-icon>
              </div>
              <mat-card-title>Колекція Карток</mat-card-title>
              <mat-card-subtitle>Збирайте та колекціонуйте</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Відкривайте пакети карток, збирайте рідкісні картки персонажів та створюйте свою колекцію.</p>
              <div class="mode-features">
                <div class="feature">
                  <mat-icon>card_giftcard</mat-icon>
                  <span>Пакети карток</span>
                </div>
                <div class="feature">
                  <mat-icon>auto_awesome</mat-icon>
                  <span>Рідкісні картки</span>
                </div>
                <div class="feature">
                  <mat-icon>swap_horiz</mat-icon>
                  <span>Торгівля</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary">
                <mat-icon>collections</mat-icon>
                Переглянути колекцію
              </button>
            </mat-card-actions>
          </mat-card>

          <!-- Battle Mode -->
          <mat-card class="game-mode-card battle-card"
                    (click)="showComingSoon('Battle Game')"
                    style="cursor: pointer;">
            <mat-card-header>
              <div mat-card-avatar class="avatar-battle">
                <mat-icon>sports_kabaddi</mat-icon>
              </div>
              <mat-card-title>Галактичні Битви</mat-card-title>
              <mat-card-subtitle>Стратегічні поєдинки</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Створюйте команди з ваших персонажів та беріть участь у епічних битвах проти AI або інших гравців.</p>
              <div class="mode-features">
                <div class="feature">
                  <mat-icon>groups</mat-icon>
                  <span>Команди героїв</span>
                </div>
                <div class="feature">
                  <mat-icon>psychology</mat-icon>
                  <span>Стратегія</span>
                </div>
                <div class="feature">
                  <mat-icon>emoji_events</mat-icon>
                  <span>Турніри</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary">
                <mat-icon>sports_kabaddi</mat-icon>
                В бій!
              </button>
            </mat-card-actions>
          </mat-card>

          <!-- Exploration Mode -->
          <mat-card class="game-mode-card exploration-card"
                    (click)="showComingSoon('Exploration Game')"
                    style="cursor: pointer;">
            <mat-card-header>
              <div mat-card-avatar class="avatar-exploration">
                <mat-icon>explore</mat-icon>
              </div>
              <mat-card-title>Дослідження Галактики</mat-card-title>
              <mat-card-subtitle>Подорожуйте зірками</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Досліджуйте планети, шукайте артефакти та відкривайте таємниці далекої галактики.</p>
              <div class="mode-features">
                <div class="feature">
                  <mat-icon>public</mat-icon>
                  <span>Планети</span>
                </div>
                <div class="feature">
                  <mat-icon>diamond</mat-icon>
                  <span>Артефакти</span>
                </div>
                <div class="feature">
                  <mat-icon>map</mat-icon>
                  <span>Карта галактики</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary">
                <mat-icon>rocket_launch</mat-icon>
                Почати подорож
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Статистика гравця -->
      <div class="player-stats-section" *ngIf="playerStats$ | async as stats">
        <h2 class="section-title">Ваша статистика</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <mat-icon>quiz</mat-icon>
            <div class="stat-value">{{ stats.total_games_played }}</div>
            <div class="stat-label">Ігор зіграно</div>
          </div>
          <div class="stat-card">
            <mat-icon>star</mat-icon>
            <div class="stat-value">{{ stats.best_score }}</div>
            <div class="stat-label">Найкращий результат</div>
          </div>
          <div class="stat-card">
            <mat-icon>collections</mat-icon>
            <div class="stat-value">{{ stats.cards_collected }}</div>
            <div class="stat-label">Карток зібрано</div>
          </div>
          <div class="stat-card">
            <mat-icon>emoji_events</mat-icon>
            <div class="stat-value">{{ stats.battles_won }}</div>
            <div class="stat-label">Битв виграно</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit, OnDestroy {
  currentPlayer: Player | null = null;
  playerStats$!: Observable<PlayerStats>;
  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Підписуємося на поточного гравця
    this.gameService.currentPlayer$
      .pipe(takeUntil(this.destroy$))
      .subscribe(player => {
        this.currentPlayer = player;
        if (player) {
          this.playerStats$ = this.gameService.getPlayerStats(player.id);
        }
      });

    // Якщо гравець не увійшов, створюємо тестового гравця
    if (!this.gameService.getCurrentPlayer()) {
      this.gameService.ensureTestPlayer().subscribe({
        next: (player) => {
          console.log('Тестовий гравець створений:', player);
        },
        error: (error) => {
          console.error('Помилка створення тестового гравця:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getExperienceProgress(): number {
    if (!this.currentPlayer) return 0;

    return this.gameService.getExperienceProgress(
      this.currentPlayer.experience,
      this.currentPlayer.level
    );
  }

  getNextLevelExperience(): number {
    if (!this.currentPlayer) return 0;
    return this.gameService.getExperienceForNextLevel(this.currentPlayer.level);
  }

  private showLoginDialog(): void {
    // TODO: Реалізувати діалог входу/реєстрації
    console.log('Show login dialog');
  }

  navigateToQuiz(): void {
    this.router.navigate(['/game/quiz']);
  }

  showComingSoon(gameMode: string): void {
    this.snackBar.open(`${gameMode} буде доступна в наступних оновленнях!`, 'Закрити', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
