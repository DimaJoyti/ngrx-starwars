import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { GalaxyMap3DComponent } from './galaxy-map-3d.component';

@Component({
  selector: 'app-galaxy-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    GalaxyMap3DComponent
  ],
  template: `
    <div class="galaxy-map-container">
      <mat-tab-group>
        <mat-tab label="🌌 3D Галактика">
          <app-galaxy-map-3d></app-galaxy-map-3d>
        </mat-tab>

        <mat-tab label="📋 Список планет">
          <div class="list-view">
            <h2>Планети галактики</h2>
            <p>Традиційний вигляд списку планет</p>
            <button mat-raised-button color="primary" routerLink="/planets">
              <mat-icon>list</mat-icon>
              Переглянути список планет
            </button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .galaxy-map-container {
      height: 100vh;
      overflow: hidden;
    }

    .galaxy-map-container ::ng-deep .mat-mdc-tab-group {
      height: 100%;
    }

    .galaxy-map-container ::ng-deep .mat-mdc-tab-body-wrapper {
      height: calc(100% - 48px);
    }

    .galaxy-map-container ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    .list-view {
      padding: 40px;
      text-align: center;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .list-view h2 {
      color: #ffd700;
      margin-bottom: 16px;
    }

    .list-view p {
      color: #ccc;
      margin-bottom: 24px;
    }
  `]
})
export class GalaxyMapComponent {}
