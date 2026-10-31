export interface DashboardMetric {
  label: string;
  value: string;
}

export interface ChartSeriesPoint {
  name: string;
  y: number;
}

export interface DashboardOverview {
  metrics: DashboardMetric[];
  technologyMix: ChartSeriesPoint[];
  projectCategories: ChartSeriesPoint[];
}
