export type ExpenseCategory =
  | 'Payroll'
  | 'Operations'
  | 'Marketing'
  | 'Software & IT'
  | 'Other';

export type Department = 'Engineering' | 'Sales' | 'Operations' | 'Marketing';

export type DateRangeId = '2026-full' | '2026-h1' | '2026-h2' | '2026-q1' | '2026-q2' | '2026-q3' | '2026-q4';

export interface ExpenseSlice {
  category: ExpenseCategory;
  actual: number;
  budget: number;
  priorActual: number;
}

export interface FinancialMonthDeptRow {
  monthIndex: number;
  monthKey: string;
  monthLabel: string;
  department: Department;
  revenue: number;
  priorRevenue: number;
  cashIn: number;
  priorCashIn: number;
  cashOut: number;
  priorCashOut: number;
  expenses: ExpenseSlice[];
}

export interface FinancialDemoDataset {
  label: string;
  year: number;
  generatedAt: string;
  departments: Department[];
  categories: ExpenseCategory[];
  rows: FinancialMonthDeptRow[];
}

export interface FinancialFilters {
  dateRange: DateRangeId;
  department: Department | 'all';
  category: ExpenseCategory | 'all';
}

export interface FinancialKpiCard {
  id: 'revenue' | 'profit' | 'margin' | 'cashflow';
  label: string;
  valueLabel: string;
  deltaLabel: string;
  deltaPositive: boolean;
  sparkline: number[];
  accent: 'cyan' | 'blue' | 'purple' | 'teal';
}

export interface MonthlyAggregate {
  monthIndex: number;
  monthKey: string;
  monthLabel: string;
  revenue: number;
  expenses: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  profit: number;
}

export interface CategoryAggregate {
  category: ExpenseCategory;
  actual: number;
  budget: number;
  share: number;
}
