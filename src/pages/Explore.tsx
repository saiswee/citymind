import { Droplets, Trash2, ShieldAlert } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

const EXAMPLES = [
  {
    icon: <Droplets className="h-5 w-5" />,
    title: 'Recurring Urban Flooding',
    location: 'Hyderabad, India',
    summary: 'Historical drainage records combined with current rainfall data to identify recurring waterlogging junctions.',
    tag: 'Flooding & Drainage',
  },
  {
    icon: <Trash2 className="h-5 w-5" />,
    title: 'Waste Collection Gaps',
    location: 'Hyderabad, India',
    summary: 'Community-reported pickup delays mapped against municipal collection schedules.',
    tag: 'Waste Management',
  },
  {
    icon: <ShieldAlert className="h-5 w-5" />,
    title: 'Pedestrian Safety Near Schools',
    location: 'Hyderabad, India',
    summary: 'Parent and school reports of vehicle speed near shared arterial roads without pedestrian crossings.',
    tag: 'Public Safety',
  },
];

export default function Explore() {
  return (
    <div className="animate-fade-up">
      <h1 className="font-head text-[28px] text-[var(--color-ink)]">Explore civic challenges</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-soft)]">
        See how other civic organizations and municipal teams have structured real urban challenges into buildable solutions.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {EXAMPLES.map((ex) => (
          <Card key={ex.title} className="p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[var(--color-teal-tint)] text-[var(--color-teal-deep)]">
              {ex.icon}
            </div>
            <h3 className="mt-3 font-head text-base text-[var(--color-ink)]">{ex.title}</h3>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{ex.location}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{ex.summary}</p>
            <div className="mt-3">
              <Badge tone="teal">{ex.tag}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
