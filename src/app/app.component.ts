import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { VERSION } from '@angular/core';
import {
  animate,
  group,
  query,
  style,
  transition,
  trigger
} from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('smooth', [
      transition('home => details', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
          optional: true
        }),
        group([
          query(
            ':enter',
            [
              style({ transform: 'translateX(100%)' }),
              animate(
                '0.5s ease-in-out',
                style({ transform: 'translateX(0%)' })
              )
            ],
            { optional: true }
          ),
          query(
            ':leave',
            [
              style({ transform: 'translate(0%)' }),
              animate(
                '0.5s ease-in-out',
                style({ transform: 'translateX(-100%)' })
              )
            ],
            { optional: true }
          )
        ])
      ]),
      transition('details => home', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
          optional: true
        }),
        group([
          query(
            ':enter',
            [
              style({ transform: 'translateX(-100%)' }),
              animate(
                '0.5s ease-in-out',
                style({ transform: 'translateX(0%)' })
              )
            ],
            { optional: true }
          ),
          query(
            ':leave',
            [
              style({ transform: 'translate(0%)' }),
              animate(
                '0.5s ease-in-out',
                style({ transform: 'translateX(100%)' })
              )
            ],
            { optional: true }
          )
        ])
      ])
    ])
  ]
})
export class AppComponent implements OnDestroy {
  title = 'Star Wars Character Explorer';
  angularVersion = VERSION.full;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  getState(outlet: any) {
    return outlet.activatedRouteData.state;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
