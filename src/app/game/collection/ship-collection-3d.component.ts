import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ShipViewer3DComponent } from './ship-viewer/ship-viewer-3d.component';
import { SwapiService } from '../../characters/swapi.service';
import { Starship } from '../../characters/models/starship';
import { Starship3D, StarshipCustomization } from '../../shared/three/starship-3d.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-ship-collection-3d',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ShipViewer3DComponent
  ],
  template: `
    <div class="collection-container">
      <div class="collection-header">
        <h1>
          <mat-icon>rocket_launch</mat-icon>
          3D Колекція кораблів Star Wars
        </h1>
        <p>Досліджуйте детальні 3D моделі кораблів з галактики далеко-далеко</p>
      </div>

      <div class="collection-layout">
        <!-- Ship List -->
        <div class="ship-list-panel">
          <!-- Filters -->
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Пошук</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="filterShips()" placeholder="Назва корабля...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Клас корабля</mat-label>
              <mat-select [(value)]="selectedClass" (selectionChange)="filterShips()">
                <mat-option value="">Всі класи</mat-option>
                <mat-option value="fighter">Винищувачі</mat-option>
                <mat-option value="freighter">Вантажні</mat-option>
                <mat-option value="destroyer">Знищувачі</mat-option>
                <mat-option value="corvette">Корвети</mat-option>
                <mat-option value="battlestation">Бойові станції</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Ship Cards -->
          <div class="ship-cards" *ngIf="starships$ | async as starshipsResponse; else loading">
            <mat-card 
              *ngFor="let ship of filteredShips" 
              class="ship-card"
              [class.selected]="selectedShip?.name === ship.name"
              (click)="selectShip(ship)">
              
              <mat-card-header>
                <div mat-card-avatar [class]="'avatar-' + getClassSlug(ship.starship_class)">
                  <mat-icon>{{ getStarshipIcon(ship.starship_class) }}</mat-icon>
                </div>
                <mat-card-title>{{ ship.name }}</mat-card-title>
                <mat-card-subtitle>{{ ship.starship_class }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="ship-info">
                  <div class="info-item">
                    <strong>Модель:</strong> {{ ship.model }}
                  </div>
                  <div class="info-item">
                    <strong>Виробник:</strong> {{ ship.manufacturer }}
                  </div>
                  <div class="info-item" *ngIf="ship.length !== 'unknown'">
                    <strong>Довжина:</strong> {{ ship.length }} м
                  </div>
                  <div class="info-item" *ngIf="ship.crew !== 'unknown'">
                    <strong>Екіпаж:</strong> {{ ship.crew }}
                  </div>
                </div>

                <div class="ship-chips">
                  <mat-chip-set>
                    <mat-chip [class]="'class-' + getClassSlug(ship.starship_class)">
                      {{ ship.starship_class }}
                    </mat-chip>
                    <mat-chip *ngIf="ship.hyperdrive_rating !== '0' && ship.hyperdrive_rating !== 'unknown'" 
                             class="hyperdrive-chip">
                      Hyperdrive {{ ship.hyperdrive_rating }}
                    </mat-chip>
                    <mat-chip *ngIf="isCapitalShip(ship)" class="capital-ship-chip">
                      Capital Ship
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button color="primary" (click)="selectShip(ship); $event.stopPropagation()">
                  <mat-icon>view_in_ar</mat-icon>
                  3D Перегляд
                </button>
                <button mat-button (click)="addToFleet(ship); $event.stopPropagation()">
                  <mat-icon>add</mat-icon>
                  До флоту
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <ng-template #loading>
            <div class="loading-container">
              <div class="spinner"></div>
              <p>Завантаження кораблів з галактики...</p>
            </div>
          </ng-template>
        </div>

        <!-- 3D Viewer -->
        <div class="viewer-panel">
          <app-ship-viewer-3d 
            [starshipData]="selectedShip"
            (shipSelected)="onShipSelected($event)"
            (customizationChanged)="onCustomizationChanged($event)">
          </app-ship-viewer-3d>

          <!-- No Selection State -->
          <div class="no-selection" *ngIf="!selectedShip">
            <mat-icon>rocket_launch</mat-icon>
            <h3>Оберіть корабель для 3D перегляду</h3>
            <p>Клікніть на будь-який корабель зі списку, щоб переглянути його детальну 3D модель</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="navigation">
        <button mat-fab color="accent" routerLink="/game" matTooltip="Повернутися до меню">
          <mat-icon>arrow_back</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .collection-container {
      height: 100vh;
      background: linear-gradient(135deg, #0f0f23 0%, #000000 100%);
      display: flex;
      flex-direction: column;
    }

    .collection-header {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #ffd700;
    }

    .collection-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #ffd700;
      margin: 0 0 8px 0;
    }

    .collection-header p {
      color: #ccc;
      margin: 0;
    }

    .collection-layout {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .ship-list-panel {
      width: 400px;
      background: rgba(0, 0, 0, 0.8);
      border-right: 1px solid #ffd700;
      display: flex;
      flex-direction: column;
    }

    .filters {
      padding: 16px;
      border-bottom: 1px solid #ffd700;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filters mat-form-field {
      width: 100%;
    }

    .filters ::ng-deep .mat-mdc-form-field {
      --mat-form-field-filled-label-text-color: #ffd700;
      --mdc-filled-text-field-input-text-color: white;
    }

    .ship-cards {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ship-card {
      background: rgba(26, 26, 46, 0.9);
      color: white;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .ship-card:hover {
      border-color: #ffd700;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    }

    .ship-card.selected {
      border-color: #ffd700;
      background: rgba(255, 215, 0, 0.1);
    }

    .ship-card mat-card-title {
      color: #ffd700;
    }

    .ship-info .info-item {
      margin: 4px 0;
      font-size: 12px;
    }

    .ship-info strong {
      color: #ffd700;
    }

    .ship-chips {
      margin-top: 8px;
    }

    .ship-chips mat-chip {
      font-size: 10px;
    }

    .class-fighter { background: #ff4444; }
    .class-freighter { background: #44ff44; }
    .class-destroyer { background: #4444ff; }
    .class-corvette { background: #ff44ff; }
    .class-battlestation { background: #ffff44; color: black; }

    .hyperdrive-chip { background: #00aaff; }
    .capital-ship-chip { background: #ff8800; }

    .avatar-fighter { background: #ff4444; }
    .avatar-freighter { background: #44ff44; }
    .avatar-destroyer { background: #4444ff; }
    .avatar-corvette { background: #ff44ff; }
    .avatar-battlestation { background: #ffff44; color: black; }

    .viewer-panel {
      flex: 1;
      position: relative;
    }

    .no-selection {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #ccc;
    }

    .no-selection mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ffd700;
      margin-bottom: 16px;
    }

    .no-selection h3 {
      color: #ffd700;
      margin: 0 0 8px 0;
    }

    .no-selection p {
      margin: 0;
      max-width: 300px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: white;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #333;
      border-top: 4px solid #ffd700;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .navigation {
      position: absolute;
      bottom: 20px;
      left: 20px;
    }

    .navigation button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
    }
  `]
})
export class ShipCollection3DComponent implements OnInit, OnDestroy {
  starships$!: Observable<any>;
  filteredShips: Starship[] = [];
  selectedShip: Starship | null = null;
  searchTerm = '';
  selectedClass = '';

