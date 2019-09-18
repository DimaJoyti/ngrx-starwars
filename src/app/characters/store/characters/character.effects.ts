import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getCurrentPage } from './index';
import { State } from './character.reducer';
import { SwapiService } from '../../swapi.service';
import {
  CharactersActionTypes,
  CharactersActions,
  FetchCharacters,
  FetchCharactersSuccess,
  FetchCharactersError
} from './character.actions';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class CharactersEffects {
  @Effect()
  fetch$: Observable<CharactersActions> = this.actions$
    .pipe(
      ofType(CharactersActionTypes.FetchCharacters),
      withLatestFrom(this.store),
      switchMap(([action, state]) =>
        this.service.getCharacters(getCurrentPage(state)).pipe(
          map(data => new FetchCharactersSuccess(data)),
          catchError(err => of(new FetchCharactersError(err)))
        )
      )
    );

  @Effect()
  paginate$: Observable<CharactersActions> = this.actions$
    .pipe(
      ofType(CharactersActionTypes.ChangePage),
      map(() => new FetchCharacters())
    );

  constructor(private actions$: Actions,
              private store: Store<State>,
              private service: SwapiService) {}
}
