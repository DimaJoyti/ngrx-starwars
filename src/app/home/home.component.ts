import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { SwapiService } from '../characters/swapi.service';

interface GalaxyStats {
  characters: number;
  planets: number;
  organizations: number;
  weapons: number;
  starships: number;
  films: number;
  species: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-line">EXPLORE THE</span>
            <span class="title-line main">STAR WARS</span>
            <span class="title-line">GALAXY</span>
          </h1>
          <p class="hero-subtitle">
            Discover characters, planets, organizations, weapons, and starships from a galaxy far, far away
          </p>
        </div>
        <div class="hero-stats" *ngIf="stats$ | async as stats; else loadingStats">
          <div class="stat-item">
            <mat-icon>people</mat-icon>
            <span class="stat-number">{{ stats.characters }}+</span>
            <span class="stat-label">Characters</span>
          </div>
          <div class="stat-item">
            <mat-icon>public</mat-icon>
            <span class="stat-number">{{ stats.planets }}+</span>
            <span class="stat-label">Planets</span>
          </div>
          <div class="stat-item">
            <mat-icon>rocket_launch</mat-icon>
            <span class="stat-number">{{ stats.starships }}+</span>
            <span class="stat-label">Starships</span>
          </div>
          <div class="stat-item">
            <mat-icon>movie</mat-icon>
            <span class="stat-number">{{ stats.films }}</span>
            <span class="stat-label">Films</span>
          </div>
        </div>
        <ng-template #loadingStats>
          <div class="loading-stats">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        </ng-template>
      </section>

      <!-- Categories Section -->
      <section class="categories-section">
        <h2 class="section-title">Explore Categories</h2>
        <div class="categories-grid">
          <mat-card class="category-card characters-card" routerLink="/">
            <mat-card-header>
              <div mat-card-avatar class="avatar-characters">
                <mat-icon>people</mat-icon>
              </div>
              <mat-card-title>Characters</mat-card-title>
              <mat-card-subtitle>Heroes, villains & more</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Meet iconic characters from Luke Skywalker to Darth Vader, spanning all eras of the Star Wars saga.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">
                <mat-icon>arrow_forward</mat-icon>
                Explore Characters
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="category-card planets-card" routerLink="/planets">
            <mat-card-header>
              <div mat-card-avatar class="avatar-planets">
                <mat-icon>public</mat-icon>
              </div>
              <mat-card-title>Planets</mat-card-title>
              <mat-card-subtitle>Worlds across the galaxy</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Discover diverse worlds from desert Tatooine to the city-planet Coruscant and frozen Hoth.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">
                <mat-icon>arrow_forward</mat-icon>
                Explore Planets
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="category-card organizations-card" routerLink="/organizations">
            <mat-card-header>
              <div mat-card-avatar class="avatar-organizations">
                <mat-icon>groups</mat-icon>
              </div>
              <mat-card-title>Organizations</mat-card-title>
              <mat-card-subtitle>Jedi, Sith, Empire & more</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Learn about the Jedi Order, Galactic Empire, Rebel Alliance, and other galactic powers.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">
                <mat-icon>arrow_forward</mat-icon>
                Explore Organizations
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="category-card weapons-card" routerLink="/weapons">
            <mat-card-header>
              <div mat-card-avatar class="avatar-weapons">
                <mat-icon>flash_on</mat-icon>
              </div>
              <mat-card-title>Weapons</mat-card-title>
              <mat-card-subtitle>Lightsabers & superweapons</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Examine legendary weapons from elegant lightsabers to the planet-destroying Death Star.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">
                <mat-icon>arrow_forward</mat-icon>
                Explore Weapons
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="category-card starships-card" routerLink="/starships">
            <mat-card-header>
              <div mat-card-avatar class="avatar-starships">
                <mat-icon>rocket_launch</mat-icon>
              </div>
              <mat-card-title>Starships</mat-card-title>
              <mat-card-subtitle>X-wings, Star Destroyers & more</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Explore iconic vessels from nimble X-wing fighters to massive Imperial Star Destroyers.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">
                <mat-icon>arrow_forward</mat-icon>
                Explore Starships
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: var(--sw-gradient-space);
    }

    .hero-section {
      padding: 60px 20px;
      text-align: center;
      background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
      border-bottom: 2px solid var(--sw-primary);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto 40px;
    }

    .hero-title {
      margin: 0 0 20px;
      font-size: 3.5rem;
      line-height: 1.1;
      font-weight: 700;
    }

    .title-line {
      display: block;
      background: var(--sw-gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 10px rgba(255, 232, 31, 0.5));
    }

    .title-line.main {
      font-size: 4rem;
      letter-spacing: 3px;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: var(--sw-text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
      margin-top: 40px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: rgba(255, 215, 0, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(255, 215, 0, 0.3);
      min-width: 120px;
    }

    .stat-item mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: var(--sw-primary);
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--sw-primary);
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--sw-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .loading-stats {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .categories-section {
      padding: 60px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      color: var(--sw-primary);
      margin: 0 0 40px;
      font-weight: 600;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }

    .category-card {
      background: var(--sw-gradient-card);
      border: 1px solid var(--sw-primary);
      transition: all 0.3s ease;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .category-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 30px rgba(255, 215, 0, 0.3);
      border-color: var(--sw-primary-light);
    }

    .category-card mat-card-title {
      color: var(--sw-primary);
      font-size: 1.4rem;
      font-weight: 600;
    }

    .category-card mat-card-subtitle {
      color: var(--sw-text-secondary);
    }

    .category-card mat-card-content {
      flex: 1;
      color: var(--sw-text-primary);
      line-height: 1.6;
    }

    .avatar-characters { background: linear-gradient(45deg, #4CAF50, #81C784); }
    .avatar-planets { background: linear-gradient(45deg, #2196F3, #64B5F6); }
    .avatar-organizations { background: linear-gradient(45deg, #FF9800, #FFB74D); }
    .avatar-weapons { background: linear-gradient(45deg, #F44336, #EF5350); }
    .avatar-starships { background: linear-gradient(45deg, #9C27B0, #BA68C8); }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .title-line.main {
        font-size: 3rem;
      }
      
      .hero-stats {
        gap: 20px;
      }
      
      .categories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  stats$!: Observable<GalaxyStats>;

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.stats$ = forkJoin({
      characters: this.swapiService.getCharacters(),
      planets: this.swapiService.getPlanets(),
      organizations: this.swapiService.getOrganizations(),
      weapons: this.swapiService.getWeapons(),
      starships: this.swapiService.getStarships(),
      films: this.swapiService.getFilms(),
      species: this.swapiService.getSpecies()
    }).pipe(
      map(responses => ({
        characters: responses.characters.count,
        planets: responses.planets.count,
        organizations: responses.organizations.count,
        weapons: responses.weapons.count,
        starships: responses.starships.count,
        films: responses.films.count,
        species: responses.species.count
      }))
    );
  }
}
