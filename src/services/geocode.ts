// Location search backed by OpenStreetMap's Nominatim geocoder. No API key
// required. For production scale beyond a hackathon demo, consider a hosted
// geocoding provider or a self-hosted Nominatim instance per their usage
// policy (nominatim.org/release-docs/latest/api/Search/).

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params = new URLSearchParams({
    format: 'jsonv2',
    q: trimmed,
    limit: '5',
    addressdetails: '0',
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Location search failed');

  const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json();
  return data.map((d) => ({
    label: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}
