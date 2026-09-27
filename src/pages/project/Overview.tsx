import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, FileText, Camera, MapPinned, Archive } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import type { EvidenceItem } from '@/types';
import { Card, Skeleton } from '@/components/ui';
import { ProjectMap } from '@/components/ProjectMap';

export default function Overview() {
  const { project } = useOutletContext<ProjectContext>();
  const [evidence, setEvidence] = useState<EvidenceItem[] | null>(null);

  useEffect(() => {
    store.listEvidence(project.id).then(setEvidence);
  }, [project.id]);

  const currentPhotos = evidence?.filter((e) => e.type === 'Current Photos').length ?? 0;
  const historical = evidence?.filter((e) => e.type === 'Historical Maps' || e.type === 'Reports & Records').length ?? 0;
  const citizenReports = evidence?.filter((e) => e.type === 'Citizen Reports').length ?? 0;
  const mappedIncidents = (evidence ?? [])
    .filter((e): e is typeof e & { latitude: number; longitude: number } => e.latitude != null && e.longitude != null)
    .map((e) => ({ id: e.id, label: e.title, lat: e.latitude, lng: e.longitude }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5">
          <h2 className="font-head text-lg text-[var(--color-ink)]">Challenge Overview</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{project.description}</p>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
            <h2 className="font-head text-base text-[var(--color-ink)]">Location</h2>
            {evidence !== null && (
              <span className="font-mono text-xs text-[var(--color-ink-soft)]">
                {mappedIncidents.length} mapped from evidence
              </span>
            )}
          </div>
          <div className="p-4">
            <ProjectMap center={project.coordinates} label={project.location} incidents={mappedIncidents} />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
            <Users className="h-4 w-4 text-[var(--color-teal)]" />
            People Affected
          </h2>
          <ul className="mt-3 space-y-2">
            {project.affectedGroups.map((g) => (
              <li key={g} className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)]" />
                {g}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-head text-base text-[var(--color-ink)]">Evidence Summary</h2>
          {evidence === null ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <StatRow icon={<FileText className="h-3.5 w-3.5" />} label="Current reports" value={citizenReports || evidence.length} />
              <StatRow icon={<Archive className="h-3.5 w-3.5" />} label="Historical sources" value={historical} />
              <StatRow icon={<Camera className="h-3.5 w-3.5" />} label="Photos" value={currentPhotos} />
              <StatRow icon={<MapPinned className="h-3.5 w-3.5" />} label="Mapped incidents" value={mappedIncidents.length} />
            </div>
          )}
          <p className="mt-4 text-xs text-[var(--color-ink-soft)]">Project demo data · updated from submitted evidence</p>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-[var(--color-ink-soft)]">
        {icon}
        {label}
      </span>
      <span className="font-medium text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
