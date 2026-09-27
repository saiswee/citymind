import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, Pencil, Check, X, Lightbulb } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import { generateSolution } from '@/services/ai';
import type { Solution } from '@/types';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { useToast } from '@/lib/toast';

export default function SolutionDesign() {
  const { project, refreshProject } = useOutletContext<ProjectContext>();
  const [solution, setSolution] = useState<Solution | null | undefined>(undefined);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Solution | null>(null);
  const { show } = useToast();

  useEffect(() => {
    store.getSolution(project.id).then((s) => setSolution(s ?? null));
  }, [project.id]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const analysis = await store.getAnalysis(project.id);
      if (!analysis) {
        show('Run Challenge Analysis first', 'error');
        setGenerating(false);
        return;
      }
      const result = await generateSolution(project, analysis);
      await store.saveSolution(result);
      if (project.status !== 'Solution Ready') {
        await store.updateProjectStatus(project.id, 'Solution Design');
        refreshProject();
      }
      setSolution(result);
      show('Solution drafted', 'success');
    } catch {
      show('Could not generate a solution. Try again.', 'error');
    } finally {
      setGenerating(false);
    }
  }

  function startEdit() {
    if (!solution) return;
    setDraft(JSON.parse(JSON.stringify(solution)));
    setEditing(true);
  }

  async function saveEdit() {
    if (!draft) return;
    await store.saveSolution(draft);
    setSolution(draft);
    setEditing(false);
    show('Solution updated', 'success');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-head text-xl text-[var(--color-ink)]">Design a Solution</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">Turn the challenge into a practical technology opportunity.</p>
        </div>
        {solution && !editing && (
          <div className="flex gap-2">
            <button onClick={startEdit} className="flex items-center gap-1.5 rounded-sm border border-[var(--color-line)] px-3.5 py-2 text-sm text-[var(--color-ink)] hover:border-[var(--color-line-strong)]">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)] disabled:opacity-60">
              <Sparkles className="h-4 w-4" />
              {generating ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
        )}
      </div>

      {(generating || solution === undefined) && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!generating && solution === null && (
        <EmptyState
          icon={<Lightbulb className="h-6 w-6" />}
          title="No solution designed yet"
          description="Generate a proposed technology solution based on the challenge analysis."
          action={
            <button onClick={handleGenerate} className="rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]">
              Design a Solution
            </button>
          }
        />
      )}

      {!generating && solution && !editing && (
        <div className="animate-fade-up space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-head text-2xl text-[var(--color-ink)]">{solution.name}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{solution.description}</p>
            <div className="mt-4 rounded-sm bg-[var(--color-teal-tint)] p-3 text-sm text-[var(--color-teal-deep)]">
              <span className="font-medium">Objective — </span>
              {solution.objective}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-head text-base text-[var(--color-ink)]">Users</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {solution.users.map((u) => (
                <span key={u} className="rounded-sm border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-ink-soft)]">{u}</span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-head text-base text-[var(--color-ink)]">Core Capabilities</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {solution.features.map((f) => (
                <div key={f.id} className="rounded-sm border border-[var(--color-line)] p-3">
                  <p className="text-sm font-medium text-[var(--color-ink)]">{f.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-soft)]">{f.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {editing && draft && (
        <div className="animate-fade-up space-y-5">
          <Card className="p-5">
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Solution name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="mt-1 w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm font-head text-lg focus:border-[var(--color-teal)] focus:outline-none"
            />
            <label className="mt-4 block text-xs font-medium text-[var(--color-ink-soft)]">Description</label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              className="mt-1 w-full resize-none rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-teal)] focus:outline-none"
            />
            <label className="mt-4 block text-xs font-medium text-[var(--color-ink-soft)]">Objective</label>
            <textarea
              value={draft.objective}
              onChange={(e) => setDraft({ ...draft, objective: e.target.value })}
              rows={2}
              className="mt-1 w-full resize-none rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-teal)] focus:outline-none"
            />
          </Card>

          <Card className="p-5">
            <h3 className="font-head text-base text-[var(--color-ink)]">Core Capabilities</h3>
            <div className="mt-3 space-y-2">
              {draft.features.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <input
                    value={f.name}
                    onChange={(e) => {
                      const features = [...draft.features];
                      features[i] = { ...f, name: e.target.value };
                      setDraft({ ...draft, features });
                    }}
                    className="w-1/3 rounded-sm border border-[var(--color-line)] px-2.5 py-1.5 text-sm focus:border-[var(--color-teal)] focus:outline-none"
                  />
                  <input
                    value={f.description}
                    onChange={(e) => {
                      const features = [...draft.features];
                      features[i] = { ...f, description: e.target.value };
                      setDraft({ ...draft, features });
                    }}
                    className="flex-1 rounded-sm border border-[var(--color-line)] px-2.5 py-1.5 text-sm focus:border-[var(--color-teal)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]">
              <Check className="h-4 w-4" />
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 rounded-sm border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-ink)]">
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
