import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpErrorMessageService } from '../../services/http-error-message.service';
import { ChatTurn } from '../models/chat.models';
import { ChatApiService } from './chat-api.service';

/** Site-wide chat state — survives panel close and route changes. */
@Injectable({ providedIn: 'root' })
export class AgentChatStateService {
  private readonly chatApi = inject(ChatApiService);
  private readonly httpErrors = inject(HttpErrorMessageService);

  readonly open = signal(false);
  readonly draft = signal('');
  readonly turns = signal<ChatTurn[]>([]);
  readonly sending = signal(false);

  readonly canSend = computed(() => this.draft().trim().length > 0 && !this.sending());

  openPanel(): void {
    this.open.set(true);
  }

  closePanel(): void {
    this.open.set(false);
  }

  togglePanel(): void {
    this.open.update((value) => !value);
  }

  useSample(prompt: string): void {
    this.draft.set(prompt);
  }

  setDraft(value: string): void {
    this.draft.set(value);
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
          const detail = this.httpErrors.describeAgentFailure(err);
          this.turns.update((existing) =>
            existing.map((turn) =>
              turn.id === turnId ? { ...turn, loading: false, error: detail } : turn,
            ),
          );
        },
      });
  }
}
