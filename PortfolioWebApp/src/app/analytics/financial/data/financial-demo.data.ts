import {
  Department,
  ExpenseCategory,
  FinancialDemoDataset,
  FinancialMonthDeptRow,
} from '../models/financial-analytics.model';

const DEPARTMENTS: Department[] = ['Engineering', 'Sales', 'Operations', 'Marketing'];
const CATEGORIES: ExpenseCategory[] = [
  'Payroll',
  'Operations',
  'Marketing',
  'Software & IT',
  'Other',
];

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Deterministic pseudo-random in [0, 1) from seed. */
function hash01(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function roundToThousand(n: number): number {
  return Math.round(n / 1000) * 1000;
}

/**
 * Illustrative SA Rand figures for a fictional portfolio company (demo only).
 * Totals are tuned to land near the mock: ~R4.86M revenue, ~25% margin.
 */
function buildRows(): FinancialMonthDeptRow[] {
  const deptRevenueShare: Record<Department, number> = {
    Engineering: 0.38,
    Sales: 0.3,
    Operations: 0.18,
    Marketing: 0.14,
  };

  const categoryShare: Record<ExpenseCategory, number> = {
    Payroll: 0.423,
    Operations: 0.186,
    Marketing: 0.145,
    'Software & IT': 0.128,
    Other: 0.118,
  };

  const budgetFactor: Record<ExpenseCategory, number> = {
    Payroll: 1.04,
    Operations: 0.97,
    Marketing: 1.08,
    'Software & IT': 0.94,
    Other: 1.02,
  };

  const rows: FinancialMonthDeptRow[] = [];

  for (let m = 0; m < 12; m++) {
    const season = 1 + 0.08 * Math.sin(((m - 1) / 12) * Math.PI * 2);
    const growth = 1 + m * 0.018;
    const companyRevenue = roundToThousand(340_000 * season * growth);
    const companyExpenses = roundToThousand(companyRevenue * (0.72 - m * 0.004));
    const companyCashIn = roundToThousand(companyRevenue * (0.92 + hash01(m + 3) * 0.06));
    const companyCashOut = roundToThousand(companyExpenses * (0.94 + hash01(m + 9) * 0.05));

    for (const department of DEPARTMENTS) {
      const share = deptRevenueShare[department];
      const jitter = 0.94 + hash01(m * 17 + department.length * 5) * 0.12;
      const revenue = roundToThousand(companyRevenue * share * jitter);
      const priorRevenue = roundToThousand(revenue * (0.86 + hash01(m + 21) * 0.06));
      const cashIn = roundToThousand(companyCashIn * share * jitter);
      const priorCashIn = roundToThousand(cashIn * 0.88);
      const cashOut = roundToThousand(companyCashOut * share * (0.96 + hash01(m + 33) * 0.08));
      const priorCashOut = roundToThousand(cashOut * 0.9);

      const deptExpensePool = roundToThousand(companyExpenses * share * jitter);
      const expenses = CATEGORIES.map((category) => {
        const actual = roundToThousand(
          deptExpensePool * categoryShare[category] * (0.95 + hash01(m * 7 + category.length) * 0.1),
        );
        return {
          category,
          actual,
          budget: roundToThousand(actual * budgetFactor[category]),
          priorActual: roundToThousand(actual * (0.87 + hash01(m + category.length) * 0.05)),
        };
      });

      rows.push({
        monthIndex: m,
        monthKey: `2026-${String(m + 1).padStart(2, '0')}`,
        monthLabel: MONTH_LABELS[m],
        department,
        revenue,
        priorRevenue,
        cashIn,
        priorCashIn,
        cashOut,
        priorCashOut,
        expenses,
      });
    }
  }

  return rows;
}

export const FINANCIAL_DEMO_DATASET: FinancialDemoDataset = {
  label: 'Demo data — illustrative figures only (not real client finances)',
  year: 2026,
  generatedAt: '2026-10-31T12:00:00.000Z',
  departments: DEPARTMENTS,
  categories: CATEGORIES,
  rows: buildRows(),
};
