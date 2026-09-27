import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Plus, Compass, FolderKanban, BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
      {/* Identity bar */}
      <div className="border-b border-[var(--color-line)] bg-[var(--color-ink)]">
        <div className="mx-auto flex h-8 max-w-[1240px] items-center justify-between px-6 text-[11px] text-white/60">
          <span>Civic Technology Platform</span>
          <span className="hidden sm:inline">Demo workspace · Hyderabad, Telangana</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="11.5" stroke="#1B3A6B" strokeWidth="1.1" />
                <path d="M2 13c3-3 5.5-3 8 0s5 3 8 0s5-3 8 0" stroke="#1B3A6B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d="M4.5 8c2.5-2 5-2 7.5 0s5 2 7.5 0" stroke="#1B3A6B" strokeWidth="0.8" opacity="0.45" fill="none" strokeLinecap="round" />
                <path d="M4.5 18c2.5 2 5 2 7.5 0s5-2 7.5 0" stroke="#1B3A6B" strokeWidth="0.8" opacity="0.45" fill="none" strokeLinecap="round" />
                <line x1="13" y1="0.5" x2="13" y2="3" stroke="#1B3A6B" strokeWidth="1" />
                <line x1="13" y1="23" x2="13" y2="25.5" stroke="#1B3A6B" strokeWidth="1" />
                <line x1="0.5" y1="13" x2="3" y2="13" stroke="#1B3A6B" strokeWidth="1" />
                <line x1="23" y1="13" x2="25.5" y2="13" stroke="#1B3A6B" strokeWidth="1" />
              </svg>
              <span className="font-head text-[19px] tracking-tight text-[var(--color-ink)]">CityMind</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <TopNavLink to="/" icon={<FolderKanban className="h-4 w-4" />} label="Projects" />
              <TopNavLink to="/explore" icon={<Compass className="h-4 w-4" />} label="Explore" />
              <TopNavLink to="/how-it-works" icon={<BookOpen className="h-4 w-4" />} label="How It Works" />
            </nav>
          </div>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-teal-deep)]"
          >
            <Plus className="h-4 w-4" />
            Start a Civic Project
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-6 py-8">{children}</main>

      <Footer />
    </div>
  );
}

function TopNavLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors ${
          isActive ? 'text-[var(--color-ink)] font-medium' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-white">
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="11.5" stroke="#1B3A6B" strokeWidth="1.2" />
                <path d="M2 13c3-3 5.5-3 8 0s5 3 8 0s5-3 8 0" stroke="#1B3A6B" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </svg>
              <span className="font-head text-base text-[var(--color-ink)]">CityMind</span>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-ink-soft)]">
              Turn urban challenges into buildable solutions. CityMind organizes evidence and analysis so civic teams can
              specify the right technology solution — it does not make policy or operational decisions on their behalf.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--color-ink)]">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
              <li><Link to="/" className="hover:text-[var(--color-ink)]">Projects</Link></li>
              <li><Link to="/explore" className="hover:text-[var(--color-ink)]">Explore</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[var(--color-ink)]">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--color-ink)]">Scope</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
              <li>Not a government system of record</li>
              <li>Does not set public policy</li>
              <li>Hands off build specs to IBM Bob</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--color-line)] pt-5 text-xs text-[var(--color-ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CityMind. Demo workspace — data shown is illustrative.</span>
          <span>Built for civic organizations, municipal teams, and civic-tech developers.</span>
        </div>
      </div>
    </footer>
  );
}
