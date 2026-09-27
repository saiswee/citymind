import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, ArrowUpRight } from 'lucide-react';
import { store } from '@/services/store';
import type { CivicProject } from '@/types';
import { StatusBadge, Skeleton, EmptyState } from '@/components/ui';

export default function Dashboard() {
  const [projects, setProjects] = useState<CivicProject[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    store.listProjects().then(setProjects);
  }, []);

  return (
    <div className="animate-fade-up">
      <div className="mb-10 border-b border-[var(--color-line)] pb-8">
        <p className="font-mono text-xs tracking-wide text-[var(--color-ink-soft)]">Good morning</p>
        <h1 className="mt-2 max-w-xl font-head text-[32px] leading-[1.2] text-[var(--color-ink)]">
          What urban challenge are you working on?
        </h1>
        <button
          onClick={() => navigate('/new')}
          className="mt-6 flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-teal-deep)]"
        >
          <Plus className="h-4 w-4" />
          Start a Civic Project
        </button>
      </div>

      <div className="flex items-baseline justify-between">
        <h2 className="font-head text-xl text-[var(--color-ink)]">Active Civic Projects</h2>
        <span className="font-mono text-xs text-[var(--color-ink-soft)]">{projects?.length ?? '—'} open</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects === null &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-sm border border-[var(--color-line)] p-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-28" />
              <Skeleton className="mt-4 h-4 w-24" />
            </div>
          ))}

        {projects?.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3">
            <EmptyState
              title="No civic projects yet"
              description="Start a civic project to bring together evidence, analysis, and a buildable solution for an urban challenge."
              action={
                <button
                  onClick={() => navigate('/new')}
                  className="rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]"
                >
                  Start a Civic Project
                </button>
              }
            />
          </div>
        )}

        {projects?.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}`)}
            className="group flex flex-col items-start rounded-sm border border-[var(--color-line)] bg-white p-5 text-left transition-all hover:border-[var(--color-line-strong)] hover:shadow-[0_4px_20px_rgba(16,25,43,0.06)]"
          >
            <div className="flex w-full items-start justify-between">
              <StatusBadge status={p.status} />
              <ArrowUpRight className="h-4 w-4 text-[var(--color-ink-soft)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <h3 className="mt-3 font-head text-lg leading-snug text-[var(--color-ink)]">{p.name}</h3>
            <div className="mt-1.5 flex items-center gap-1 text-sm text-[var(--color-ink-soft)]">
              <MapPin className="h-3.5 w-3.5" />
              {p.location.split(',')[0]}
            </div>
            <p className="mt-2 font-mono text-xs text-[var(--color-ink-soft)]">{p.category}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
