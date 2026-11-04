import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  DEFAULT_PROJECT_PREVIEW_CLASS,
  PROJECT_PREVIEW_CLASS_BY_ID,
} from '../constants/analytics.constants';
import { RevealDirective } from '../directives/reveal.directive';
import { ErrorPageComponent } from '../error/error-page.component';
import { ProjectShowcaseStageComponent } from '../home/project-showcase-stage.component';
import {
  ProjectActionLinkKind,
  ProjectActionView,
  ProjectCardView,
} from '../models/portfolio.model';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-project-detail',
  imports: [NgClass, RouterLink, RevealDirective, ProjectShowcaseStageComponent, ErrorPageComponent],
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-h-screen bg-background text-text-primary',
  },
})
export class ProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly portfolio = inject(PortfolioService);

  private readonly projectId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  readonly project = computed<ProjectCardView | undefined>(() => {
    const item = this.portfolio.projectById(this.projectId());
    if (!item) return undefined;
    const detailPath = `/projects/${item.id}`;
    return {
      ...item,
      previewClass: PROJECT_PREVIEW_CLASS_BY_ID[item.id] ?? DEFAULT_PROJECT_PREVIEW_CLASS,
      overviewShots: (
        item.previewVisuals ??
        (item.capabilities ?? []).flatMap((capability) => capability.visuals ?? [])
      ).slice(0, 2),
      cardFeatures: item.features.slice(0, 4),
      actionViews: item.actions
        .filter((action) => action.url !== detailPath)
        .map(
          (action, index): ProjectActionView => ({
            ...action,
            primary: index === 0,
            linkKind: this.resolveActionLinkKind(action.url),
          }),
        ),
    };
  });

  readonly email = this.portfolio.email;
  readonly year = this.portfolio.year;

  private resolveActionLinkKind(url: string): ProjectActionLinkKind {
    if (!url) return 'disabled';
    if (url.startsWith('/')) return 'route';
    if (url.startsWith('#')) return 'hash';
    return 'external';
  }
}
