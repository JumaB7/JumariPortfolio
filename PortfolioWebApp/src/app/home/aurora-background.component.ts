import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Designed aurora media (Option 3) — no procedural geometry.
 *
 * public/aurora/
 * - aurora-poster.png  required still (from storyboard plate)
 * - aurora.webm        optional muted loop authored to the storyboard
 */
@Component({
  selector: 'app-aurora-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hero-aurora',
    '[class.hero-aurora--ready]': 'ready()',
    '[class.hero-aurora--reduced]': 'reducedMotion()',
    '[class.hero-aurora--video]': 'videoActive()',
  },
  template: `
    <div class="hero-aurora__stage" aria-hidden="true">
      <img
        class="hero-aurora__media hero-aurora__poster"
        [src]="posterSrc"
        alt=""
        decoding="async"
        (load)="onPosterReady()"
        (error)="onPosterReady()"
      />
      @if (videoActive()) {
        <video
          #video
          class="hero-aurora__media hero-aurora__video"
          [src]="videoSrc"
          [poster]="posterSrc"
          muted
          loop
          playsinline
          preload="auto"
          (canplay)="onVideoCanPlay()"
          (error)="onVideoError()"
        ></video>
      }
    </div>
  `,
})
export class AuroraBackgroundComponent {
  readonly contentReady = output<void>();

  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  private readonly destroyRef = inject(DestroyRef);

  readonly ready = signal(false);
  readonly reducedMotion = signal(false);
  readonly videoActive = signal(false);

  readonly posterSrc = '/aurora/aurora-poster.png';
  readonly videoSrc = '/aurora/aurora.webm';

  private readyEmitted = false;
  private posterReady = false;

  constructor() {
    afterNextRender(() => this.init());
    this.destroyRef.onDestroy(() => this.pauseVideo());
  }

  private init(): void {
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.reducedMotion.set(reduced);

    if (reduced) return;

    void fetch(this.videoSrc, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) this.videoActive.set(true);
      })
      .catch(() => {
        /* poster-only */
      });
  }

  onPosterReady(): void {
    this.posterReady = true;
    this.ready.set(true);
    this.emitReady();
  }

  onVideoCanPlay(): void {
    const el = this.videoRef()?.nativeElement;
    if (!el || this.reducedMotion()) return;
    void el.play().catch(() => {
      this.videoActive.set(false);
    });
  }

  onVideoError(): void {
    this.videoActive.set(false);
  }

  private pauseVideo(): void {
    const el = this.videoRef()?.nativeElement;
    el?.pause();
  }

  private emitReady(): void {
    if (this.readyEmitted || !this.posterReady) return;
    this.readyEmitted = true;
    window.setTimeout(() => this.contentReady.emit(), this.reducedMotion() ? 0 : 900);
  }
}
