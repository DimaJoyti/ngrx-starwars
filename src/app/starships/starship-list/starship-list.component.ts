import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

import { SwapiService } from '../../characters/swapi.service';
import { Starship } from '../../characters/models/starship';

@Component({
  selector: 'app-starship-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="starships-container">
      <h1 class="page-title">
        <mat-icon>rocket_launch</mat-icon>
        Star Wars Starships
      </h1>
      
      <div class="starships-grid" *ngIf="starships$ | async as starshipsResponse; else loading">
        <mat-card *ngFor="let starship of starshipsResponse.results" class="starship-card"
                  [class]="'starship-class-' + getClassSlug(starship.starship_class)">
          <mat-card-header>
            <div mat-card-avatar [class]="'avatar-' + getClassSlug(starship.starship_class)">
              <mat-icon>{{ getStarshipIcon(starship.starship_class) }}</mat-icon>
            </div>
            <mat-card-title>{{ starship.name }}</mat-card-title>
            <mat-card-subtitle>{{ starship.starship_class | titlecase }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="starship-specs">
              <div class="spec-grid">
                <div class="spec-item">
                  <strong>Manufacturer:</strong>
                  <span>{{ starship.manufacturer }}</span>
                </div>
                <div class="spec-item">
                  <strong>Length:</strong>
                  <span>{{ starship.length }} m</span>
                </div>
                <div class="spec-item">
                  <strong>Crew:</strong>
                  <span>{{ starship.crew }}</span>
                </div>
                <div class="spec-item" *ngIf="starship.passengers !== '0' && starship.passengers !== 'n/a'">
                  <strong>Passengers:</strong>
                  <span>{{ starship.passengers }}</span>
                </div>
                <div class="spec-item" *ngIf="starship.hyperdrive_rating !== '0'">
                  <strong>Hyperdrive:</strong>
                  <span>Class {{ starship.hyperdrive_rating }}</span>
                </div>
                <div class="spec-item">
                  <strong>Max Speed:</strong>
                  <span>{{ starship.max_atmosphering_speed }} km/h</span>
                </div>
                <div class="spec-item" *ngIf="starship.cost_in_credits !== 'unknown'">
                  <strong>Cost:</strong>
                  <span>{{ starship.cost_in_credits | number }} credits</span>
                </div>
              </div>
            </div>
            
            <div class="starship-chips">
              <mat-chip-set>
                <mat-chip [class]="'class-' + getClassSlug(starship.starship_class)">
                  {{ starship.starship_class | titlecase }}
                </mat-chip>
                <mat-chip *ngIf="starship.hyperdrive_rating !== '0'" class="hyperdrive-chip">
                  Hyperdrive {{ starship.hyperdrive_rating }}
                </mat-chip>
                <mat-chip *ngIf="isCapitalShip(starship)" class="capital-ship-chip">
                  Capital Ship
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading starships from across the galaxy...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .starships-container {
      padding: 20px;
      max-width: 1400px;
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
    
    .starships-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 20px;
    }
    
    .starship-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      border: 1px solid #ffd700;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .starship-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
    }
    
    .starship-class-starfighter {
      border-color: #00ff00;
    }
    
    .starship-class-star-destroyer {
      border-color: #ff0000;
    }
    
    .starship-class-light-freighter {
      border-color: #0080ff;
    }
    
    .avatar-starfighter {
      background: linear-gradient(45deg, #00ff00, #80ff80);
    }
    
    .avatar-star-destroyer {
      background: linear-gradient(45deg, #ff0000, #ff8080);
    }
    
    .avatar-light-freighter {
      background: linear-gradient(45deg, #0080ff, #80c0ff);
    }
    
    .avatar-corvette {
      background: linear-gradient(45deg, #ff8000, #ffb366);
    }
    
    .starship-card mat-card-title {
      color: #ffd700;
      font-size: 1.4em;
    }
    
    .starship-card mat-card-subtitle {
      color: #ccc;
    }
    
    .starship-specs {
      margin: 15px 0;
    }
    
    .spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .spec-item {
      display: flex;
      flex-direction: column;
      padding: 8px;
      background: rgba(255, 215, 0, 0.1);
      border-radius: 4px;
      border-left: 3px solid #ffd700;
    }
    
    .spec-item strong {
      color: #ffd700;
      font-size: 0.85rem;
      margin-bottom: 4px;
    }
    
    .spec-item span {
      color: #e0e0e0;
      font-size: 0.9rem;
    }
    
    .starship-chips {
      margin-top: 15px;
    }
    
    .class-starfighter {
      background-color: #00ff00 !important;
      color: black !important;
    }
    
    .class-star-destroyer {
      background-color: #ff0000 !important;
      color: white !important;
    }
    
    .class-light-freighter {
      background-color: #0080ff !important;
      color: white !important;
    }
    
    .hyperdrive-chip {
      background-color: #8000ff !important;
      color: white !important;
    }
    
    .capital-ship-chip {
      background-color: #ff8000 !important;
      color: white !important;
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
    
    @media (max-width: 768px) {
      .starships-grid {
        grid-template-columns: 1fr;
      }
      
      .spec-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StarshipListComponent implements OnInit {
  starships$!: Observable<any>;

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.starships$ = this.swapiService.getStarships();
  }

  getStarshipIcon(starshipClass: string): string {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('fighter')) return 'flight';
    if (classLower.includes('destroyer')) return 'military_tech';
    if (classLower.includes('freighter')) return 'local_shipping';
    if (classLower.includes('corvette')) return 'directions_boat';
    if (classLower.includes('battlestation')) return 'dangerous';
    return 'rocket_launch';
  }

  getClassSlug(starshipClass: string): string {
    return starshipClass.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  isCapitalShip(starship: Starship): boolean {
    const length = parseFloat(starship.length.replace(/,/g, ''));
    return length > 100; // Ships longer than 100m are considered capital ships
  }
}
