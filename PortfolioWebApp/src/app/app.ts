import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentHostComponent } from './agent/agent-host.component';
import { LoadingSpinnerComponent } from './components/loading-spinner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgentHostComponent, LoadingSpinnerComponent],
  host: {
    class: 'block min-h-screen bg-background text-text-primary',
  },
  template: `
    <app-loading-spinner />
    <router-outlet />
    <app-agent-host />
  `,
})
export class App {}
