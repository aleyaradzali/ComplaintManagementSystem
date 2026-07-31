import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ComplaintListPage } from '../pages/ComplaintListPage';
import { ComplaintDetailPage } from '../pages/ComplaintDetailPage';
import { OfficersPage } from '../pages/OfficersPage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ROUTES } from '../constants/routes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.COMPLAINTS} element={<ComplaintListPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path={ROUTES.OFFICERS} element={<OfficersPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
