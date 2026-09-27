import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Check } from 'lucide-react';
import type { ChallengeCategory } from '@/types';
import { store } from '@/services/store';
import { useToast } from '@/lib/toast';
import { StatusBadge } from '@/components/ui';
import { LocationSearchInput } from '@/components/LocationSearchInput';
import { ProjectMap } from '@/components/ProjectMap';
import type { GeocodeResult } from '@/services/geocode';

const CATEGORIES: ChallengeCategory[] = [
  'Flooding & Drainage',
  'Waste Management',
  'Traffic & Mobility',
  'Public Safety',
  'Environment',
  'Infrastructure',
  'Other',
];

const EXAMPLE =
  'Residents and local organizations have reported repeated waterlogging in this area during periods of heavy rainfall. We want to understand the recurring pattern and explore a technology-based monitoring and response solution.';

const STEPS = ['Name it', 'Locate it', 'Describe it', 'Review'];

export default function StartProject() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ChallengeCategory>('Flooding & Drainage');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { show } = useToast();

  const canAdvance = [name.trim().length > 0, location.trim().length > 0, description.trim().length > 0, true];
  const isLast = step === STEPS.length - 1;

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const project = await store.createProject({ name, category, location, description, coordinates });
      show('Civic project created', 'success');
      navigate(`/projects/${project.id}`);
    } catch {
      show('Could not create the project. Try again.', 'error');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <p className="text-sm text-[var(--color-ink-soft)]">Start a Civic Project</p>
      <h1 className="mt-1 font-head text-[28px] leading-tight text-[var(--color-ink)]">
        What urban challenge are you working on?
      </h1>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                  i < step
                    ? 'bg-[var(--color-teal)] text-white'
                    : i === step
                      ? 'border border-[var(--color-teal)] text-[var(--color-teal)]'
                      : 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]'
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className={`whitespace-nowrap text-sm ${i <= step ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-[var(--color-line)]" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        {/* Step content */}
        <div>
          {step === 0 && (
            <div className="space-y-6">
              <Field label="Project name">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Recurring Urban Flooding"
                  className="input"
                />
              </Field>
              <Field label="Challenge category">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-sm border px-3.5 py-1.5 text-sm transition-colors ${
                        category === c
                          ? 'border-[var(--color-teal)] bg-[var(--color-teal-tint)] text-[var(--color-teal-deep)]'
                          : 'border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Field label="Location" hint="Search for a real place — neighborhood, ward, or landmark. Selecting a result pins it on the map.">
                <LocationSearchInput
                  value={location}
                  onChange={(v) => setLocation(v)}
                  onClear={() => setCoordinates(undefined)}
                  onSelect={(r: GeocodeResult) => {
                    setLocation(r.label);
                    setCoordinates({ lat: r.lat, lng: r.lng });
                  }}
                  selected={Boolean(coordinates)}
                  placeholder="e.g. Yousufguda, Hyderabad"
                />
              </Field>
              {coordinates && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[var(--color-ink-soft)]">Pinned location</p>
                  <ProjectMap center={coordinates} label={location} height={200} />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Field label="Challenge description" hint="Describe what's happening, who's affected, and what you want to understand.">
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={EXAMPLE}
                  rows={7}
                  className="input resize-none"
                />
              </Field>
              <button type="button" onClick={() => setDescription(EXAMPLE)} className="text-xs text-[var(--color-teal)] hover:underline">
                Use example description
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-[var(--color-ink-soft)]">Review before creating the project. You can edit any step.</p>
              <ReviewRow label="Name" value={name} onEdit={() => setStep(0)} />
              <ReviewRow label="Category" value={category} onEdit={() => setStep(0)} />
              <ReviewRow label="Location" value={location} onEdit={() => setStep(1)} />
              <ReviewRow label="Description" value={description} onEdit={() => setStep(2)} multiline />
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 rounded-sm border border-[var(--color-line)] px-4 py-2.5 text-sm text-[var(--color-ink)] hover:border-[var(--color-line-strong)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                disabled={!canAdvance[step]}
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-teal-deep)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {isLast && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'Create Civic Project'}
              </button>
            )}
            {step === 0 && (
              <button type="button" onClick={() => navigate(-1)} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Live preview — visible from the very first step, not just after submitting */}
        <div className="hidden md:block">
          <p className="mb-2 text-xs font-medium text-[var(--color-ink-soft)]">Preview</p>
          <div className="rounded-sm border border-[var(--color-line)] bg-white p-5">
            <StatusBadge status="Evidence Collection" />
            <h3 className="mt-3 font-head text-lg leading-snug text-[var(--color-ink)]">
              {name || 'Untitled civic project'}
            </h3>
            <div className="mt-1.5 flex items-center gap-1 text-sm text-[var(--color-ink-soft)]">
              <MapPin className="h-3.5 w-3.5" />
              {location || 'Location not set'}
            </div>
            <p className="mt-2 font-mono text-xs text-[var(--color-ink-soft)]">{category}</p>
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {description || 'Your challenge description will appear here as you type.'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-line);
          border-radius: 0.4rem;
          padding: 0.6rem 0.8rem;
          font-size: 0.9rem;
          background: white;
          color: var(--color-ink);
          transition: border-color 0.15s;
        }
        .input:focus { outline: none; border-color: var(--color-teal); }
        .input::placeholder { color: #A6A79B; }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-[var(--color-ink-soft)]">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ReviewRow({ label, value, onEdit, multiline }: { label: string; value: string; onEdit: () => void; multiline?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border border-[var(--color-line)] p-3.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</p>
        <p className={`mt-0.5 text-sm text-[var(--color-ink)] ${multiline ? 'leading-relaxed' : 'truncate'}`}>{value || '—'}</p>
      </div>
      <button type="button" onClick={onEdit} className="shrink-0 text-xs text-[var(--color-teal)] hover:underline">
        Edit
      </button>
    </div>
  );
}
