export interface Organization {
  url: string;
  name: string;
  type: string;
  description: string;
  founded: string;
  dissolved: string;
  homeworld: string;
  leader: string;
  members: string[];
  created: string;
  edited: string;
}

export interface OrganizationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Organization[];
}