  private allShips: Starship[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.loadStarships();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Завантаження кораблів
   */
  private loadStarships(): void {
    this.starships$ = this.swapiService.getStarships();
    
    this.subscriptions.push(
      this.starships$.subscribe({
        next: (response) => {
          this.allShips = response.results || [];
          this.filteredShips = [...this.allShips];
          
          // Автоматично вибираємо перший корабель
          if (this.filteredShips.length > 0) {
            this.selectShip(this.filteredShips[0]);
          }
        },
        error: (error) => {
          console.error('Error loading starships:', error);
        }
      })
    );
  }

  /**
   * Фільтрація кораблів
   */
  filterShips(): void {
    this.filteredShips = this.allShips.filter(ship => {
      const matchesSearch = !this.searchTerm || 
        ship.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ship.model.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesClass = !this.selectedClass || 
        this.getClassSlug(ship.starship_class) === this.selectedClass;

      return matchesSearch && matchesClass;
    });
  }

  /**
   * Вибір корабля
   */
  selectShip(ship: Starship): void {
    this.selectedShip = ship;
  }

  /**
   * Обробка вибору корабля в 3D переглядачі
   */
  onShipSelected(starship3D: Starship3D): void {
    console.log('3D Ship selected:', starship3D.name);
  }

  /**
   * Обробка зміни кастомізації
   */
  onCustomizationChanged(customization: StarshipCustomization): void {
    console.log('Customization changed:', customization);
  }

  /**
   * Додавання до флоту
   */
  addToFleet(ship: Starship): void {
    console.log('Adding to fleet:', ship.name);
    // TODO: Реалізувати додавання до флоту
  }

  /**
   * Отримання іконки корабля
   */
  getStarshipIcon(starshipClass: string): string {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('fighter')) return 'flight';
    if (classLower.includes('destroyer')) return 'military_tech';
    if (classLower.includes('freighter')) return 'local_shipping';
    if (classLower.includes('corvette')) return 'directions_boat';
    if (classLower.includes('battlestation')) return 'dangerous';
    return 'rocket_launch';
  }

  /**
   * Отримання slug класу
   */
  getClassSlug(starshipClass: string): string {
    const classLower = starshipClass.toLowerCase();
    if (classLower.includes('fighter')) return 'fighter';
    if (classLower.includes('destroyer')) return 'destroyer';
    if (classLower.includes('freighter')) return 'freighter';
    if (classLower.includes('corvette')) return 'corvette';
    if (classLower.includes('battlestation')) return 'battlestation';
    return 'unknown';
  }

  /**
   * Перевірка чи є корабель капітальним
   */
  isCapitalShip(ship: Starship): boolean {
    const length = parseFloat(ship.length?.replace(/,/g, '') || '0');
    return length > 100 || ship.starship_class.toLowerCase().includes('destroyer') ||
           ship.starship_class.toLowerCase().includes('battlestation');
  }
}
