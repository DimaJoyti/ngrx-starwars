import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromCharacters from './store/characters/character.reducer';

import { CharactersEffects } from './store/characters/character.effects';
import { CharacterListComponent } from './character-list/character-list.component';
import { CharacterDetailsComponent } from './character-details/character-details.component';
import { CharacterSearchComponent } from './character-search/character-search.component';
import { CharactersRoutingModule } from './characters-routing.module';

import { FilmsPipe } from './shared/films.pipe';
import { SpeciesPipe } from './shared/species.pipe';
import { BirthYearPipe } from './shared/birth-year.pipe';
import { BattleOfYavinPipe } from './shared/battle-of-yavin.pipe';

import { FilmsReducer } from './store/films/films.reducer';
import { FilmEffects } from './store/films/films.effects';


@NgModule({
  imports: [
    SharedModule,
    CharactersRoutingModule,
    StoreModule.forFeature(
      fromCharacters.charactersFeatureKey,
      fromCharacters.reducer
    ),
    EffectsModule.forFeature([CharactersEffects])
  ],
  declarations: [
    CharacterListComponent,
    CharacterDetailsComponent,
    CharacterSearchComponent,
    FilmsPipe,
    SpeciesPipe,
    BirthYearPipe,
    BattleOfYavinPipe
  ],
  exports: [
    CharacterListComponent,
    CharacterDetailsComponent,
    CharacterSearchComponent
  ]
})
export class CharactersModule {}
