import { Routes } from '@angular/router';

export const explorationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./galaxy-map/galaxy-map.component').then(m => m.GalaxyMapComponent),
    data: { state: 'galaxy-map' }
  },
  {
    path: 'planet/:id',
    loadComponent: () => import('./planet-visit/planet-visit.component').then(m => m.PlanetVisitComponent),
    data: { state: 'planet-visit' }
  },
  {
    path: 'artifacts',
    loadComponent: () => import('./artifact-collection/artifact-collection.component').then(m => m.ArtifactCollectionComponent),
    data: { state: 'artifact-collection' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
