import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentChatPanelComponent } from './agent-chat-panel.component';
import { AgentChatStateService } from './services/agent-chat-state.service';

/** Site-wide FAB + chat panel (home, dashboard, and other routes). */
@Component({
  selector: 'app-agent-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgentChatPanelComponent],
  host: {
    class: 'contents',
  },
  template: `
    <button
      type="button"
      class="fixed right-4 bottom-4 z-60 flex h-14 w-14 items-center justify-center rounded-full border border-border-highlight bg-[linear-gradient(135deg,#0c7a96_0%,#0e8fad_100%)] text-white shadow-[0_10px_28px_rgba(8,47,73,0.45)] transition-[transform,box-shadow] hover:scale-[1.04] hover:shadow-[0_12px_32px_rgba(8,47,73,0.5)] sm:right-5 sm:bottom-5"
      [attr.aria-label]="chat.open() ? 'Close portfolio agent' : 'Open portfolio agent'"
      [attr.aria-expanded]="chat.open()"
      (click)="chat.togglePanel()"
    >
      @if (chat.open()) {
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      } @else {
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7c-.74 0-1.456-.08-2.13-.23L5 19l1.35-3.38C5.5 14.7 5 13.4 5 12Z"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linejoin="round"
          />
          <circle cx="10" cy="12" r="1" fill="currentColor" />
          <circle cx="13" cy="12" r="1" fill="currentColor" />
          <circle cx="16" cy="12" r="1" fill="currentColor" />
        </svg>
      }
    </button>

    @if (chat.open()) {
      <app-agent-chat-panel (closed)="onClose()" />
    }
  `,
})
export class AgentHostComponent {
  readonly chat = inject(AgentChatStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params.get('agent') === '1') {
        this.chat.openPanel();
      }
    });
  }

  onClose(): void {
    this.chat.closePanel();
    if (this.route.snapshot.queryParamMap.get('agent')) {
      void this.router.navigate([], {
        queryParams: { agent: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }
}
