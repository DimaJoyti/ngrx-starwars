import { ActionReducerMap, createFeatureSelector, createSelector, MetaReducer } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import * as fromCharacters from './character.reducer';

export interface State {
  Characters: fromCharacters.State;
}

export const reducers: ActionReducerMap<State> = {
  Characters: fromCharacters.reducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];

export const getCharactersState = createFeatureSelector<fromCharacters.State>('characters');
export const getCharacters = createSelector(getCharactersState, state => state.data);
export const getIsLoading = createSelector(getCharactersState, state => state.isLoading);
export const getCurrentPage = createSelector(getCharactersState, state => state.page);
export const getIsFirstPage = createSelector(getCharactersState, state => !state.previous);
export const getIsLastPage = createSelector(getCharactersState, state => !state.next);
