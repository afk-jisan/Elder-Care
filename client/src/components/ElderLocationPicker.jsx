import { useState } from 'react';
import { apiRequest } from '../api/client';
import LocationMapPicker from './LocationMapPicker';

const METHODS = [
  { id: 'map', label: 'Pin on map' },
  { id: 'address', label: 'Search address' },
  { id: 'device', label: "I'm here now" },
];

function hasCoords(latitude, longitude) {
  return latitude !== '' && longitude !== '' && Number.isFinite(Number(latitude));
}

export default function ElderLocationPicker({
  address,
  onAddressChange,
  latitude,
  longitude,
  onChange,
  onError,
}) {
  const [method, setMethod] = useState('map');
  const [lookingUp, setLookingUp] = useState(false);
  const [locating, setLocating] = useState(false);
  const [fillingAddress, setFillingAddress] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const locationSet = hasCoords(latitude, longitude);

  async function fillAddressFromCoords(lat, lng) {
    setFillingAddress(true);
    try {
      const data = await apiRequest('/geo/reverse', {
        method: 'POST',
        body: JSON.stringify({
          latitude: Number(lat),
          longitude: Number(lng),
        }),
      });
      if (data.displayName) {
        onAddressChange(data.displayName);
      }
    } catch {
      // Keep the pin even if street address lookup fails.
    } finally {
      setFillingAddress(false);
    }
  }

  async function setCoords(lat, lng) {
    onError('');
    onChange({
      latitude: String(lat),
      longitude: String(lng),
    });
    await fillAddressFromCoords(lat, lng);
  }

  async function lookupAddress() {
    if (!address.trim()) {
      onError('Enter a home address first');
      return;
    }
    onError('');
    setLookingUp(true);
    try {
      const data = await apiRequest('/geo/lookup', {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
      onChange({
        latitude: String(data.latitude),
        longitude: String(data.longitude),
      });
    } catch (err) {
      onChange({ latitude: '', longitude: '' });
      onError(err.message);
    } finally {
      setLookingUp(false);
    }
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      onError('Location is not available in this browser');
      return;
    }
    onError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setCoords(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        onError('Could not get your location. Check browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="elder-location-picker">
      <div className="elder-location-header">
        <h3>Home address</h3>
        <p className="muted">
          Type the address, drop a pin, or use your current location. The street
          address fills in automatically from the map pin.
        </p>
      </div>

      <label>
        Street address
        <input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          required
          placeholder="House, road, area, city"
        />
        {fillingAddress && (
          <span className="muted">Looking up street address...</span>
        )}
      </label>

      <div
        className="location-status"
        data-state={locationSet ? 'set' : 'unset'}
        role="status"
      >
        {locationSet
          ? 'Address pin saved on the map.'
          : 'Mark the home on the map to finish the address.'}
      </div>

      <div className="location-tabs" role="tablist" aria-label="How to set location">
        {METHODS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={method === item.id}
            className={`location-tab${method === item.id ? ' active' : ''}`}
            onClick={() => setMethod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="location-panel" role="tabpanel">
        {method === 'map' && (
          <LocationMapPicker
            latitude={latitude}
            longitude={longitude}
            onPick={(lat, lng) => {
              setCoords(lat, lng);
            }}
          />
        )}

        {method === 'address' && (
          <div className="location-panel-card">
            <p>We&apos;ll search using the address you entered.</p>
            <p className="muted">
              Tip: include area and city (e.g. &quot;Dhanmondi, Dhaka&quot;) for
              better results.
            </p>
            <button
              type="button"
              className="secondary"
              onClick={lookupAddress}
              disabled={lookingUp || !address.trim()}
            >
              {lookingUp ? 'Searching...' : 'Find on map'}
            </button>
          </div>
        )}

        {method === 'device' && (
          <div className="location-panel-card">
            <p>
              Stand at the elder&apos;s home, then tap the button below.
            </p>
            <button
              type="button"
              className="secondary"
              onClick={useDeviceLocation}
              disabled={locating}
            >
              {locating ? 'Getting location...' : 'Use my current location'}
            </button>
          </div>
        )}
      </div>

      <details
        className="location-advanced"
        open={showAdvanced}
        onToggle={(e) => setShowAdvanced(e.target.open)}
      >
        <summary>Enter coordinates manually</summary>
        <div className="form-row two">
          <label>
            Latitude
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) =>
                onChange({
                  latitude: e.target.value,
                  longitude,
                })
              }
              placeholder="23.8103"
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) =>
                onChange({
                  latitude,
                  longitude: e.target.value,
                })
              }
              placeholder="90.4125"
            />
          </label>
        </div>
      </details>
    </div>
  );
}
