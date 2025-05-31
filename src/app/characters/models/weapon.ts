export interface Weapon {
  url: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  description: string;
  length: string;
  weight: string;
  color: string;
  crystal_type: string;
  owners: string[];
  created: string;
  edited: string;
}

export interface WeaponsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Weapon[];
}
