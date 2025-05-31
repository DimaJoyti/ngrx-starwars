import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getCurrentPage } from './index';
import { State } from './character.reducer';
import { SwapiService } from '../../swapi.service';
import {
  fetchCharacters,
  fetchCharactersSuccess,
  fetchCharactersError,
  changePage
} from './character.actions';
import { of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class CharactersEffects {
  fetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchCharacters),
      withLatestFrom(this.store),
      switchMap(([, state]) =>
        this.service.getCharacters(getCurrentPage(state)).pipe(
          map(data => fetchCharactersSuccess({ payload: data })),
          catchError(err => of(fetchCharactersError({ payload: err })))
        )
      )
    )
  );

  paginate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changePage),
      map(() => fetchCharacters())
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private service: SwapiService
  ) {}
}
