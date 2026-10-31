import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ToolActivity } from '../models/chat.models';

interface MetricCard {
  title: string;
  value: string;
  hint?: string;
}

interface RankRow {
  label: string;
  count: number;
  secondary?: string;
}

@Component({
  selector: 'app-tool-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    @if (summaryCards().length || rankRows().length || projectRows().length) {
      <section class="mt-4 space-y-4" aria-label="Structured tool results">
        @if (summaryCards().length) {
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            @for (card of summaryCards(); track card.title + card.value) {
              <article class="rounded-xl border border-border bg-surface-elevated/70 px-3 py-3">
                <p class="m-0 text-xs tracking-wide text-text-muted uppercase">{{ card.title }}</p>
                <p class="mt-1 mb-0 text-lg font-semibold text-text-primary">{{ card.value }}</p>
                @if (card.hint) {
                  <p class="mt-1 mb-0 text-xs text-text-secondary">{{ card.hint }}</p>
                }
              </article>
            }
          </div>
        }

        @if (rankRows().length) {
          <div class="space-y-2">
            @for (row of rankRows(); track row.label) {
              <div class="rounded-xl border border-border bg-surface px-3 py-2.5">
                <div class="flex items-baseline justify-between gap-3">
                  <p class="m-0 text-sm font-medium text-text-primary">{{ row.label }}</p>
                  <p class="m-0 text-sm text-text-secondary">
                    {{ row.count }} project{{ row.count === 1 ? '' : 's' }}
                  </p>
                </div>
                @if (row.secondary) {
                  <p class="mt-1 mb-0 text-xs text-text-muted">{{ row.secondary }}</p>
                }
                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-highlight" aria-hidden="true">
                  <div
                    class="h-full rounded-full bg-accent-cyan/80"
                    [ngClass]="barWidthByLabel().get(row.label) ?? 'w-1/6'"
                  ></div>
                </div>
              </div>
            }
          </div>
        }

        @if (projectRows().length) {
          <ul class="m-0 list-none space-y-2 p-0">
            @for (project of projectRows(); track project.id) {
              <li class="rounded-xl border border-border bg-surface px-3 py-2.5">
                <p class="m-0 text-sm font-medium text-text-primary">{{ project.name }}</p>
                <p class="mt-1 mb-0 text-xs text-text-secondary">
                  {{ project.category }}
                  @if (project.status) {
                    · {{ project.status }}
                  }
                </p>
                @if (project.technologies.length) {
                  <p class="mt-1 mb-0 text-xs text-text-muted">
                    {{ project.technologies.join(' · ') }}
                  </p>
                }
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class ToolResultsComponent {
  readonly activity = input.required<ToolActivity[]>();

  readonly okActivities = computed(() =>
    this.activity().filter((item) => item.status === 'ok' && item.result),
  );

  readonly summaryCards = computed((): MetricCard[] => {
    const cards: MetricCard[] = [];
    for (const item of this.okActivities()) {
      const result = item.result ?? {};
      if (item.tool_name === 'get_portfolio_summary') {
        cards.push(
          { title: 'Projects', value: String(result['project_count'] ?? 0) },
          { title: 'Years experience', value: `~${result['years_experience'] ?? 0}` },
          { title: 'Technologies', value: String(result['technology_count'] ?? 0) },
          { title: 'Categories', value: String(result['category_count'] ?? 0) },
        );
      }
    }
    return cards;
  });

  readonly rankRows = computed((): RankRow[] => {
    const rows: RankRow[] = [];
    for (const item of this.okActivities()) {
      const result = item.result ?? {};
      if (item.tool_name === 'get_technology_usage') {
        const techs = (result['technologies'] as Array<Record<string, unknown>>) ?? [];
        for (const tech of techs) {
          rows.push({
            label: String(tech['technology'] ?? ''),
            count: Number(tech['project_count'] ?? 0),
          });
        }
      }
      if (item.tool_name === 'get_category_distribution') {
        const categories = (result['categories'] as Array<Record<string, unknown>>) ?? [];
        for (const category of categories) {
          rows.push({
            label: String(category['category'] ?? ''),
            count: Number(category['project_count'] ?? 0),
          });
        }
      }
    }
    return rows;
  });

  readonly projectRows = computed(() => {
    const rows: Array<{
      id: string;
      name: string;
      category: string;
      status?: string;
      technologies: string[];
    }> = [];
    for (const item of this.okActivities()) {
      const result = item.result ?? {};
      if (item.tool_name === 'list_projects') {
        const projects = (result['projects'] as Array<Record<string, unknown>>) ?? [];
        for (const project of projects) {
          rows.push({
            id: String(project['id'] ?? project['name'] ?? rows.length),
            name: String(project['name'] ?? ''),
            category: String(project['category'] ?? ''),
            status: project['status'] ? String(project['status']) : undefined,
            technologies: Array.isArray(project['technologies'])
              ? project['technologies'].map(String)
              : [],
          });
        }
      }
      if (item.tool_name === 'get_project_detail' && result['project']) {
        const project = result['project'] as Record<string, unknown>;
        rows.push({
          id: String(project['id'] ?? 'detail'),
          name: String(project['name'] ?? ''),
          category: String(project['category'] ?? ''),
          status: project['status'] ? String(project['status']) : undefined,
          technologies: Array.isArray(project['technologies'])
            ? project['technologies'].map(String)
            : [],
        });
      }
    }
    return rows;
  });

  readonly maxCount = computed(() => {
    const values = this.rankRows().map((row) => row.count);
    return values.length ? Math.max(...values) : 1;
  });

  readonly barWidthByLabel = computed(() => {
    const max = this.maxCount() || 1;
    const map = new Map<string, string>();
    for (const row of this.rankRows()) {
      const ratio = row.count / max;
      let width = 'w-1/6';
      if (ratio >= 0.9) width = 'w-full';
      else if (ratio >= 0.75) width = 'w-4/5';
      else if (ratio >= 0.6) width = 'w-3/4';
      else if (ratio >= 0.45) width = 'w-1/2';
      else if (ratio >= 0.3) width = 'w-2/5';
      else if (ratio >= 0.15) width = 'w-1/4';
      map.set(row.label, width);
    }
    return map;
  });
}
