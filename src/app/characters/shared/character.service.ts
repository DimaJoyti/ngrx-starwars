import {
  throwError as observableThrowError,
  of as observableOf,
  Observable,
} from 'rxjs';

import {
  refCount,
  publishReplay,
  map,
  catchError,
  concatMap,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Character, CharactersResponse } from './character.model';
import { Film } from './film.model';
import { Species } from './species.model';
import { Starships } from './starships.model';
import { NotifyService } from './notify.service';

import { Store } from '@ngrx/store';
import { FilmState } from '../store/films/films.state';
import * as FilmActions from '../store/films/films.actions';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private charactersUrl = 'https://swapi.dev/api/people/';
  private filmsUrl = 'https://swapi.dev/api/films/';
  private speciesUrl = 'https://swapi.dev/api/species/';
  private starshipsUrl = 'https://swapi.dev/api/starships/';

  private characters: Observable<Character[]>;
  private films: Observable<Film[]>;
  private species: Observable<Species[]>;
  public starships: Observable<Starships[]>;

  films$: Observable<any>;
  categoryContent: any;
  films_content: any;

  constructor(
    private store: Store<FilmState>,
    private httpClient: HttpClient,
    private notifyService: NotifyService
  ) {
    this.films$ = this.store;
    this.films$.subscribe((data) => {
      this.films_content = data.film;
    });
    // this.store.dispatch(new FilmActions.GetFilmsAction());
    this.characters = this.getDomainObjects(this.charactersUrl);
    this.films = this.getDomainObjects(this.filmsUrl);
    this.species = this.getDomainObjects(this.speciesUrl);
    this.starships = this.getDomainObjects(this.starshipsUrl);
  }

  /**
   * Gets characters
   *
   * @returns {Observable<Character[]>}
   */
  public getCharacters(): Observable<Character[]> {
    return this.characters;
  }

  /**
   * Get character by given ID
   *
   * @param {number} id
   * @returns {Observable<Character>}
   */
  public getCharacter(id: number): Observable<Character | null> {
    return this.characters.pipe(
      map((characters: Character[]) => {
        return characters.find((character: Character) => {
          const url = character.url.split('/');
          const currId = Number(url[url.length - 2]);
          return currId === id;
        }) || null;
      })
    );
  }

  /**
   * gets species
   * @returns {Observable<Species[]>}
   */
  public getSpeciesOfCharacter(character: Character): Observable<Species[]> {
    return this.species.pipe(
      map((species: Species[]) =>
        species.filter((s: Species) => {
          return character.species.indexOf(s.url) > -1;
        })
      )
    );
  }

  /**
   * Get Movie entities for the given character
   *
   * @param {Character} character
   * @returns {Observable<Film[]>}
   */
  public getMoviesOfCharacter(character: Character): Observable<Film[]> {
    return this.films.pipe(
      map((films: Film[]) =>
        films.filter((f: Film) => {
          return character.films.indexOf(f.url) > -1;
        })
      )
    );
  }

  /**
   * Get Starship entities for the given character
   * @param {Character} character
   * @returns {Observable<Starships[]>}
   */
  public getShipsOfCharacter(character: Character): Observable<Starships[]> {
    return this.starships.pipe(
      map((ships: Starships[]) =>
        ships.filter((s: Starships) => {
          return character.starships.indexOf(s.url) > -1;
        })
      )
    );
  }

  /**
   * Get all films
   * @returns {Observable<Film[]>}
   */
  public getFilms(): Observable<Film[]> {
    return this.films;
  }

  /**
   * Get all species
   * @returns {Observable<Species[]>}
   */
  public getSpecies(): Observable<Species[]> {
    return this.species;
  }

  /**
   * Get all starships
   * @returns {Observable<Starships[]>}
   */
  public getStarships(): Observable<Starships[]> {
    return this.starships;
  }

  /**
   * Cache the HTTP response
   * @param {string} url
   * @returns {Observable<T[]>}
   */
  private getDomainObjects<T>(url: string): Observable<T[]> {
    return this.getApiPage<T>(url).pipe(publishReplay(1), refCount());
  }

  /**
   * Gets all pages by the given URL
   * @param {string} url
   * @returns {Observable<Characters[]>}
   */
  private getApiPage<Characters>(url: string): Observable<any> {
    return this.httpClient
      .get<CharactersResponse<Characters>>(url, httpOptions)
      .pipe(
        concatMap((pageResponse) => {
          if (pageResponse.next) {
            return this.getApiPage(pageResponse.next).pipe(
              map((resultsToJoin) => [
                ...pageResponse.results,
                ...resultsToJoin,
              ])
            );
          } else {
            return observableOf(pageResponse.results);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Handles error messages
   * @param {Response} error
   * @returns {ErrorObservable}
   */
  private handleError(error: Response) {
    this.notifyService.warning('Ooops. Please try again later');
    const errMsg = 'Unable to complete the request';
    if (error.status !== 500) {
      const body = error.json() || '';
    }
    return observableThrowError(errMsg);
  }
}
