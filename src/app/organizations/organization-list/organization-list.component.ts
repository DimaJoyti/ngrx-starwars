import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Observable } from 'rxjs';

import { SwapiService } from '../../characters/swapi.service';
import { Organization } from '../../characters/models/organization';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule
  ],
  template: `
    <div class="organizations-container">
      <h1 class="page-title">
        <mat-icon>groups</mat-icon>
        Star Wars Organizations
      </h1>
      
      <div class="organizations-grid" *ngIf="organizations$ | async as orgsResponse; else loading">
        <mat-card *ngFor="let org of orgsResponse.results" class="organization-card" 
                  [class]="'org-type-' + org.type">
          <mat-card-header>
            <div mat-card-avatar [class]="'avatar-' + org.type">
              <mat-icon>{{ getOrgIcon(org.type) }}</mat-icon>
            </div>
            <mat-card-title>{{ org.name }}</mat-card-title>
            <mat-card-subtitle>{{ org.type | titlecase }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="org-description">{{ org.description }}</p>
            
            <div class="org-details">
              <div class="detail-row">
                <strong>Founded:</strong> {{ org.founded }}
              </div>
              <div class="detail-row" *ngIf="org.dissolved">
                <strong>Dissolved:</strong> {{ org.dissolved }}
              </div>
              <div class="detail-row">
                <strong>Leader:</strong> {{ org.leader }}
              </div>
            </div>
            
            <div class="org-status">
              <mat-chip-set>
                <mat-chip [class]="'status-' + (org.dissolved ? 'dissolved' : 'active')">
                  {{ org.dissolved ? 'Dissolved' : 'Active' }}
                </mat-chip>
                <mat-chip>{{ org.type | titlecase }}</mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading galactic organizations...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .organizations-container {
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
    
    .organizations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }
    
    .organization-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      border: 1px solid #ffd700;
      transition: transform 0.3s ease;
    }
    
    .organization-card:hover {
      transform: translateY(-5px);
    }
    
    .org-type-religious {
      border-color: #4CAF50;
    }
    
    .org-type-government {
      border-color: #2196F3;
    }
    
    .org-type-military {
      border-color: #F44336;
    }
    
    .avatar-religious {
      background-color: #4CAF50;
    }
    
    .avatar-government {
      background-color: #2196F3;
    }
    
    .avatar-military {
      background-color: #F44336;
    }
    
    .organization-card mat-card-title {
      color: #ffd700;
      font-size: 1.4em;
    }
    
    .organization-card mat-card-subtitle {
      color: #ccc;
    }
    
    .org-description {
      margin: 15px 0;
      line-height: 1.6;
      color: #e0e0e0;
    }
    
    .org-details {
      margin: 15px 0;
    }
    
    .detail-row {
      margin: 8px 0;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
    }
    
    .detail-row strong {
      color: #ffd700;
    }
    
    .org-status {
      margin-top: 15px;
    }
    
    .status-active {
      background-color: #4CAF50 !important;
      color: white !important;
    }
    
    .status-dissolved {
      background-color: #757575 !important;
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
export class OrganizationListComponent implements OnInit {
  organizations$!: Observable<any>;

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.organizations$ = this.swapiService.getOrganizations();
  }

  getOrgIcon(type: string): string {
    switch (type) {
      case 'religious':
        return 'auto_awesome';
      case 'government':
        return 'account_balance';
      case 'military':
        return 'security';
      default:
        return 'groups';
    }
  }
}
