import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/** Legacy route — opens the site-wide agent panel via query param. */
@Component({
  selector: 'app-dashboard-agent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class DashboardAgentComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.router.navigate(['/'], {
      queryParams: { agent: '1' },
      replaceUrl: true,
    });
  }
}
