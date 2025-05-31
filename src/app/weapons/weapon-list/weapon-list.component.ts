import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

import { SwapiService } from '../../characters/swapi.service';
import { Weapon } from '../../characters/models/weapon';

@Component({
  selector: 'app-weapon-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="weapons-container">
      <h1 class="page-title">
        <mat-icon>flash_on</mat-icon>
        Star Wars Weapons
      </h1>
      
      <div class="weapons-grid" *ngIf="weapons$ | async as weaponsResponse; else loading">
        <mat-card *ngFor="let weapon of weaponsResponse.results" class="weapon-card"
                  [class]="'weapon-type-' + weapon.type">
          <mat-card-header>
            <div mat-card-avatar [class]="'avatar-' + weapon.type">
              <mat-icon>{{ getWeaponIcon(weapon.type) }}</mat-icon>
            </div>
            <mat-card-title>{{ weapon.name }}</mat-card-title>
            <mat-card-subtitle>{{ weapon.type | titlecase }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="weapon-description">{{ weapon.description }}</p>
            
            <div class="weapon-specs">
              <div class="spec-row">
                <strong>Manufacturer:</strong> {{ weapon.manufacturer }}
              </div>
              <div class="spec-row" *ngIf="weapon.length !== 'unknown'">
                <strong>Length:</strong> {{ weapon.length }}
              </div>
              <div class="spec-row" *ngIf="weapon.weight !== 'unknown'">
                <strong>Weight:</strong> {{ weapon.weight }}
              </div>
              <div class="spec-row" *ngIf="weapon.color && weapon.color !== 'unknown'">
                <strong>Color:</strong> 
                <span class="color-indicator" [style.background-color]="getColorValue(weapon.color)"></span>
                {{ weapon.color | titlecase }}
              </div>
              <div class="spec-row" *ngIf="weapon.crystal_type && weapon.crystal_type !== 'unknown'">
                <strong>Crystal Type:</strong> {{ weapon.crystal_type }}
              </div>
            </div>
            
            <div class="weapon-chips">
              <mat-chip-set>
                <mat-chip [class]="'type-' + weapon.type">{{ weapon.type | titlecase }}</mat-chip>
                <mat-chip *ngIf="weapon.color && weapon.color !== 'unknown'" 
                         [style.background-color]="getColorValue(weapon.color)"
                         [style.color]="getTextColor(weapon.color)">
                  {{ weapon.color | titlecase }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading weapons from across the galaxy...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .weapons-container {
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
    
    .weapons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }
    
    .weapon-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      border: 1px solid #ffd700;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .weapon-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
    }
    
    .weapon-type-lightsaber {
      border-color: #00ff00;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }
    
    .weapon-type-superweapon {
      border-color: #ff0000;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
    }
    
    .avatar-lightsaber {
      background: linear-gradient(45deg, #00ff00, #0080ff);
    }
    
    .avatar-superweapon {
      background: linear-gradient(45deg, #ff0000, #ff8000);
    }
    
    .weapon-card mat-card-title {
      color: #ffd700;
      font-size: 1.4em;
    }
    
    .weapon-card mat-card-subtitle {
      color: #ccc;
    }
    
    .weapon-description {
      margin: 15px 0;
      line-height: 1.6;
      color: #e0e0e0;
      font-style: italic;
    }
    
    .weapon-specs {
      margin: 15px 0;
    }
    
    .spec-row {
      margin: 8px 0;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .spec-row strong {
      color: #ffd700;
    }
    
    .color-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-block;
      border: 2px solid #ffd700;
    }
    
    .weapon-chips {
      margin-top: 15px;
    }
    
    .type-lightsaber {
      background-color: #00ff00 !important;
      color: black !important;
    }
    
    .type-superweapon {
      background-color: #ff0000 !important;
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
  `]
})
export class WeaponListComponent implements OnInit {
  weapons$!: Observable<any>;

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.weapons$ = this.swapiService.getWeapons();
  }

  getWeaponIcon(type: string): string {
    switch (type) {
      case 'lightsaber':
        return 'flash_on';
      case 'superweapon':
        return 'dangerous';
      case 'blaster':
        return 'gps_fixed';
      default:
        return 'hardware';
    }
  }

  getColorValue(color: string): string {
    const colorMap: { [key: string]: string } = {
      'blue': '#0080ff',
      'red': '#ff0000',
      'green': '#00ff00',
      'purple': '#8000ff',
      'yellow': '#ffff00',
      'orange': '#ff8000',
      'white': '#ffffff',
      'black': '#000000'
    };
    return colorMap[color.toLowerCase()] || '#ffd700';
  }

  getTextColor(color: string): string {
    const lightColors = ['yellow', 'white', 'green'];
    return lightColors.includes(color.toLowerCase()) ? 'black' : 'white';
  }
}
