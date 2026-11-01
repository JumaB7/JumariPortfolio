import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HighchartsChartComponent } from 'highcharts-angular';
import { CountUpDirective } from '../directives/count-up.directive';
import { RevealDirective } from '../directives/reveal.directive';
import { AuroraBackgroundComponent } from './aurora-background.component';
import { HomeBase } from './home-base';
import { ProjectShowcaseStageComponent } from './project-showcase-stage.component';

@Component({
  selector: 'app-home-mobile',
  imports: [
    NgClass,
    ReactiveFormsModule,
    RouterLink,
    HighchartsChartComponent,
    RevealDirective,
    CountUpDirective,
    AuroraBackgroundComponent,
    ProjectShowcaseStageComponent,
  ],
  templateUrl: './home-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMobileComponent extends HomeBase {}
