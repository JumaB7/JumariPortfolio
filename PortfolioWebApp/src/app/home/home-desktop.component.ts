import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HighchartsChartComponent } from 'highcharts-angular';
import { CountUpDirective } from '../directives/count-up.directive';
import { RevealDirective } from '../directives/reveal.directive';
import { AuroraBackgroundComponent } from './aurora-background.component';
import { HomeBase } from './home-base';

@Component({
  selector: 'app-home-desktop',
  imports: [
    NgClass,
    ReactiveFormsModule,
    RouterLink,
    HighchartsChartComponent,
    RevealDirective,
    CountUpDirective,
    AuroraBackgroundComponent,
  ],
  templateUrl: './home-desktop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDesktopComponent extends HomeBase {}
