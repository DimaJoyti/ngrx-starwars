import { Routes } from '@angular/router';

export const gameRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./game-menu/game-menu.component').then(m => m.GameMenuComponent),
    data: { state: 'game-menu' }
  },
  {
    path: 'quiz',
    loadComponent: () => import('./components/quiz-game/quiz-game.component').then(m => m.QuizGameComponent),
    data: { state: 'quiz' }
  },
  // Тимчасово відключені підмодулі - будуть додані в наступних етапах
  // {
  //   path: 'collection',
  //   loadChildren: () => import('./collection/collection.routes').then(m => m.collectionRoutes),
  //   data: { state: 'collection' }
  // },
  // {
  //   path: 'battle',
  //   loadChildren: () => import('./battle/battle.routes').then(m => m.battleRoutes),
  //   data: { state: 'battle' }
  // },
  // {
  //   path: 'exploration',
  //   loadChildren: () => import('./exploration/exploration.routes').then(m => m.explorationRoutes),
  //   data: { state: 'exploration' }
  // },
  {
    path: '**',
    redirectTo: ''
  }
];
