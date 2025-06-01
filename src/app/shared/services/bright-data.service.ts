import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  EnhancedStarship, 
  EnhancedPlanet, 
  StarshipPhysicsConfig,
  Environment3D 
} from '../models/bright-data-models';

@Injectable({
  providedIn: 'root'
})
export class BrightDataService {
  private readonly apiUrl = 'http://localhost:8080/api';
  private readonly brightDataEndpoint = '/bright-data';
  
  // Cache for frequently accessed data
  private starshipsCache$ = new BehaviorSubject<EnhancedStarship[]>([]);
  private planetsCache$ = new BehaviorSubject<EnhancedPlanet[]>([]);
  
  constructor(private http: HttpClient) {
    this.initializeCache();
  }

  // ===== STARSHIP METHODS =====

  /**
   * Get all enhanced starships with Bright Data MCP data
   */
  getEnhancedStarships(): Observable<EnhancedStarship[]> {
    return this.http.get<EnhancedStarship[]>(`${this.apiUrl}/starships/enhanced`)
      .pipe(
        tap(starships => this.starshipsCache$.next(starships)),
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific enhanced starship by ID
   */
  getEnhancedStarship(id: number): Observable<EnhancedStarship> {
    return this.http.get<EnhancedStarship>(`${this.apiUrl}/starships/enhanced/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get starships filtered by faction
   */
  getStarshipsByFaction(faction: string): Observable<EnhancedStarship[]> {
    const params = new HttpParams().set('faction', faction);
    return this.http.get<EnhancedStarship[]>(`${this.apiUrl}/starships/enhanced`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get starships filtered by rarity
   */
  getStarshipsByRarity(rarity: string): Observable<EnhancedStarship[]> {
    const params = new HttpParams().set('rarity', rarity);
    return this.http.get<EnhancedStarship[]>(`${this.apiUrl}/starships/enhanced`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Search starships by name or model
   */
  searchStarships(query: string): Observable<EnhancedStarship[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<EnhancedStarship[]>(`${this.apiUrl}/starships/enhanced/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update starship physics configuration
   */
  updateStarshipPhysics(starshipId: number, physicsConfig: StarshipPhysicsConfig): Observable<EnhancedStarship> {
    return this.http.put<EnhancedStarship>(
      `${this.apiUrl}/starships/enhanced/${starshipId}/physics`, 
      physicsConfig
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ===== PLANET METHODS =====

  /**
   * Get all enhanced planets with Bright Data MCP data
   */
  getEnhancedPlanets(): Observable<EnhancedPlanet[]> {
    return this.http.get<EnhancedPlanet[]>(`${this.apiUrl}/planets/enhanced`)
      .pipe(
        tap(planets => this.planetsCache$.next(planets)),
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific enhanced planet by ID
   */
  getEnhancedPlanet(id: number): Observable<EnhancedPlanet> {
    return this.http.get<EnhancedPlanet>(`${this.apiUrl}/planets/enhanced/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get planets filtered by climate
   */
  getPlanetsByClimate(climate: string): Observable<EnhancedPlanet[]> {
    const params = new HttpParams().set('climate', climate);
    return this.http.get<EnhancedPlanet[]>(`${this.apiUrl}/planets/enhanced`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Search planets by name or terrain
   */
  searchPlanets(query: string): Observable<EnhancedPlanet[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<EnhancedPlanet[]>(`${this.apiUrl}/planets/enhanced/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update planet 3D environment configuration
   */
  updatePlanetEnvironment(planetId: number, environment: Environment3D): Observable<EnhancedPlanet> {
    return this.http.put<EnhancedPlanet>(
      `${this.apiUrl}/planets/enhanced/${planetId}/environment`, 
      environment
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ===== 3D MODEL METHODS =====

  /**
   * Get 3D model configuration for a starship
   */
  getStarship3DConfig(starshipId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/starships/enhanced/${starshipId}/3d-config`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get 3D environment configuration for a planet
   */
  getPlanet3DConfig(planetId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/planets/enhanced/${planetId}/3d-config`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== BRIGHT DATA SYNC METHODS =====

  /**
   * Trigger a sync with Bright Data MCP to refresh data
   */
  syncWithBrightData(): Observable<{ message: string; timestamp: string }> {
    return this.http.post<{ message: string; timestamp: string }>(
      `${this.apiUrl}${this.brightDataEndpoint}/sync`, 
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get the last sync timestamp
   */
  getLastSyncTimestamp(): Observable<{ timestamp: string }> {
    return this.http.get<{ timestamp: string }>(`${this.apiUrl}${this.brightDataEndpoint}/last-sync`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Check if new data is available from Bright Data MCP
   */
  checkForUpdates(): Observable<{ hasUpdates: boolean; lastUpdate: string }> {
    return this.http.get<{ hasUpdates: boolean; lastUpdate: string }>(
      `${this.apiUrl}${this.brightDataEndpoint}/check-updates`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ===== GAME INTEGRATION METHODS =====

  /**
   * Get battle configuration for starships
   */
  getBattleConfiguration(playerStarshipId: number, enemyStarshipId?: number): Observable<any> {
    const params = new HttpParams()
      .set('player', playerStarshipId.toString())
      .set('enemy', enemyStarshipId?.toString() || 'random');
    
    return this.http.get(`${this.apiUrl}/game/battle/config`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get exploration configuration for a planet
   */
  getExplorationConfiguration(planetId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/game/exploration/config/${planetId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== CACHE METHODS =====

  /**
   * Get cached starships
   */
  getCachedStarships(): Observable<EnhancedStarship[]> {
    return this.starshipsCache$.asObservable();
  }

  /**
   * Get cached planets
   */
  getCachedPlanets(): Observable<EnhancedPlanet[]> {
    return this.planetsCache$.asObservable();
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.starshipsCache$.next([]);
    this.planetsCache$.next([]);
  }

  // ===== UTILITY METHODS =====

  /**
   * Get statistics about the Bright Data integration
   */
  getBrightDataStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validate 3D model paths
   */
  validate3DModels(): Observable<{ valid: string[]; invalid: string[] }> {
    return this.http.get<{ valid: string[]; invalid: string[] }>(
      `${this.apiUrl}${this.brightDataEndpoint}/validate-models`
    ).pipe(
      catchError(this.handleError)
    );
  }

  // ===== PRIVATE METHODS =====

  private initializeCache(): void {
    // Initialize cache with empty arrays
    this.starshipsCache$.next([]);
    this.planetsCache$.next([]);
  }

  // ===== ADVANCED BRIGHT DATA INTEGRATION =====

  /**
   * Scrape Star Wars character data from multiple sources
   */
  scrapeCharacterData(characterName: string): Observable<any> {
    const params = new HttpParams().set('character', characterName);
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/scrape/character`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Scrape vehicle specifications from Wookieepedia
   */
  scrapeVehicleSpecs(vehicleName: string): Observable<any> {
    const params = new HttpParams().set('vehicle', vehicleName);
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/scrape/vehicle`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get real-time Star Wars news and updates
   */
  getStarWarsNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/news`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Search for Star Wars content across multiple databases
   */
  searchStarWarsContent(query: string, sources: string[] = ['wookieepedia', 'starwars.com']): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('sources', sources.join(','));

    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get trending Star Wars topics
   */
  getTrendingTopics(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}${this.brightDataEndpoint}/trending`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Scrape Star Wars merchandise data
   */
  scrapeMerchandiseData(productType: string): Observable<any[]> {
    const params = new HttpParams().set('type', productType);
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/merchandise`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get Star Wars timeline events
   */
  getTimelineEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/timeline`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Scrape Star Wars location data
   */
  scrapeLocationData(locationName: string): Observable<any> {
    const params = new HttpParams().set('location', locationName);
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/scrape/location`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get Star Wars species information
   */
  getSpeciesData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/species`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Scrape Star Wars technology data
   */
  scrapeTechnologyData(techType: string): Observable<any[]> {
    const params = new HttpParams().set('type', techType);
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/technology`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== SOCIAL MEDIA INTEGRATION =====

  /**
   * Monitor Star Wars social media mentions
   */
  getStarWarsSocialMentions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/social/mentions`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get Star Wars fan art and content
   */
  getFanContent(contentType: 'art' | 'videos' | 'memes'): Observable<any[]> {
    const params = new HttpParams().set('type', contentType);
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/fan-content`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== REAL-TIME DATA STREAMS =====

  /**
   * Subscribe to real-time Star Wars data updates
   */
  subscribeToRealTimeUpdates(): Observable<any> {
    // This would typically use WebSockets or Server-Sent Events
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/stream/subscribe`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get live Star Wars events and announcements
   */
  getLiveEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${this.brightDataEndpoint}/events/live`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== DATA ENRICHMENT =====

  /**
   * Enrich existing starship data with additional sources
   */
  enrichStarshipData(starshipId: number): Observable<EnhancedStarship> {
    return this.http.post<EnhancedStarship>(
      `${this.apiUrl}/starships/enhanced/${starshipId}/enrich`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Enrich existing planet data with additional sources
   */
  enrichPlanetData(planetId: number): Observable<EnhancedPlanet> {
    return this.http.post<EnhancedPlanet>(
      `${this.apiUrl}/planets/enhanced/${planetId}/enrich`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate AI-enhanced descriptions using scraped data
   */
  generateAIDescriptions(entityType: 'starship' | 'planet', entityId: number): Observable<any> {
    const params = new HttpParams()
      .set('type', entityType)
      .set('id', entityId.toString());

    return this.http.post(`${this.apiUrl}${this.brightDataEndpoint}/ai/enhance`, {}, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== BATCH OPERATIONS =====

  /**
   * Batch scrape multiple starships
   */
  batchScrapeStarships(starshipNames: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.brightDataEndpoint}/batch/starships`, {
      names: starshipNames
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Batch scrape multiple planets
   */
  batchScrapePlanets(planetNames: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.brightDataEndpoint}/batch/planets`, {
      names: planetNames
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ===== ANALYTICS AND INSIGHTS =====

  /**
   * Get Star Wars data analytics
   */
  getDataAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/analytics`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get content popularity insights
   */
  getPopularityInsights(entityType: string): Observable<any> {
    const params = new HttpParams().set('type', entityType);
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/insights/popularity`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get data quality metrics
   */
  getDataQualityMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.brightDataEndpoint}/quality/metrics`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('BrightDataService Error:', error);

    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
