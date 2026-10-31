import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentHostComponent } from './agent/agent-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AgentHostComponent],
  host: {
    class: 'block min-h-screen bg-background text-text-primary',
  },
  template: `
    <router-outlet />
    <app-agent-host />
  `,
})
export class App {}
