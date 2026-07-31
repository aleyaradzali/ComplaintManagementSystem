import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLE } from '../../constants/userRole';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.COMPLAINTS, label: 'Complaints', icon: ClipboardList },
  { to: ROUTES.OFFICERS, label: 'Officers', icon: Users, adminOnly: true },
  { to: ROUTES.REPORTS, label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === USER_ROLE.ADMIN);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade-in bg-ink/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'group fixed bottom-0 left-0 top-16 z-50 flex w-64 flex-col overflow-hidden border-r border-border bg-surface transition-all duration-200 ease-in-out',
          'md:w-16 md:hover:w-64 md:hover:shadow-lg',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors md:justify-center md:group-hover:justify-start',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:bg-surface-muted hover:text-ink'
                )
              }
            >
              <item.icon size={18} className="flex-none" aria-hidden="true" />
              <span className="whitespace-nowrap md:hidden md:group-hover:inline">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
