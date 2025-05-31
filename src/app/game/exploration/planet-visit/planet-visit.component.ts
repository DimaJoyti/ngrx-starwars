import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-planet-visit',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="planet-visit-container">
      <h1>Planet Visit</h1>
      <p>Coming soon...</p>
      <button mat-raised-button color="primary" routerLink="/game/exploration">
        <mat-icon>arrow_back</mat-icon>
        Back to Galaxy Map
      </button>
    </div>
  `,
  styles: [`
    .planet-visit-container {
      padding: 20px;
      text-align: center;
    }
    h1 { color: var(--sw-primary); margin-bottom: 20px; }
  `]
})
export class PlanetVisitComponent {}
