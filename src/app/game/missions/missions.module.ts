import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Store
import { missionReducer } from './store/mission.reducer';
import { MissionEffects } from './store/mission.effects';

// Components
import { MissionListComponent } from './components/mission-list/mission-list.component';
import { MissionDetailComponent } from './components/mission-detail/mission-detail.component';
import { MissionCardComponent } from './components/mission-card/mission-card.component';
import { MissionProgressComponent } from './components/mission-progress/mission-progress.component';
import { MissionObjectiveComponent } from './components/mission-objective/mission-objective.component';
import { MissionFilterComponent } from './components/mission-filter/mission-filter.component';
import { MissionStatsComponent } from './components/mission-stats/mission-stats.component';
import { BrightDataSyncComponent } from './components/bright-data-sync/bright-data-sync.component';
import { UnityMissionViewerComponent } from './components/unity-mission-viewer/unity-mission-viewer.component';

// Services
import { MissionService } from './services/mission.service';

// Shared modules
import { SharedModule } from '../../shared/shared.module';

// Routes
const routes = [
  {
    path: '',
    component: MissionListComponent
  },
  {
    path: 'detail/:id',
    component: MissionDetailComponent
  },
  {
    path: 'stats',
    component: MissionStatsComponent
  },
  {
    path: 'sync',
    component: BrightDataSyncComponent
  }
];

@NgModule({
  declarations: [
    MissionListComponent,
    MissionDetailComponent,
    MissionCardComponent,
    MissionProgressComponent,
    MissionObjectiveComponent,
    MissionFilterComponent,
    MissionStatsComponent,
    BrightDataSyncComponent,
    UnityMissionViewerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('missions', missionReducer),
    EffectsModule.forFeature([MissionEffects]),
    SharedModule
  ],
  providers: [
    MissionService
  ],
  exports: [
    MissionListComponent,
    MissionDetailComponent,
    MissionCardComponent,
    MissionProgressComponent,
    MissionObjectiveComponent,
    MissionFilterComponent,
    MissionStatsComponent,
    BrightDataSyncComponent,
    UnityMissionViewerComponent
  ]
})
export class MissionsModule { }
