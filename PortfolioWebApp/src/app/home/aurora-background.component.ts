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
 * Designed aurora media (Option 3).
 * Prefers aurora.webm; poster is fallback / reduced-motion only (never flashes under video).
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
      @if (showPoster()) {
        <img
          class="hero-aurora__media hero-aurora__poster"
          [src]="posterSrc"
          alt=""
          width="644"
          height="220"
          decoding="async"
          (load)="onPosterReady()"
          (error)="onPosterReady()"
        />
      }
      @if (videoActive()) {
        <video
          #video
          class="hero-aurora__media hero-aurora__video"
          [attr.src]="videoSrc"
          muted
          loop
          playsinline
          autoplay
          preload="auto"
          (loadeddata)="onVideoReady()"
          (playing)="onVideoReady()"
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
  /** Poster only when not using video (reduced motion or video failed). */
  readonly showPoster = signal(false);

  readonly posterSrc = '/aurora/aurora-poster.webp';
  readonly videoSrc = `/aurora/aurora.webm?v=2`;

  private readyEmitted = false;
  private playStarted = false;

  constructor() {
    afterNextRender(() => this.init());
    this.destroyRef.onDestroy(() => this.pauseVideo());
  }

  private init(): void {
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.reducedMotion.set(reduced);

    if (reduced) {
      this.showPoster.set(true);
      this.videoActive.set(false);
      return;
    }

    this.showPoster.set(false);
    this.videoActive.set(true);

    // Safety: never block hero copy if video stalls
    window.setTimeout(() => {
      if (this.readyEmitted) return;
      if (!this.ready()) this.fallbackToPoster();
    }, 2500);
  }

  onPosterReady(): void {
    this.ready.set(true);
    this.emitReady();
  }

  onVideoReady(): void {
    const el = this.videoRef()?.nativeElement;
    if (!el || this.reducedMotion()) return;

    el.muted = true;
    el.playsInline = true;

    if (!this.playStarted) {
      this.playStarted = true;
      void el.play().catch(() => {
        this.playStarted = false;
        this.fallbackToPoster();
      });
    }

    // Reveal only once we have a decoded frame (avoids empty flash / wrong plate).
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.ready.set(true);
      this.emitReady();
    }
  }

  onVideoError(): void {
    this.fallbackToPoster();
  }

  private fallbackToPoster(): void {
    this.videoActive.set(false);
    this.showPoster.set(true);
  }

  private pauseVideo(): void {
    this.videoRef()?.nativeElement?.pause();
  }

  private emitReady(): void {
    if (this.readyEmitted || !this.ready()) return;
    this.readyEmitted = true;
    window.setTimeout(() => this.contentReady.emit(), this.reducedMotion() ? 0 : 900);
  }
}
