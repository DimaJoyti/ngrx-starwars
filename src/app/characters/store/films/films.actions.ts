import { createAction, props } from '@ngrx/store';

export const getFilms = createAction('[Films] Get Films');

export const getFilmsSuccess = createAction(
  '[Films] Get Films Success',
  props<{ films_content: any; error?: any }>()
);

export const getFilmsFailure = createAction(
  '[Films] Get Films Failure',
  props<{ error?: any; loading?: any }>()
);
