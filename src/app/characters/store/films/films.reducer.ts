import { createReducer, on } from '@ngrx/store';
import { getFilms, getFilmsSuccess, getFilmsFailure } from './films.actions';
import { FilmState, initialState } from './films.state';

export const filmsFeatureKey = 'films';

export const FilmsReducer = createReducer(
  initialState,
  on(getFilms, (state) => ({
    ...state,
    loading: true,
  })),
  on(getFilmsSuccess, (state, { films_content, error }) => ({
    ...state,
    films_content,
    error,
    loading: false,
  })),
  on(getFilmsFailure, (state, { error }) => ({
    ...initialState,
    error,
    loading: false,
  }))
);
