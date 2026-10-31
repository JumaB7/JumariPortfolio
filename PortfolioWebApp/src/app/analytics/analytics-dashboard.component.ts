import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AgentChatPanelComponent } from '../agent/agent-chat-panel.component';

@Component({
  selector: 'app-analytics-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AgentChatPanelComponent],
  host: {
    class: 'analytics-page relative block min-h-screen bg-background text-text-primary',
  },
  templateUrl: './analytics-dashboard.component.html',
})
export class AnalyticsDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly agentOpen = signal(false);
  readonly mobileNavOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly activeSectionLabel = computed(() => {
    const path = this.url();
    if (path.includes('/dashboard/projects')) return 'Project Portfolio';
    return 'Financial Analytics';
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params.get('agent') === '1') {
        this.agentOpen.set(true);
      }
    });
  }

  openAgent(): void {
    this.agentOpen.set(true);
  }

  closeAgent(): void {
    this.agentOpen.set(false);
    if (this.route.snapshot.queryParamMap.get('agent')) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { agent: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  toggleAgent(): void {
    if (this.agentOpen()) {
      this.closeAgent();
    } else {
      this.openAgent();
    }
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
