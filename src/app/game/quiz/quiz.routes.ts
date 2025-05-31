import { Routes } from '@angular/router';

export const quizRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./quiz-menu/quiz-menu.component').then(m => m.QuizMenuComponent),
    data: { state: 'quiz-menu' }
  },
  {
    path: 'play',
    loadComponent: () => import('./quiz-game/quiz-game.component').then(m => m.QuizGameComponent),
    data: { state: 'quiz-game' }
  },
  {
    path: 'results',
    loadComponent: () => import('./quiz-results/quiz-results.component').then(m => m.QuizResultsComponent),
    data: { state: 'quiz-results' }
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./quiz-leaderboard/quiz-leaderboard.component').then(m => m.QuizLeaderboardComponent),
    data: { state: 'quiz-leaderboard' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
