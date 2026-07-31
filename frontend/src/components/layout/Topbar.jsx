import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { USER_ROLE } from '../../constants/userRole';
import { cn } from '../../utils/cn';
import mcmcLogo from '../../assets/mcmc-logo.png';

const ROLE_COLOR = {
  [USER_ROLE.ADMIN]: 'var(--color-primary)',
  [USER_ROLE.OFFICER]: 'var(--color-info)',
};

export function Topbar({ onMenuClick, mobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-surface px-4 shadow-xs md:px-6">
      <button
        type="button"
        className="text-muted md:hidden"
        onClick={onMenuClick}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="flex items-center gap-2.5">
        <img src={mcmcLogo} alt="MCMC" className="h-8 w-auto flex-none" />
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-xl font-extrabold tracking-wide text-primary italic">
            Resolv
          </p>
          <span className="hidden text-border sm:inline">|</span>
          <p className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-muted sm:block">
            MCMC Complaint Management System (Mini)
          </p>
        </div>
      </div>

      <div className="relative ml-auto" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={profileOpen}
          className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-ink">{user?.name}</p>
          </div>
          <Avatar name={user?.name} />
          <ChevronDown
            size={16}
            className={cn(
              'hidden flex-none text-muted transition-transform sm:block',
              profileOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {profileOpen && (
          <Card className="absolute right-0 top-full z-40 mt-2 w-64 animate-slide-up p-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            </div>
            <Badge color={ROLE_COLOR[user?.role]} className="mt-3 capitalize">
              {user?.role}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="mt-4 w-full text-danger hover:border-danger/30 hover:bg-danger-soft"
            >
              <LogOut size={14} />
              Log out
            </Button>
          </Card>
        )}
      </div>
    </header>
  );
}
