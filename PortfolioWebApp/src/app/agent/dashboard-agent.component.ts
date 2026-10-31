import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ToolResultsComponent } from './components/tool-results.component';
import { ChatTurn } from './models/chat.models';
import { readApiErrorMessage } from './services/api-error';
import { ChatApiService } from './services/chat-api.service';

@Component({
  selector: 'app-dashboard-agent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgClass, RouterLink, ToolResultsComponent],
  host: {
    class: 'block min-h-screen bg-background text-text-primary',
  },
  templateUrl: './dashboard-agent.component.html',
})
export class DashboardAgentComponent {
  private readonly chatApi = inject(ChatApiService);

  readonly draft = signal('');
  readonly turns = signal<ChatTurn[]>([]);
  readonly sending = signal(false);

  readonly samplePrompts = [
    'How many projects are in the portfolio showcase?',
    'Which technologies are used most across projects?',
    'What is the category distribution?',
    'Tell me about Veld Supply',
  ] as const;

  readonly canSend = computed(() => this.draft().trim().length > 0 && !this.sending());

  useSample(prompt: string): void {
    this.draft.set(prompt);
  }

  send(): void {
    const message = this.draft().trim();
    if (!message || this.sending()) {
      return;
    }

    const turnId = crypto.randomUUID();
    this.turns.update((existing) => [
      {
        id: turnId,
        question: message,
        loading: true,
      },
      ...existing,
    ]);
    this.draft.set('');
    this.sending.set(true);

    this.chatApi
      .sendMessage(message)
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: (response) => {
          this.turns.update((existing) =>
            existing.map((turn) =>
              turn.id === turnId ? { ...turn, loading: false, response } : turn,
            ),
          );
        },
        error: (err: unknown) => {
          const detail = readApiErrorMessage(err);
          this.turns.update((existing) =>
            existing.map((turn) =>
              turn.id === turnId ? { ...turn, loading: false, error: detail } : turn,
            ),
          );
        },
      });
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) {
      return;
    }
    keyboard.preventDefault();
    this.send();
  }
}
