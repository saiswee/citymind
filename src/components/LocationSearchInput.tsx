import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { searchLocations, type GeocodeResult } from '@/services/geocode';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeocodeResult) => void;
  onClear?: () => void;
  placeholder?: string;
  selected?: boolean;
}

export function LocationSearchInput({ value, onChange, onSelect, onClear, placeholder, selected }: Props) {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleChange(v: string) {
    onChange(v);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchLocations(v);
        setResults(r);
        setOpen(r.length > 0);
      } catch {
        setError('Could not search locations right now — you can still type a location by hand.');
      } finally {
        setLoading(false);
      }
    }, 450);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-soft)]" />
        <input
          value={value}
          onChange={(e) => {
            handleChange(e.target.value);
            onClear?.();
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-sm border border-[var(--color-line)] bg-white py-2.5 pl-9 pr-9 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-teal)] focus:outline-none"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--color-ink-soft)]" />}
        {!loading && selected && (
          <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--color-moss)]" title="Location matched on map" />
        )}
      </div>

      {selected && (
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-moss)]">
          Matched to a real place — will appear on the map.
        </p>
      )}
      {error && <p className="mt-1 text-xs text-[var(--color-clay)]">{error}</p>}

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-sm border border-[var(--color-line)] bg-white shadow-lg">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(r);
                setOpen(false);
              }}
              className="flex w-full items-start gap-2 border-b border-[var(--color-line)] px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[var(--color-paper-dim)]"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-teal)]" />
              <span className="text-[var(--color-ink)]">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClearMatchIcon() {
  return <X className="h-3 w-3" />;
}
