import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AGENT_SAMPLE_PROMPTS } from '../constants/agent.constants';
import { ToolResultsComponent } from './components/tool-results.component';
import { AgentChatStateService } from './services/agent-chat-state.service';

@Component({
  selector: 'app-agent-chat-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgClass, ToolResultsComponent],
  host: {
    class: 'contents',
  },
  template: `
    <button
      type="button"
      class="fixed inset-0 z-40 border-0 bg-black/25 p-0"
      aria-label="Close agent chat"
      (click)="closed.emit()"
    ></button>

    <aside
      class="fixed right-4 bottom-24 z-50 flex max-h-[min(70vh,36rem)] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:right-5 sm:bottom-28"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-chat-title"
    >
      <header class="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div class="min-w-0">
          <p class="m-0 text-[0.65rem] font-medium tracking-[0.14em] text-accent-cyan uppercase">
            Portfolio agent
          </p>
          <h2
            id="agent-chat-title"
            class="mt-0.5 mb-0 text-base font-semibold tracking-[-0.02em] text-text-primary"
          >
            Ask about this site
          </h2>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-border bg-surface-elevated px-2.5 py-1 text-sm text-text-secondary transition-colors hover:border-border-highlight hover:text-text-primary"
          (click)="closed.emit()"
        >
          Close
        </button>
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        <div class="flex flex-wrap gap-1.5" aria-label="Sample prompts">
          @for (prompt of samplePrompts; track prompt) {
            <button
              type="button"
              class="rounded-lg border border-border bg-surface-elevated px-2 py-1 text-left text-[0.7rem] text-text-secondary transition-colors hover:border-border-highlight hover:text-accent-cyan"
              (click)="chat.useSample(prompt)"
            >
              {{ prompt }}
            </button>
          }
        </div>

        <section class="space-y-3" aria-live="polite">
          @if (chat.turns().length === 0) {
            <p class="m-0 text-xs text-text-muted">
              Ask recruiter-style or portfolio questions — answers are grounded on site content.
            </p>
          }

          @for (turn of chat.turns(); track turn.id) {
            <article class="rounded-xl border border-border bg-surface-elevated/70 p-3">
              <div>
                <span class="text-[0.65rem] font-medium tracking-wide text-accent-cyan uppercase">You</span>
                <p class="mt-1 mb-0 text-sm text-text-primary">{{ turn.question }}</p>
              </div>

              @if (turn.loading) {
                <p class="mt-2 mb-0 text-sm text-text-secondary">Thinking…</p>
              }

              @if (turn.error) {
                <p class="mt-2 mb-0 text-sm text-red-400">{{ turn.error }}</p>
              }

              @if (turn.response; as response) {
                <div class="mt-2 border-t border-border pt-2">
                  <span class="text-[0.65rem] font-medium tracking-wide text-accent-cyan uppercase">Agent</span>
                  <p class="mt-1 mb-0 text-sm leading-relaxed text-text-primary">{{ response.answer }}</p>

                  @if (response.tool_activity.length) {
                    <app-tool-results [activity]="response.tool_activity" />
                  }
                </div>
              }
            </article>
          }
        </section>
      </div>

      <footer class="border-t border-border px-3 py-3">
        <label class="sr-only" for="agent-question">Question</label>
        <textarea
          id="agent-question"
          rows="2"
          class="field w-full min-h-13! resize-none text-sm"
          [ngModel]="chat.draft()"
          (ngModelChange)="chat.setDraft($event)"
          (keydown.enter)="onEnter($event)"
          placeholder="Ask a question…"
          [disabled]="chat.sending()"
        ></textarea>
        <div class="mt-2 flex items-center justify-between gap-2">
          <p class="m-0 text-[0.65rem] text-text-muted">Enter to send</p>
          <button
            type="button"
            class="btn btn-primary min-h-9! px-3! py-1.5! text-sm"
            [ngClass]="{ 'opacity-50': !chat.canSend() }"
            [disabled]="!chat.canSend()"
            (click)="chat.send()"
          >
            {{ chat.sending() ? 'Asking…' : 'Ask' }}
          </button>
        </div>
      </footer>
    </aside>
  `,
})
export class AgentChatPanelComponent {
  readonly chat = inject(AgentChatStateService);
  readonly closed = output<void>();

  readonly samplePrompts = AGENT_SAMPLE_PROMPTS;

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) {
      return;
    }
    keyboard.preventDefault();
    this.chat.send();
  }
}
