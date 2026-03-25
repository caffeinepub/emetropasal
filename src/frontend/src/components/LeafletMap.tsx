import { useEffect, useRef } from "react";

declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}

export default function LeafletMap({
  lat,
  lng,
  zoom = 14,
  className,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView(
        [lat, lng],
        zoom,
      );

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      const greenIcon = window.L.divIcon({
        html: `<div style="width:32px;height:32px;background:#198754;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: "",
      });

      markerRef.current = window.L.marker([lat, lng], {
        icon: greenIcon,
      }).addTo(mapInstanceRef.current);
      markerRef.current
        .bindPopup("<b>Driver Location</b><br>On the way!")
        .openPopup();
    } else {
      mapInstanceRef.current.setView([lat, lng], zoom);
      markerRef.current?.setLatLng([lat, lng]);
    }
  }, [lat, lng, zoom]);

  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className={className || "h-80 w-full rounded-xl"} />;
}
