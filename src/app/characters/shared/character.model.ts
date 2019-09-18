export interface Character {
  url: string;
  name: string;
  birth_year: string;
  eye_color: string;
  gender: string;
  homeworld: string;
  hair_color: string;
  height: number;
  films: string[];
  species: string[];
  mass: number;
  vehicles: string[];
  starships: string[];
}

export interface CharactersResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: Character[];
}

export class CharacterFilter {
  films: string;
  species: string;
  minYear: number;
  maxYear: number;
}
