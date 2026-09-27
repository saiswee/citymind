import type { ReactNode } from 'react';
import type { ProjectStatus } from '@/types';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'teal' | 'amber' | 'clay' | 'moss' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)] border-[var(--color-line)]',
    teal: 'bg-[var(--color-teal-tint)] text-[var(--color-teal-deep)] border-[var(--color-teal)]/25',
    amber: 'bg-[var(--color-amber-tint)] text-[var(--color-amber)] border-[var(--color-amber)]/25',
    clay: 'bg-[var(--color-clay-tint)] text-[var(--color-clay)] border-[var(--color-clay)]/25',
    moss: 'bg-[var(--color-moss-tint)] text-[var(--color-moss)] border-[var(--color-moss)]/25',
  };
  const dots: Record<string, string> = {
    neutral: 'bg-[var(--color-ink-soft)]',
    teal: 'bg-[var(--color-teal)]',
    amber: 'bg-[var(--color-amber)]',
    clay: 'bg-[var(--color-clay)]',
    moss: 'bg-[var(--color-moss)]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-[3px] text-xs font-medium ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ProjectStatus, 'neutral' | 'teal' | 'amber' | 'moss'> = {
  'Evidence Collection': 'amber',
  'Challenge Analysis': 'teal',
  'Solution Design': 'teal',
  'Solution Ready': 'moss',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status}</Badge>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-[var(--color-paper-dim)] ${className}`} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-[var(--color-line)] px-8 py-14 text-center">
      {icon && <div className="mb-3 text-[var(--color-ink-soft)]">{icon}</div>}
      <h3 className="font-head text-lg text-[var(--color-ink)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-ink-soft)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm border border-[var(--color-line)] bg-white ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-medium text-[var(--color-ink-soft)]">{children}</p>;
}
