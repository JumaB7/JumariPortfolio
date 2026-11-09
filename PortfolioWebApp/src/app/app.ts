import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentHostComponent } from './agent/agent-host.component';
import { LoadingSpinnerComponent } from './components/loading-spinner.component';
import { SeoService } from './services/seo.service';

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
export class App {
  /** Starts route metadata updates. */
  private readonly seo = inject(SeoService);
}
