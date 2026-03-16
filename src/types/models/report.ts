export interface DailyReport {
  date: string;
  study_time: number;
  practice_count: number;
  average_score: number;
  progress_chart: any[];
}

export interface WeeklyReport extends DailyReport {
  week_number: number;
  year: number;
}

export interface MonthlyReport extends DailyReport {
  month: number;
  year: number;
}

export interface Report {
  type: 'daily' | 'weekly' | 'monthly';
  data: DailyReport | WeeklyReport | MonthlyReport;
}
