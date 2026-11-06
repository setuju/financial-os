import type pg from 'pg';

export interface GoalRow {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  monthly_saving: number;
  interest_rate: number;
  loan_term_months: number;
  start_date: string;
  duration_months: number;
  progress_percent: number;
  created_at: Date;
}

interface RawGoalRow {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: string;
  monthly_saving: string;
  interest_rate: string;
  loan_term_months: number;
  start_date: Date;
  duration_months: number;
  progress_percent: number;
  created_at: Date;
}

function mapGoal(r: RawGoalRow): GoalRow {
  return {
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    target_amount: Number(r.target_amount),
    monthly_saving: Number(r.monthly_saving),
    interest_rate: Number(r.interest_rate),
    loan_term_months: r.loan_term_months,
    start_date: r.start_date.toISOString().slice(0, 10),
    duration_months: r.duration_months,
    progress_percent: r.progress_percent,
    created_at: r.created_at,
  };
}

export async function listGoals(pool: pg.Pool): Promise<GoalRow[]> {
  const r = await pool.query<RawGoalRow>(
    `SELECT id, user_id, name, target_amount, monthly_saving, interest_rate,
            loan_term_months, start_date, duration_months, progress_percent, created_at
     FROM goals
     ORDER BY start_date ASC, created_at ASC`,
  );
  return r.rows.map(mapGoal);
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  monthlySaving: number;
  interestRate: number;
  loanTermMonths: number;
  startDate: string; // YYYY-MM-DD
  durationMonths: number;
  progressPercent: number;
}

export async function createGoal(
  pool: pg.Pool,
  input: CreateGoalInput,
): Promise<GoalRow> {
  const r = await pool.query<RawGoalRow>(
    `INSERT INTO goals
       (name, target_amount, monthly_saving, interest_rate,
        loan_term_months, start_date, duration_months, progress_percent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, user_id, name, target_amount, monthly_saving, interest_rate,
               loan_term_months, start_date, duration_months, progress_percent, created_at`,
    [
      input.name,
      input.targetAmount,
      input.monthlySaving,
      input.interestRate,
      input.loanTermMonths,
      input.startDate,
      input.durationMonths,
      input.progressPercent,
    ],
  );
  return mapGoal(r.rows[0]);
}
