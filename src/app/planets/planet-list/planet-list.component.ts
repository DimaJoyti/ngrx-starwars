import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

import { SwapiService } from '../../characters/swapi.service';
import { Planet } from '../../characters/models/planet';

@Component({
  selector: 'app-planet-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="planets-container">
      <h1 class="page-title">
        <mat-icon>public</mat-icon>
        Star Wars Planets
      </h1>
      
      <div class="planets-grid" *ngIf="planets$ | async as planetsResponse; else loading">
        <mat-card *ngFor="let planet of planetsResponse.results" class="planet-card">
          <mat-card-header>
            <mat-card-title>{{ planet.name }}</mat-card-title>
            <mat-card-subtitle>{{ planet.terrain }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="planet-info">
              <div class="info-row">
                <strong>Climate:</strong> {{ planet.climate }}
              </div>
              <div class="info-row">
                <strong>Population:</strong> {{ planet.population | number }}
              </div>
              <div class="info-row">
                <strong>Diameter:</strong> {{ planet.diameter }} km
              </div>
              <div class="info-row">
                <strong>Gravity:</strong> {{ planet.gravity }}
              </div>
            </div>
            
            <div class="planet-chips">
              <mat-chip-set>
                <mat-chip>{{ planet.climate }}</mat-chip>
                <mat-chip *ngIf="planet.surface_water !== '0'">
                  {{ planet.surface_water }}% water
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading planets from a galaxy far, far away...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .planets-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
      color: #ffd700;
      text-align: center;
      justify-content: center;
    }
    
    .planets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    
    .planet-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      border: 1px solid #ffd700;
    }
    
    .planet-card mat-card-title {
      color: #ffd700;
      font-size: 1.5em;
    }
    
    .planet-card mat-card-subtitle {
      color: #ccc;
    }
    
    .planet-info {
      margin: 15px 0;
    }
    
    .info-row {
      margin: 8px 0;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    }
    
    .info-row strong {
      color: #ffd700;
    }
    
    .planet-chips {
      margin-top: 15px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #ffd700;
    }
    
    .loading-container p {
      margin-top: 20px;
      font-style: italic;
    }
  `]
})
export class PlanetListComponent implements OnInit {
  planets$!: Observable<any>;

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.planets$ = this.swapiService.getPlanets();
  }
}
