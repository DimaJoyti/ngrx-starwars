import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { CharacterListComponent } from './character-list/character-list.component';
import { CharacterDetailsComponent } from './character-details/character-details.component';
import { charactersFeatureKey, reducer } from './store/characters/character.reducer';
import { CharactersEffects } from './store/characters/character.effects';

export const charactersRoutes: Routes = [
  {
    path: '',
    component: CharacterListComponent,
    providers: [
      provideState(charactersFeatureKey, reducer),
      provideEffects([CharactersEffects])
    ],
    data: { state: 'home' }
  },
  {
    path: 'characters/:id',
    component: CharacterDetailsComponent,
    data: { state: 'details' }
  }
];
