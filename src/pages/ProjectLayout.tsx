import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import { store } from '@/services/store';
import type { CivicProject } from '@/types';
import { StatusBadge, Skeleton } from '@/components/ui';

const TABS = [
  { to: '', label: 'Overview' },
  { to: 'evidence', label: 'Evidence' },
  { to: 'timeline', label: 'Timeline' },
  { to: 'analysis', label: 'AI Analysis' },
  { to: 'solution', label: 'Solution Design' },
  { to: 'blueprint', label: 'Solution Blueprint' },
  { to: 'build', label: 'Build with IBM Bob' },
];

const WORKFLOW_STEPS = ['Challenge', 'Evidence', 'Analysis', 'Solution', 'Build'];

export interface ProjectContext {
  project: CivicProject;
  refreshProject: () => void;
}

export default function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<CivicProject | null | undefined>(undefined);
  const navigate = useNavigate();

  const load = () => {
    if (!id) return;
    store.getProject(id).then(setProject);
  };

  useEffect(load, [id]);

  if (project === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="py-20 text-center">
        <p className="font-head text-xl text-[var(--color-ink)]">Project not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-sm text-[var(--color-teal)] hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const activeStepIndex = statusToStep(project.status);

  return (
    <div className="animate-fade-up">
      <div className="mb-1 flex items-center gap-1 text-sm text-[var(--color-ink-soft)]">
        <button onClick={() => navigate('/')} className="hover:text-[var(--color-ink)]">Projects</button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--color-ink)]">{project.name}</span>
      </div>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-head text-[26px] leading-tight text-[var(--color-ink)]">{project.name}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
            <MapPin className="h-3.5 w-3.5" />
            {project.location} · {project.category}
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Workflow indicator */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto rounded-sm border border-[var(--color-line)] bg-white px-4 py-3">
        {WORKFLOW_STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                  i <= activeStepIndex
                    ? 'bg-[var(--color-teal)] text-white'
                    : 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]'
                }`}
              >
                {i + 1}
              </span>
              <span className={`whitespace-nowrap text-sm ${i <= activeStepIndex ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'}`}>
                {step}
              </span>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && <div className="h-px w-6 shrink-0 bg-[var(--color-line)]" />}
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--color-line)]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === ''}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-[var(--color-teal)] font-medium text-[var(--color-ink)]'
                  : 'border-transparent text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ project, refreshProject: load } satisfies ProjectContext} />
    </div>
  );
}

function statusToStep(status: CivicProject['status']): number {
  switch (status) {
    case 'Evidence Collection':
      return 1;
    case 'Challenge Analysis':
      return 2;
    case 'Solution Design':
      return 3;
    case 'Solution Ready':
      return 4;
    default:
      return 0;
  }
}
