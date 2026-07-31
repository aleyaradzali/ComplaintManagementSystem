import * as dashboardService from '../services/dashboardService.js';
import { Result } from '../utils/result.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

export const getCharts = asyncHandler(async (req, res) => {
  const charts = await dashboardService.getCharts();
  res.status(200).json(Result.ok(charts, MESSAGES.DASHBOARD_CHARTS_RETRIEVED));
});
