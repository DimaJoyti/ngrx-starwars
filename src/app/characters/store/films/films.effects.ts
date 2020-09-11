import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as filmActions from './films.actions';

import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class FilmEffects {
  constructor(private http: HttpClient, private actions$: Actions) {}

  @Effect() getFilms$: Observable<Action> = this.actions$.pipe(
    ofType(filmActions.GET_FILMS),
    switchMap(() => {
      return this.http.get('https://swapi.dev/api/films').pipe(
        map(
          (data) =>
            new filmActions.GetFilmsSuccessAction({ films_content: data })
        ),
        catchError((error) => of(new filmActions.GetFilmsFailureAction(error)))
      );
    })
  );
}
