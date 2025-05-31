import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { minLessThanMaxValidator } from '../shared/min-less-than-max.validator';
import { BirthYearPipe } from '../shared/birth-year.pipe';
import { BattleOfYavinPipe } from '../shared/battle-of-yavin.pipe';
import { Film } from '../shared/film.model';
import { Species } from '../shared/species.model';
import { Observable } from 'rxjs';
import { CharacterService } from '../shared/character.service';
import { CharacterFilter } from '../shared/character.model';

@Component({
  selector: 'sw-character-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatSliderModule,
    BirthYearPipe,
    BattleOfYavinPipe
  ],
  templateUrl: './character-search.component.html',
  styleUrls: ['./character-search.component.scss']
})
export class CharacterSearchComponent implements OnInit {
  @Output() onFilter: EventEmitter<CharacterFilter> = new EventEmitter<CharacterFilter>();

  filterForm: FormGroup;
  film!: AbstractControl;
  species!: AbstractControl;
  minYear!: AbstractControl;
  maxYear!: AbstractControl;

  films!: Observable<Film[]>;
  allSpecies!: Observable<Species[]>;

  minYearAny = BirthYearPipe.MIN_YEAR_ANY;
  maxYearAny = BirthYearPipe.MAX_YEAR_ANY;

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService
  ) {
    this.filterForm = fb.group(
      {
        film: [],
        species: [],
        minYear: [this.minYearAny],
        maxYear: [this.maxYearAny]
      },
      {
        validator: [minLessThanMaxValidator]
      }
    );
    this.film = this.filterForm.get('film')!;
    this.species = this.filterForm.get('species')!;
    this.minYear = this.filterForm.get('minYear')!;
    this.maxYear = this.filterForm.get('maxYear')!;
  }

  ngOnInit() {
    this.films = this.characterService.getFilms();
    this.allSpecies = this.characterService.getSpecies();
    this.filterForm.valueChanges.subscribe(() => {
      const newFilter: CharacterFilter = new CharacterFilter();
      newFilter.films = this.film.value;
      newFilter.species = this.species.value;
      newFilter.minYear = this.minYear.value;
      newFilter.maxYear = this.maxYear.value;
      this.onFilter.emit(newFilter);
    });
  }
}
