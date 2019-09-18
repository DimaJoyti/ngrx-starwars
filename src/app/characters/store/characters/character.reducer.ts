import { Action } from '@ngrx/store';
import { CharactersActions, CharactersActionTypes, Pagination } from './character.actions';
import { Character } from '../../models/character';
import { HttpErrorResponse } from '@angular/common/http';

export interface State {
  isLoading: boolean;
  error: HttpErrorResponse | null;
  data: Character[] | null;
  next: string | null;
  previous: string | null;
  page: number;
}

export const initialState: State = {
  isLoading: false,
  error: null,
  data: [],
  next: null,
  previous: null,
  page: 1
};

export const charactersFeatureKey = 'characters';

export function reducer(state = initialState, action: CharactersActions): State {
  switch (action.type) {

    case CharactersActionTypes.FetchCharacters:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case CharactersActionTypes.FetchCharactersSuccess:
      return {
        ...state,
        isLoading: false,
        data: action.payload.results,
        next: action.payload.next,
        previous: action.payload.previous
      };

    case CharactersActionTypes.FetchCharactersError:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case CharactersActionTypes.FetchCharactersError:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case CharactersActionTypes.ChangePage:
      return {
        ...state,
        page: action.payload === Pagination.NEXT ? ++state.page : --state.page
      };

    default:
      return state;
  }
}
