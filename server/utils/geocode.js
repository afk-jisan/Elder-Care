const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Free geocoding via OpenStreetMap Nominatim.
 * Policy: identify the app, keep request rate low (1 req/sec).
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export async function geocodeAddress(address) {
  const query = String(address || '').trim();
  if (!query) {
    const err = new Error('Address is required');
    err.status = 400;
    throw err;
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '0');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ElderCare/1.0 (CSE470 student project; contact: eldercare@local)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const err = new Error('Geocoding service unavailable');
    err.status = 502;
    throw err;
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    const err = new Error('No coordinates found for that address');
    err.status = 404;
    throw err;
  }

  const hit = results[0];
  return {
    latitude: Number(hit.lat),
    longitude: Number(hit.lon),
    displayName: hit.display_name,
  };
}
