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
    path: '**',
    redirectTo: ''
  }
];
