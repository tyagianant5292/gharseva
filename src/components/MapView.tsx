"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ProviderListItem } from "./ProviderCard";

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

export default function MapView({
  items,
  center,
}: {
  items: ProviderListItem[];
  center: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, { scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
    const map = mapRef.current;
    const layer = layerRef.current!;
    layer.clearLayers();

    const pts: [number, number][] = [];

    if (center) {
      L.circleMarker([center.lat, center.lng], {
        radius: 9,
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        fillOpacity: 0.9,
        weight: 2,
      })
        .addTo(layer)
        .bindPopup("You are here");
      pts.push([center.lat, center.lng]);
    }

    items.forEach((p) => {
      if (p.lat != null && p.lng != null) {
        const dist = typeof p.distanceKm === "number" ? `<br>${p.distanceKm < 1 ? Math.round(p.distanceKm * 1000) + " m" : p.distanceKm.toFixed(1) + " km"} away` : "";
        L.circleMarker([p.lat, p.lng], {
          radius: 8,
          color: "#c2410c",
          fillColor: "#f97316",
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(layer)
          .bindPopup(
            `<b>${esc(p.name)}</b><br>${esc(p.locality)}, ${esc(p.city)}${dist}<br><a href="/providers/${p.id}" style="color:#ea580c;font-weight:600">View profile →</a>`,
          );
        pts.push([p.lat, p.lng]);
      }
    });

    if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 14 });
    } else if (pts.length === 1) {
      map.setView(pts[0], 13);
    } else {
      map.setView([28.6139, 77.209], 11); // default: Delhi
    }
  }, [items, center]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-[480px] w-full rounded-xl ring-1 ring-slate-200" />;
}
