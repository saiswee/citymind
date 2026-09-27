import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, Copy, Check, ArrowDown, FileStack, Bot } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import { generateBuildPrompt } from '@/services/ai';
import type { BuildPrompt } from '@/types';
import { Card, Skeleton } from '@/components/ui';
import { useToast } from '@/lib/toast';

export default function BuildWithBob() {
  const { project } = useOutletContext<ProjectContext>();
  const [prompt, setPrompt] = useState<BuildPrompt | null | undefined>(undefined);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    store.getBuildPrompt(project.id).then((p) => setPrompt(p ?? null));
  }, [project.id]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const [solution, blueprint] = await Promise.all([store.getSolution(project.id), store.getBlueprint(project.id)]);
      if (!solution || !blueprint) {
        show('Generate a Solution Blueprint first', 'error');
        setGenerating(false);
        return;
      }
      const content = await generateBuildPrompt(project, solution, blueprint);
      const result: BuildPrompt = { id: `bp-prompt-${Date.now()}`, projectId: project.id, generatedAt: new Date().toISOString(), content };
      await store.saveBuildPrompt(result);
      setPrompt(result);
      show('IBM Bob build prompt generated', 'success');
    } catch {
      show('Could not generate the build prompt. Try again.', 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      show('Prompt copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      show('Could not copy. Select and copy manually.', 'error');
    }
  }

  return (
    <div>
      <div className="mb-8 max-w-2xl">
        <h2 className="font-head text-xl text-[var(--color-ink)]">Build with IBM Bob</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          CityMind has transformed your urban challenge into a structured application specification. IBM Bob takes that
          specification and helps build the actual civic-tech application — CityMind does not build or host the
          application itself.
        </p>
      </div>

      <div className="mb-8 flex flex-col items-center gap-2 rounded-sm border border-[var(--color-line)] bg-white p-6 sm:flex-row sm:justify-center sm:gap-6">
        <HandoffStep icon={<FileStack className="h-5 w-5" />} title="CityMind" subtitle="Challenge + evidence + requirements" />
        <ArrowDown className="h-4 w-4 shrink-0 text-[var(--color-ink-soft)] sm:-rotate-90" />
        <HandoffStep icon={<Sparkles className="h-5 w-5" />} title="Solution Blueprint" subtitle="Structured application specification" />
        <ArrowDown className="h-4 w-4 shrink-0 text-[var(--color-ink-soft)] sm:-rotate-90" />
        <HandoffStep icon={<Bot className="h-5 w-5" />} title="IBM Bob" subtitle="Build the application" accent />
      </div>

      {!prompt && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-sm bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate IBM Bob Build Prompt'}
          </button>
        </div>
      )}

      {generating && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!generating && prompt && (
        <div className="animate-fade-up">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-ink)]">Build specification for IBM Bob</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-sm border border-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-line-strong)]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </button>
              <button onClick={handleGenerate} className="rounded-sm border border-[var(--color-line)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-line-strong)]">
                Regenerate
              </button>
            </div>
          </div>
          <Card className="overflow-hidden">
            <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap p-5 font-mono text-[13px] leading-relaxed text-[var(--color-ink)]">
              {prompt.content}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}

function HandoffStep({ icon, title, subtitle, accent }: { icon: React.ReactNode; title: string; subtitle: string; accent?: boolean }) {
  return (
    <div className="flex w-full max-w-[180px] flex-col items-center gap-1.5 text-center sm:w-40">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          accent ? 'bg-[var(--color-ink)] text-white' : 'bg-[var(--color-teal-tint)] text-[var(--color-teal-deep)]'
        }`}
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-[var(--color-ink)]">{title}</p>
      <p className="text-xs leading-tight text-[var(--color-ink-soft)]">{subtitle}</p>
    </div>
  );
}
