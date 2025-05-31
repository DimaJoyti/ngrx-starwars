import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Character, CharacterFilter } from '../shared/character.model';
import { CharacterService } from '../shared/character.service';
// import { CharacterSearchComponent } from '../character-search/character-search.component';
import { BirthYearPipe } from '../shared/birth-year.pipe';
import { FilmsPipe } from '../shared/films.pipe';
import { SpeciesPipe } from '../shared/species.pipe';
import { Store } from '@ngrx/store';
import { State } from '../store/characters/character.reducer';
import {
  fetchCharacters,
  changePage,
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
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    // CharacterSearchComponent,
    BirthYearPipe,
    FilmsPipe,
    SpeciesPipe
  ],
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit {
  filter = new CharacterFilter();
  characters!: Observable<Character[] | null>;
  isFirst$!: Observable<boolean>;
  isLast$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;

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

    this.store.dispatch(fetchCharacters());
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
    this.store.dispatch(changePage({ payload: Pagination.PREV }));
  }

  next() {
    this.store.dispatch(changePage({ payload: Pagination.NEXT }));
  }

  trackByUrl(_index: number, character: Character): string {
    return character.url;
  }

  /**
   * Get appropriate icon for character based on their attributes
   */
  getCharacterIcon(character: Character): string {
    const name = character.name.toLowerCase();

    // Special characters
    if (name.includes('vader') || name.includes('anakin')) return 'psychology';
    if (name.includes('luke')) return 'star';
    if (name.includes('leia')) return 'favorite';
    if (name.includes('yoda')) return 'auto_awesome';
    if (name.includes('obi-wan') || name.includes('kenobi')) return 'shield';
    if (name.includes('han')) return 'flight';
    if (name.includes('chewbacca')) return 'pets';
    if (name.includes('r2-d2') || name.includes('c-3po')) return 'smart_toy';
    if (name.includes('boba') || name.includes('jango')) return 'gps_fixed';

    // Gender-based icons
    if (character.gender === 'female') return 'face_3';
    if (character.gender === 'male') return 'face';

    // Default icons
    if (name.includes('droid')) return 'smart_toy';
    return 'person';
  }

  /**
   * Get character info summary
   */
  getCharacterInfo(character: Character): string {
    const parts: string[] = [];

    if (character.gender && character.gender !== 'n/a') {
      parts.push(character.gender.charAt(0).toUpperCase() + character.gender.slice(1));
    }

    if (character.species && character.species.length > 0) {
      // Extract species name from URL if needed
      parts.push('Species: Various');
    } else {
      parts.push('Human');
    }

    return parts.join(' • ') || 'Character from Star Wars';
  }
}
