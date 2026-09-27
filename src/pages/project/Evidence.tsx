import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Camera, Map as MapIcon, FileText, Users, X } from 'lucide-react';
import type { ProjectContext } from '@/pages/ProjectLayout';
import { store } from '@/services/store';
import type { EvidenceItem, EvidenceType } from '@/types';
import { Card, Badge, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/lib/toast';
import { LocationSearchInput } from '@/components/LocationSearchInput';
import type { GeocodeResult } from '@/services/geocode';

const CATEGORIES: { type: EvidenceType; icon: React.ReactNode }[] = [
  { type: 'Current Photos', icon: <Camera className="h-3.5 w-3.5" /> },
  { type: 'Historical Maps', icon: <MapIcon className="h-3.5 w-3.5" /> },
  { type: 'Reports & Records', icon: <FileText className="h-3.5 w-3.5" /> },
  { type: 'Citizen Reports', icon: <Users className="h-3.5 w-3.5" /> },
];

const STATUS_TONE: Record<EvidenceItem['status'], 'moss' | 'amber' | 'neutral'> = {
  Verified: 'moss',
  'Under Review': 'amber',
  Unverified: 'neutral',
};

export default function Evidence() {
  const { project } = useOutletContext<ProjectContext>();
  const [evidence, setEvidence] = useState<EvidenceItem[] | null>(null);
  const [filter, setFilter] = useState<EvidenceType | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<EvidenceItem | null>(null);
  const { show } = useToast();

  const load = () => {
    store.listEvidence(project.id).then((e) => setEvidence(e.sort((a, b) => (a.date < b.date ? 1 : -1))));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const filtered = evidence?.filter((e) => filter === 'All' || e.type === filter) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-head text-xl text-[var(--color-ink)]">Connect the past with the present.</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-soft)]">
            Bring together historical records, current observations and community reports to understand how the challenge has evolved.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-sm bg-[var(--color-teal)] px-3.5 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]"
        >
          <Plus className="h-4 w-4" />
          Add Evidence
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip active={filter === 'All'} onClick={() => setFilter('All')}>
          All ({evidence?.length ?? 0})
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c.type} active={filter === c.type} onClick={() => setFilter(c.type)}>
            {c.icon}
            {c.type} ({evidence?.filter((e) => e.type === c.type).length ?? 0})
          </FilterChip>
        ))}
      </div>

      {evidence === null && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {evidence !== null && filtered.length === 0 && (
        <EmptyState
          icon={<Camera className="h-6 w-6" />}
          title="No evidence in this category yet"
          description="Add photos, historical records, or citizen reports to build the picture of this challenge."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)]"
            >
              Add Evidence
            </button>
          }
        />
      )}

      <div className="relative space-y-4">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden p-4">
            <div className="flex gap-4">
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => setLightbox(item)}
                  className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border border-[var(--color-line)]"
                >
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="teal">{item.type}</Badge>
                      <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                    </div>
                    <h3 className="mt-2 font-head text-base text-[var(--color-ink)]">{item.title}</h3>
                  </div>
                  <span className="whitespace-nowrap text-xs text-[var(--color-ink-soft)]">{formatDate(item.date)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--color-ink-soft)]">
                  <span>Location: {item.location}</span>
                  <span>Source: {item.source}</span>
                </div>
                {item.imageCredit && <p className="mt-2 text-[11px] italic text-[var(--color-ink-soft)]">{item.imageCredit}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {lightbox?.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-h-[85vh] max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.imageUrl} alt={lightbox.title} className="max-h-[75vh] w-full rounded-sm object-contain" />
            <div className="mt-2 flex items-start justify-between gap-3 text-white">
              <div>
                <p className="text-sm font-medium">{lightbox.title}</p>
                {lightbox.imageCredit && <p className="mt-0.5 text-xs text-white/70">{lightbox.imageCredit}</p>}
              </div>
              <button onClick={() => setLightbox(null)} className="shrink-0 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <AddEvidenceModal
          projectId={project.id}
          onClose={() => setShowForm(false)}
          onAdded={() => {
            setShowForm(false);
            load();
            show('Evidence added to project', 'success');
          }}
        />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-[var(--color-teal)] bg-[var(--color-teal-tint)] text-[var(--color-teal-deep)]'
          : 'border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)]'
      }`}
    >
      {children}
    </button>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AddEvidenceModal({
  projectId,
  onClose,
  onAdded,
}: {
  projectId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('Citizen Reports');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && location.trim() && description.trim();

  function handleFile(file: File | undefined) {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image is too large — please choose one under 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await store.addEvidence({
      projectId,
      title,
      type,
      date: new Date().toISOString().slice(0, 10),
      location,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      description,
      source: source || 'Manual entry',
      status: 'Unverified',
      imageUrl,
    });
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-md rounded-sm border border-[var(--color-line)] bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-head text-lg text-[var(--color-ink)]">Add Evidence</h3>
          <button onClick={onClose} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="modal-input" required />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as EvidenceType)} className="modal-input">
              {CATEGORIES.map((c) => (
                <option key={c.type} value={c.type}>{c.type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Location</label>
            <div className="mt-1.5">
              <LocationSearchInput
                value={location}
                onChange={(v) => setLocation(v)}
                onClear={() => setCoordinates(undefined)}
                onSelect={(r: GeocodeResult) => {
                  setLocation(r.label);
                  setCoordinates({ lat: r.lat, lng: r.lng });
                }}
                selected={Boolean(coordinates)}
                placeholder="Search a real place to pin it on the map"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="modal-input resize-none" required />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Photo (optional)</label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed border-[var(--color-line-strong)] bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
              <div className="text-xs text-[var(--color-ink-soft)]">
                {imageUrl ? (
                  <button type="button" onClick={() => setImageUrl(undefined)} className="text-[var(--color-clay)] hover:underline">
                    Remove photo
                  </button>
                ) : (
                  <span>Click to upload a photo from your device (under 4MB).</span>
                )}
                {imageError && <p className="mt-1 text-[var(--color-clay)]">{imageError}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-ink-soft)]">Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Field volunteer" className="modal-input" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-sm px-3.5 py-2 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-sm bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-teal-deep)] disabled:opacity-40"
            >
              {submitting ? 'Adding…' : 'Add Evidence'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .modal-input {
          margin-top: 0.35rem;
          width: 100%;
          border: 1px solid var(--color-line);
          border-radius: 0.4rem;
          padding: 0.5rem 0.7rem;
          font-size: 0.875rem;
        }
        .modal-input:focus { outline: none; border-color: var(--color-teal); }
      `}</style>
    </div>
  );
}
