import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Sparkles, FileStack, ArrowRight, Database, LayoutGrid, GitBranch, ClipboardCheck } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import { generateBlueprint } from '@/services/ai';
import type { SolutionBlueprint } from '@/types';
import { Card, EmptyState, Skeleton, Badge } from '@/components/ui';
import { useToast } from '@/lib/toast';

export default function Blueprint() {
  const { project, refreshProject } = useOutletContext<ProjectContext>();
  const [blueprint, setBlueprint] = useState<SolutionBlueprint | null | undefined>(undefined);
  const [productName, setProductName] = useState('the solution');
  const [generating, setGenerating] = useState(false);
  const { show } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    store.getBlueprint(project.id).then((b) => setBlueprint(b ?? null));
    store.getSolution(project.id).then((s) => s && setProductName(s.name));
  }, [project.id]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const solution = await store.getSolution(project.id);
      if (!solution) {
        show('Design a solution first', 'error');
        setGenerating(false);
        return;
      }
      const result = await generateBlueprint(project, solution);
      await store.saveBlueprint(result);
      if (project.status !== 'Solution Ready') {
        await store.updateProjectStatus(project.id, 'Solution Ready');
        refreshProject();
      }
      setBlueprint(result);
      show('Solution blueprint generated', 'success');
    } catch {
      show('Could not generate the blueprint. Try again.', 'error');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-head text-xl text-[var(--color-ink)]">Solution Blueprint</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">A structured, build-ready specification of the proposed solution.</p>
        </div>
        {blueprint && (
          <Badge tone={blueprint.status === 'Ready to build' ? 'moss' : 'amber'}>{blueprint.status}</Badge>
        )}
      </div>

      {(generating || blueprint === undefined) && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!generating && blueprint === null && (
        <EmptyState
          icon={<FileStack className="h-6 w-6" />}
          title="No blueprint yet"
          description="Generate a build-ready specification from the solution design, ready to hand off to IBM Bob."
          action={
            <button onClick={handleGenerate} className="rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]">
              Generate Blueprint
            </button>
          }
        />
      )}

      {!generating && blueprint && (
        <div className="animate-fade-up space-y-5">
          <div className="sheet-frame blueprint-grid-light rounded-sm border border-[var(--color-line)] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4">
              <div>
                <p className="font-mono text-[11px] tracking-wide text-[var(--color-ink-soft)]">Solution Blueprint · {project.name}</p>
                <h3 className="mt-1 font-head text-[28px] leading-tight text-[var(--color-ink)]">{productName}</h3>
              </div>
              <div className="text-right">
                <p className="font-mono text-[11px] text-[var(--color-ink-soft)]">Status</p>
                <p className="mt-0.5 font-mono text-sm font-medium" style={{ color: blueprint.status === 'Ready to build' ? 'var(--color-moss)' : 'var(--color-amber)' }}>
                  {blueprint.status}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-ink)]">{blueprint.goal}</p>
          </div>

          <Card className="p-5">
            <h3 className="font-head text-base text-[var(--color-ink)]">Target Users</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {blueprint.targetUsers.map((u) => (
                <span key={u} className="rounded-sm border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-ink-soft)]">{u}</span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
              <LayoutGrid className="h-4 w-4 text-[var(--color-teal)]" />
              Core Features
            </h3>
            <ol className="mt-3 space-y-1.5">
              {blueprint.coreFeatures.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[var(--color-ink-soft)]">
                  <span className="font-mono text-xs text-[var(--color-teal)]">{String(i + 1).padStart(2, '0')}</span>
                  {f}
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
              <GitBranch className="h-4 w-4 text-[var(--color-teal)]" />
              User Flows
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {blueprint.userFlows.map((flow) => (
                <div key={flow.role} className="rounded-sm border border-[var(--color-line)] p-3">
                  <p className="text-sm font-medium text-[var(--color-ink)]">{flow.role}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
                    {flow.steps.map((s, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="rounded-full bg-[var(--color-paper-dim)] px-2 py-0.5">{s}</span>
                        {i < flow.steps.length - 1 && <ArrowRight className="h-3 w-3" />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-head text-base text-[var(--color-ink)]">Screens</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {blueprint.screens.map((s) => (
                <div key={s.id} className="rounded-sm bg-[var(--color-paper-dim)] p-3">
                  <p className="text-sm font-medium text-[var(--color-ink)]">{s.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{s.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
              <Database className="h-4 w-4 text-[var(--color-teal)]" />
              Data Model
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {blueprint.dataModels.map((m) => (
                <div key={m.entity} className="rounded-sm border border-[var(--color-line)] p-3 font-mono text-xs">
                  <p className="mb-1.5 font-sans text-sm font-medium text-[var(--color-ink)]">{m.entity}</p>
                  {m.fields.map((f) => (
                    <p key={f.name} className="text-[var(--color-ink-soft)]">
                      {f.name}: <span className="text-[var(--color-teal-deep)]">{f.type}</span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
              <ClipboardCheck className="h-4 w-4 text-[var(--color-teal)]" />
              Acceptance Criteria
            </h3>
            <ul className="mt-3 space-y-2">
              {blueprint.acceptanceCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-ink-soft)]">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-[var(--color-line-strong)]" />
                  {c}
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleGenerate} className="rounded-sm border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-ink)] hover:border-[var(--color-line-strong)]">
              Regenerate
            </button>
            <button
              onClick={() => navigate('../build')}
              className="flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]"
            >
              <Sparkles className="h-4 w-4" />
              Continue to Build with IBM Bob
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
