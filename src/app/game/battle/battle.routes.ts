import { Routes } from '@angular/router';

export const battleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./battle-menu/battle-menu.component').then(m => m.BattleMenuComponent),
    data: { state: 'battle-menu' }
  },
  {
    path: 'arena',
    loadComponent: () => import('./battle-arena/battle-arena.component').then(m => m.BattleArenaComponent),
    data: { state: 'battle-arena' }
  },
  {
    path: 'team-builder',
    loadComponent: () => import('./team-builder/team-builder.component').then(m => m.TeamBuilderComponent),
    data: { state: 'team-builder' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
