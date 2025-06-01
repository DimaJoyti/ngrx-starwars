import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'characters',
    loadChildren: () => import('./characters/characters.routes').then(m => m.charactersRoutes)
  },
  {
    path: 'planets',
    loadComponent: () => import('./planets/planet-list/planet-list.component').then(m => m.PlanetListComponent)
  },
  {
    path: 'organizations',
    loadComponent: () => import('./organizations/organization-list/organization-list.component').then(m => m.OrganizationListComponent)
  },
  {
    path: 'weapons',
    loadComponent: () => import('./weapons/weapon-list/weapon-list.component').then(m => m.WeaponListComponent)
  },
  {
    path: 'starships',
    loadComponent: () => import('./starships/starship-list/starship-list.component').then(m => m.StarshipListComponent)
  },
  {
    path: 'game',
    loadChildren: () => import('./game/game.routes').then(m => m.gameRoutes)
  },
  {
    path: 'test-3d',
    loadComponent: () => import('./shared/three/test-three.component').then(m => m.TestThreeComponent)
  },
  {
    path: 'test-battle',
    loadComponent: () => import('./shared/three/test-battle.component').then(m => m.TestBattleComponent)
  },
  {
    path: 'galaxy-3d',
    loadComponent: () => import('./game/exploration/galaxy-map/galaxy-map-3d.component').then(m => m.GalaxyMap3DComponent)
  },
  {
    path: 'ships-3d',
    loadComponent: () => import('./game/collection/ship-collection-3d.component').then(m => m.ShipCollection3DComponent)
  },
  {
    path: 'battle-3d',
    loadComponent: () => import('./game/battle/battle-arena/battle-arena.component').then(m => m.BattleArenaComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
