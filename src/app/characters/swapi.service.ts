import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

import { CharactersResponse } from './models/character';
import { ErrorHandlerService } from '../shared/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private readonly baseUrl = 'http://localhost:8080/api/';
  private readonly timeout = 10000; // 10 seconds
  private readonly retryAttempts = 2;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Get characters with pagination and optional search
   */
  getCharacters(page?: number, limit?: number): Observable<CharactersResponse> {
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<CharactersResponse>(`${this.baseUrl}people/`, { params })
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Search for characters by name
   */
  searchForCharacter(lookup: string): Observable<CharactersResponse> {
    if (!lookup || lookup.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    const params = new HttpParams().set('search', lookup.trim());

    return this.http.get<CharactersResponse>(`${this.baseUrl}people/`, { params })
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get character by ID
   */
  getCharacterById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}people/${id}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get all films
   */
  getFilms(): Observable<any> {
    return this.http.get(`${this.baseUrl}films/`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get all species
   */
  getSpecies(): Observable<any> {
    return this.http.get(`${this.baseUrl}species/`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get all starships
   */
  getStarships(): Observable<any> {
    return this.http.get(`${this.baseUrl}starships/`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get all planets
   */
  getPlanets(): Observable<any> {
    return this.http.get(`${this.baseUrl}planets/`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get planet by ID
   */
  getPlanetById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}planets/${id}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get all organizations
   */
  getOrganizations(): Observable<any> {
    return this.http.get(`${this.baseUrl}organizations/`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  /**
   * Get all weapons
   */
  getWeapons(): Observable<any> {
    return this.http.get(`${this.baseUrl}weapons/`)
      .pipe(
        timeout(this.timeout),
        retry(this.retryAttempts),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }
}
