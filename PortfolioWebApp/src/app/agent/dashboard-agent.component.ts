import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/** Legacy route — opens the dashboard with the agent chat panel. */
@Component({
  selector: 'app-dashboard-agent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class DashboardAgentComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.router.navigate(['/dashboard'], {
      queryParams: { agent: '1' },
      replaceUrl: true,
    });
  }
}
