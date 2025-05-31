import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { CharacterService } from '../shared/character.service';
import { Character } from '../shared/character.model';
import { Starships } from '../shared/starships.model';
import { Observable } from 'rxjs';
import { Species } from '../shared/species.model';
import { Film } from '../shared/film.model';
import { NotifyService } from '../shared/notify.service';

import { Store } from '@ngrx/store';
import { FilmState } from './../store/films/films.state';

@Component({
  selector: 'sw-character-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './character-details.component.html',
  styleUrls: ['./character-details.component.scss']
})
export class CharacterDetailsComponent implements OnInit {
  characterId!: number;
  character: Character | null = null;
  species!: Observable<Species[]>;
  startships!: Observable<Starships[]>;
  films!: Observable<Film[]>;

  constructor(  
    private route: ActivatedRoute,
    private store: Store<FilmState>,
    private characterService: CharacterService,
    private notifyService: NotifyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.characterId = +(params.get('id') || 0);
      if (this.characterId) {
        this.characterService.getCharacter(this.characterId).subscribe(
          character => {
            if (character == null) {
              this.noCharacterFound();
            } else {
              this.character = character;
              this.fetchDetails();
            }
          },
          error => {
            this.notifyService.warning(error);
          }
        );
      }
    });
  }

  private noCharacterFound() {
    this.notifyService.warning('Oops, incorrect character link');
    this.router.navigate(['']);
  }

  private fetchDetails() {
    if (this.character) {
      this.species = this.characterService.getSpeciesOfCharacter(this.character);
      this.films = this.characterService.getMoviesOfCharacter(this.character);
      this.startships = this.characterService.getShipsOfCharacter(this.character);
    }
  }
}
