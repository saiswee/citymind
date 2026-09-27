import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, ShieldCheck, BrainCircuit, HelpCircle } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import { analyzeChallenge } from '@/services/ai';
import type { AnalysisResult } from '@/types';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { useToast } from '@/lib/toast';

export default function Analysis() {
  const { project, refreshProject } = useOutletContext<ProjectContext>();
  const [analysis, setAnalysis] = useState<AnalysisResult | null | undefined>(undefined);
  const [running, setRunning] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    store.getAnalysis(project.id).then((a) => setAnalysis(a ?? null));
  }, [project.id]);

  async function handleAnalyze() {
    setRunning(true);
    try {
      const [evidence, timeline] = await Promise.all([
        store.listEvidence(project.id),
        store.listTimeline(project.id),
      ]);
      const result = await analyzeChallenge(project, evidence, timeline);
      await store.saveAnalysis(result);
      if (project.status === 'Evidence Collection') {
        await store.updateProjectStatus(project.id, 'Challenge Analysis');
        refreshProject();
      }
      setAnalysis(result);
      show('Challenge analysis generated', 'success');
    } catch {
      show('Analysis failed. Try again.', 'error');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-head text-xl text-[var(--color-ink)]">Challenge Analysis</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">
            AI-assisted interpretation of the evidence collected so far — clearly separated from confirmed facts and unknowns.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={running}
          className="flex shrink-0 items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {running ? 'Analyzing…' : analysis ? 'Re-analyze Challenge' : 'Analyze Challenge'}
        </button>
      </div>

      {(running || analysis === undefined) && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!running && analysis === null && (
        <EmptyState
          icon={<BrainCircuit className="h-6 w-6" />}
          title="No analysis yet"
          description="Run the analysis to identify what's happening, recurring patterns, and information gaps based on the evidence collected."
          action={
            <button onClick={handleAnalyze} className="rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]">
              Analyze Challenge
            </button>
          }
        />
      )}

      {!running && analysis != null && (
        <div className="animate-fade-up space-y-5">
          <p className="text-xs text-[var(--color-ink-soft)]">Generated {formatDate(analysis.generatedAt)}</p>

          <Card className="grid grid-cols-1 divide-y divide-[var(--color-line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <ReportField title="What is happening?" body={analysis.whatIsHappening} />
            <ReportField title="Where is it happening?" body={analysis.whereItHappens} />
            <ReportField title="When does it occur?" body={analysis.whenItOccurs} />
          </Card>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-teal)]" />
              Recurring Patterns
            </h3>
            <ul className="mt-3 space-y-2">
              {analysis.recurringPatterns.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--color-ink-soft)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal)]" />
                  {p}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="font-head text-base text-[var(--color-ink)]">Possible Contributing Factors</h3>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Each factor is labeled by how confident we can be, given the evidence.</p>
            <ul className="mt-3 space-y-2.5">
              {analysis.contributingFactors.map((f, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-[var(--color-ink)]">{f.factor}</span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      f.confidence === 'evidence'
                        ? 'border-[var(--color-moss-tint)] bg-[var(--color-moss-tint)] text-[var(--color-moss)]'
                        : 'border-[var(--color-amber-tint)] bg-[var(--color-amber-tint)] text-[var(--color-amber)]'
                    }`}
                  >
                    {f.confidence === 'evidence' ? 'From evidence' : 'AI interpretation'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-head text-base text-[var(--color-ink)]">Evidence Supporting the Analysis</h3>
              <ul className="mt-3 space-y-2">
                {analysis.supportingEvidence.map((e, i) => (
                  <li key={i} className="text-sm text-[var(--color-ink-soft)]">— {e}</li>
                ))}
              </ul>
            </Card>

            <Card className="border-[var(--color-amber-tint)] bg-[var(--color-amber-tint)]/40 p-5">
              <h3 className="flex items-center gap-2 font-head text-base text-[var(--color-ink)]">
                <HelpCircle className="h-4 w-4 text-[var(--color-amber)]" />
                Information Gaps
              </h3>
              <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Unknowns that a solution should account for — not confirmed facts.</p>
              <ul className="mt-3 space-y-2">
                {analysis.informationGaps.map((g, i) => (
                  <li key={i} className="text-sm text-[var(--color-ink-soft)]">— {g}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportField({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5">
      <h3 className="text-sm font-medium text-[var(--color-ink-soft)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">{body}</p>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
