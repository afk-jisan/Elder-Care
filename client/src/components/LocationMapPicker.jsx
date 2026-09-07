import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DHAKA_CENTER = [23.8103, 90.4125];

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function LocationMapPicker({
  latitude,
  longitude,
  onPick,
  height = 220,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const lat = toNumber(latitude);
    const lng = toNumber(longitude);
    const start = lat != null && lng != null ? [lat, lng] : DHAKA_CENTER;
    const zoom = lat != null && lng != null ? 16 : 12;

    const map = L.map(containerRef.current, {
      center: start,
      zoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (lat != null && lng != null) {
      markerRef.current = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map);
    }

    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.circleMarker([clickLat, clickLng], {
          radius: 8,
          color: '#1d4ed8',
          fillColor: '#3b82f6',
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(map);
      }
      onPick(clickLat, clickLng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const lat = toNumber(latitude);
    const lng = toNumber(longitude);
    if (lat == null || lng == null) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map);
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
  }, [latitude, longitude]);

  return (
    <div className="location-map-picker">
      <div
        ref={containerRef}
        className="location-map"
        style={{ height }}
      />
      <p className="location-map-hint muted">Tap the map to mark their home.</p>
    </div>
  );
}
