import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { getFilms, getFilmsSuccess, getFilmsFailure } from './films.actions';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class FilmEffects {
  constructor(private http: HttpClient, private actions$: Actions) {}

  getFilms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getFilms),
      switchMap(() =>
        this.http.get('https://swapi.dev/api/films').pipe(
          map((data) => getFilmsSuccess({ films_content: data })),
          catchError((error) => of(getFilmsFailure({ error })))
        )
      )
    )
  );
}
