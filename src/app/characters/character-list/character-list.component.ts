import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Character, CharacterFilter } from '../shared/character.model';
import { CharacterService } from '../shared/character.service';
import { Store } from '@ngrx/store';
import { State } from '../store/characters/character.reducer';
import {
  FetchCharacters,
  ChangePage,
  Pagination
} from './../store/characters/character.actions';
import {
  getCharacters,
  getIsFirstPage,
  getIsLastPage,
  getIsLoading
} from './../store/characters/index';

import { Observable } from 'rxjs';

@Component({
  selector: 'sw-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit {
  filter = new CharacterFilter();
  characters: Observable<Character[]>;
  isFirst$: Observable<boolean>;
  isLast$: Observable<boolean>;
  isLoading$: Observable<boolean>;

  constructor(
    private characterService: CharacterService,
    private store: Store<State>,
    private router: Router
  ) {}

  ngOnInit() {
    this.characters = this.characterService.getCharacters();
    this.characters = this.store.select(getCharacters);
    this.isFirst$ = this.store.select(getIsFirstPage);
    this.isLast$ = this.store.select(getIsLastPage);
    this.isLoading$ = this.store.select(getIsLoading);

    this.store.dispatch(new FetchCharacters());
  }

  setFilter(newFilter: CharacterFilter) {
    this.filter = newFilter;
  }

  goToCharacter(character: Character) {
    const url = character.url.split('/');
    const id = url[url.length - 2];
    this.router.navigate(['/characters', id]);
  }

  prev() {
    this.store.dispatch(new ChangePage(Pagination.PREV));
  }

  next() {
    this.store.dispatch(new ChangePage(Pagination.NEXT));
  }

  trackByUrl(index: number, character: Character): string {
    return character.url;
  }
}
