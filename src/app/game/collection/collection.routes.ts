import { Routes } from '@angular/router';

export const collectionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./card-album/card-album.component').then(m => m.CardAlbumComponent),
    data: { state: 'card-album' }
  },
  {
    path: 'packs',
    loadComponent: () => import('./card-packs/card-packs.component').then(m => m.CardPacksComponent),
    data: { state: 'card-packs' }
  },
  {
    path: 'card/:id',
    loadComponent: () => import('./card-details/card-details.component').then(m => m.CardDetailsComponent),
    data: { state: 'card-details' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
