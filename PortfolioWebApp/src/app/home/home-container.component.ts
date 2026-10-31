import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import { HomeDesktopComponent } from './home-desktop.component';
import { HomeMobileComponent } from './home-mobile.component';

@Component({
  selector: 'app-home',
  imports: [BreakpointDirective, HomeDesktopComponent, HomeMobileComponent],
  template: `
    <app-home-desktop *appBreakpoint="'desktop'" />
    <app-home-mobile *appBreakpoint="'mobile'" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContainerComponent {}
