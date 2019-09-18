import { Action } from '@ngrx/store';
import { CharactersResponse } from '../../models/character';
import { HttpErrorResponse } from '@angular/common/http';

export const enum CharactersActionTypes {
  FetchCharacters = '[Characters] Fetch Characters',
  FetchCharactersSuccess = '[Characters] Load Characters Success',
  FetchCharactersError = '[Characters] Load Characters Error',
  ChangePage = '[Characters] Change page'
}

export const enum Pagination {
  NEXT,
  PREV
}

export class FetchCharacters implements Action {
  readonly type = CharactersActionTypes.FetchCharacters;
}

export class FetchCharactersSuccess implements Action {
  readonly type = CharactersActionTypes.FetchCharactersSuccess;

  constructor(public payload: CharactersResponse) {}
}

export class FetchCharactersError implements Action {
  readonly type = CharactersActionTypes.FetchCharactersError;

  constructor(public payload: HttpErrorResponse) {}
}

export class ChangePage implements Action {
  readonly type = CharactersActionTypes.ChangePage;

  constructor(public payload: Pagination) {}
}

export type CharactersActions = FetchCharacters | FetchCharactersSuccess | FetchCharactersError | ChangePage;
