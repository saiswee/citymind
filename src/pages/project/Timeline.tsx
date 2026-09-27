import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Wrench, Repeat, Clock } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import type { TimelineEvent } from '@/types';
import { Skeleton, EmptyState } from '@/components/ui';

const KIND_META: Record<TimelineEvent['kind'], { icon: React.ReactNode; tone: string }> = {
  incident: { icon: <AlertTriangle className="h-4 w-4" />, tone: 'var(--color-clay)' },
  change: { icon: <Wrench className="h-4 w-4" />, tone: 'var(--color-amber)' },
  pattern: { icon: <Repeat className="h-4 w-4" />, tone: 'var(--color-teal)' },
  current: { icon: <Clock className="h-4 w-4" />, tone: 'var(--color-teal-deep)' },
};

export default function Timeline() {
  const { project } = useOutletContext<ProjectContext>();
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  useEffect(() => {
    store.listTimeline(project.id).then(setEvents);
  }, [project.id]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-head text-xl text-[var(--color-ink)]">Challenge Timeline</h2>
        <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">
          Past conditions, changes made, and how the pattern has recurred to the present day.
        </p>
      </div>

      {events === null && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {events?.length === 0 && (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="No timeline events yet"
          description="Timeline events are built from the historical and current evidence attached to this project."
        />
      )}

      {events && events.length > 0 && (
        <div className="relative pl-2">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-[var(--color-line)]" />
          <div className="space-y-8">
            {events.map((ev) => {
              const meta = KIND_META[ev.kind];
              return (
                <div key={ev.id} className="relative flex gap-5">
                  <div
                    className="relative z-10 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 bg-white"
                    style={{ borderColor: meta.tone, color: meta.tone }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 pb-1 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium" style={{ color: meta.tone }}>{ev.year}</span>
                      <span className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">{labelForKind(ev.kind)}</span>
                    </div>
                    <h3 className="mt-1 font-head text-base text-[var(--color-ink)]">{ev.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)]">{ev.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function labelForKind(kind: TimelineEvent['kind']) {
  switch (kind) {
    case 'incident': return 'Incident';
    case 'change': return 'Infrastructure change';
    case 'pattern': return 'Recurring pattern';
    case 'current': return 'Current condition';
  }
}
