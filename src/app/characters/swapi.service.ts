import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CharactersResponse } from './models/character';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  private readonly baseUrl = 'https://swapi.co/api/';

  constructor(private http: HttpClient) {}

  getCharacters(page?: number): Observable<CharactersResponse> {
    const options = {
      params: {}
    };
    const link = `${this.baseUrl}people/`;

    if (page) {
      options.params = { page };
    };

    return this.http.get<CharactersResponse>(link, options);
  }

  searchForCharacter(lookup: string): Observable<CharactersResponse> {
    const link = `${this.baseUrl}people/`;
    const options = {
      params: {
        search: lookup
      }
    };

    return this.http.get<CharactersResponse>(link, options);
  }
}
