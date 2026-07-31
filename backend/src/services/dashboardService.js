import * as dashboardRepository from '../repositories/dashboardRepository.js';
import { COMPLAINT_CATEGORY_VALUES } from '../constants/complaintCategory.js';

export async function getCharts() {
  const [categoryRows, overTimeRows] = await Promise.all([
    dashboardRepository.getCategoryBreakdown(),
    dashboardRepository.getComplaintsOverTime(),
  ]);

  const countsByCategory = new Map(categoryRows.map((row) => [row.category, row.count]));
  const categoryBreakdown = COMPLAINT_CATEGORY_VALUES.map((category) => ({
    category,
    count: countsByCategory.get(category) ?? 0,
  }));

  const complaintsOverTime = overTimeRows.map((row) => ({
    date: row.date,
    count: row.count,
  }));

  return { categoryBreakdown, complaintsOverTime };
}
