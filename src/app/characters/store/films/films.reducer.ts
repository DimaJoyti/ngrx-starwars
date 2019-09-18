import { ActionReducer, Action } from '@ngrx/store';
import * as fromFilms from './films.actions';
import { FilmState, initialState } from './films.state';

export const filmsFeatureKey = 'films';

export function FilmsReducer(state = initialState, action: fromFilms.FilmsActions): FilmState {
  switch (action.type) {

    // Create loading state to allow for message when waiting for data
    case fromFilms.GET_FILMS: {
      return {
        ...state,
        loading: true,
      };
    };

    // Collect film data
    case fromFilms.GET_FILMS_SUCCESS: {
      return {
        ...state,
        films_content: action.payload.films_content,
        error: action.payload.error,
        loading: false,
      };
    };

    // Fail case for film data not being recieved
    case fromFilms.GET_FILMS_FAILURE: {
      return {
        ...initialState,
        error: action.payload.error,
        loading: false,
      };
    };

    default:
      return state;
  }
}
