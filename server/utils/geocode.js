const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const NOMINATIM_HEADERS = {
  'User-Agent': 'ElderCare/1.0 (CSE470 student project; contact: eldercare@local)',
  Accept: 'application/json',
};

function formatAddress(hit) {
  if (hit?.address) {
    const a = hit.address;
    const street = [a.house_number, a.road].filter(Boolean).join(' ');
    const parts = [
      street,
      a.suburb || a.neighbourhood || a.quarter || a.residential,
      a.city || a.town || a.village || a.municipality || a.county,
      a.state || a.region,
      a.country,
    ].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return hit?.display_name || '';
}

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

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '0');

  const response = await fetch(url, {
    headers: NOMINATIM_HEADERS,
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

export async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const err = new Error('Valid latitude and longitude are required');
    err.status = 400;
    throw err;
  }

  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');

  const response = await fetch(url, {
    headers: NOMINATIM_HEADERS,
  });

  if (!response.ok) {
    const err = new Error('Reverse geocoding service unavailable');
    err.status = 502;
    throw err;
  }

  const hit = await response.json();
  if (!hit || hit.error) {
    const err = new Error('No address found for that location');
    err.status = 404;
    throw err;
  }

  return {
    latitude: lat,
    longitude: lng,
    displayName: formatAddress(hit) || hit.display_name,
  };
}
