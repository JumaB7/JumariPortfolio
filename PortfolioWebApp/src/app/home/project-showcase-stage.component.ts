import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProjectVisual } from '../models/portfolio.model';

@Component({
  selector: 'app-project-showcase-stage',
  templateUrl: './project-showcase-stage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-w-0',
    '[class.project-showcase--compact]': 'compact()',
    '[class.project-showcase--featured]': 'featured()',
  },
})
export class ProjectShowcaseStageComponent {
  readonly shots = input.required<ProjectVisual[]>();
  readonly compact = input(false);
  readonly featured = input(false);
  readonly label = input('');

  readonly laptop = computed(() => {
    const shots = this.shots();
    return shots.find((shot) => shot.device === 'laptop') ?? shots[0];
  });

  readonly phone = computed(() => {
    const shots = this.shots();
    return shots.find((shot) => shot.device === 'phone');
  });

  /**
   * Laptop + phone → overlapping device composition (Accountant-style).
   * Multiple laptop-only shots → flat stacked figures (e.g. admin sales).
   */
  readonly pairMode = computed(() => this.shots().some((shot) => shot.device === 'phone'));

  readonly stackMode = computed(() => {
    const shots = this.shots();
    if (this.pairMode()) return false;
    return shots.length >= 1;
  });
}
