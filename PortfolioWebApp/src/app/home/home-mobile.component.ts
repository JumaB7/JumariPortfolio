import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountUpDirective } from '../directives/count-up.directive';
import { RevealDirective } from '../directives/reveal.directive';
import { ViewportEnterDirective } from '../directives/viewport-enter.directive';
import { AuroraBackgroundComponent } from './aurora-background.component';
import { HomeBase } from './home-base';
import { HomeOverviewChartsComponent } from './home-overview-charts.component';
import { OverviewSkeletonComponent } from './overview-skeleton.component';
import { ProjectShowcaseStageComponent } from './project-showcase-stage.component';

@Component({
  selector: 'app-home-mobile',
  imports: [
    NgClass,
    RouterLink,
    RevealDirective,
    ViewportEnterDirective,
    CountUpDirective,
    AuroraBackgroundComponent,
    ProjectShowcaseStageComponent,
    OverviewSkeletonComponent,
    HomeOverviewChartsComponent,
  ],
  templateUrl: './home-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMobileComponent extends HomeBase {}
