import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../../utils/cn';

/**
 * `rightPanelOpen` reserves room on the right for a fixed-position side panel (e.g.
 * ComplaintDetailDrawer) on desktop (`lg` and up — see README section 8), so the panel
 * pushes the content narrower instead of overlapping it. Below `lg` such panels go
 * full-width themselves, so no space is reserved there. AppShell stays panel-agnostic —
 * it just knows to make room, not what's occupying it.
 *
 * `fillHeight` locks the shell to the viewport height instead of letting the page grow
 * and scroll naturally. Pages that opt in are responsible for making one of their own
 * children `flex-1 min-h-0 overflow-y-auto` so *that* region scrolls instead of the page
 * (e.g. ComplaintListPage's table). Off by default so every other page keeps normal
 * document scroll.
 */
export function AppShell({ children, rightPanelOpen = false, fillHeight = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn('bg-app', fillHeight ? 'flex h-screen flex-col overflow-hidden' : 'min-h-screen')}>
      <Topbar mobileOpen={mobileOpen} onMenuClick={() => setMobileOpen((v) => !v)} />
      <div className={cn('flex', fillHeight && 'min-h-0 flex-1')}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div
          className={cn(
            'min-w-0 flex-1 transition-[padding-right] duration-300 ease-in-out md:pl-16',
            rightPanelOpen && 'lg:pr-[480px]',
            fillHeight && 'flex min-h-0 flex-col'
          )}
        >
          <main
            className={cn(
              'p-4 sm:p-6 lg:p-8',
              fillHeight && 'flex min-h-0 flex-1 flex-col overflow-hidden'
            )}
          >
            <div className={cn('mx-auto w-full', fillHeight && 'flex min-h-0 flex-1 flex-col')}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
