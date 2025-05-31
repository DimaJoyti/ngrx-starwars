import { createAction, props } from '@ngrx/store';
import { CharactersResponse } from '../../models/character';
import { HttpErrorResponse } from '@angular/common/http';

export const enum Pagination {
  NEXT,
  PREV
}

export const fetchCharacters = createAction('[Characters] Fetch Characters');

export const fetchCharactersSuccess = createAction(
  '[Characters] Load Characters Success',
  props<{ payload: CharactersResponse }>()
);

export const fetchCharactersError = createAction(
  '[Characters] Load Characters Error',
  props<{ payload: HttpErrorResponse }>()
);

export const changePage = createAction(
  '[Characters] Change page',
  props<{ payload: Pagination }>()
);
