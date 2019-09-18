import { Action } from '@ngrx/store';

// Constants
export const GET_FILMS = 'GET_FILMS_CONTENT';
export const GET_FILMS_SUCCESS = 'GET_FILMS_CONTENT_SUCCESS';
export const GET_FILMS_FAILURE = 'GET_FILMS_CONTENT_FAILURE';


// Action to start request and setting loading status on
export class GetFilmsAction implements Action {
  readonly type = GET_FILMS;
}

// Action to check request was successful
export class GetFilmsSuccessAction implements Action {
  readonly type = GET_FILMS_SUCCESS;
  constructor(public payload: {films_content: any; error?: {} }) {}
}

// Action for failure to People receive data
export class GetFilmsFailureAction implements Action {
  readonly type = GET_FILMS_FAILURE;
  constructor(public payload: {error?: {}, loading?: any}) {}
}

// Export types to be used in reducer
export type FilmsActions = GetFilmsAction | GetFilmsSuccessAction | GetFilmsFailureAction;
