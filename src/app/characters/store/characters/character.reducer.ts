import { createReducer, on } from '@ngrx/store';
import { fetchCharacters, fetchCharactersSuccess, fetchCharactersError, changePage, Pagination } from './character.actions';
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

export const reducer = createReducer(
  initialState,
  on(fetchCharacters, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(fetchCharactersSuccess, (state, { payload }) => ({
    ...state,
    isLoading: false,
    data: payload.results,
    next: payload.next,
    previous: payload.previous
  })),
  on(fetchCharactersError, (state, { payload }) => ({
    ...state,
    isLoading: false,
    error: payload
  })),
  on(changePage, (state, { payload }) => ({
    ...state,
    page: payload === Pagination.NEXT ? state.page + 1 : state.page - 1
  }))
);
