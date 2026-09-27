import { FileSearch, Layers, BrainCircuit, Blocks, Bot } from 'lucide-react';

const STEPS = [
  {
    icon: <FileSearch className="h-5 w-5" />,
    title: 'Describe the urban challenge',
    body: 'A civic organization, municipal team, or researcher starts a civic project describing a real-world urban challenge — where it happens, and who it affects.',
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: 'Organize context and evidence',
    body: 'Historical records, current reports, photos, and citizen submissions are brought together in one place, in context.',
  },
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    title: 'Analyze the challenge',
    body: 'CityMind identifies patterns and contributing factors from the evidence — clearly separating confirmed facts from AI interpretation and open questions.',
  },
  {
    icon: <Blocks className="h-5 w-5" />,
    title: 'Design and blueprint a solution',
    body: 'The challenge is turned into a practical technology solution, then structured into a build-ready Solution Blueprint.',
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: 'Hand off to IBM Bob',
    body: 'IBM Bob receives the structured specification and helps build the actual civic-tech application.',
  },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <h1 className="font-head text-[28px] text-[var(--color-ink)]">How CityMind works</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        CityMind does not control cities, make government decisions, or replace municipal officials. It helps civic
        teams understand an urban challenge well enough to build the right technology for it.
      </p>

      <div className="mt-10 space-y-0">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-tint)] text-[var(--color-teal-deep)]">
                {step.icon}
              </div>
              {i < STEPS.length - 1 && <div className="my-1 w-px flex-1 bg-[var(--color-line)]" />}
            </div>
            <div className="pb-8">
              <h3 className="font-head text-lg text-[var(--color-ink)]">{step.title}</h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)]">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
