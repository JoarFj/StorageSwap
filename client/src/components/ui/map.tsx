import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  popup?: string;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  className?: string;
  onClick?: (e: L.LeafletMouseEvent) => void;
  onMarkerClick?: (id: number) => void;
}

export function Map({
  center,
  zoom,
  markers = [],
  className,
  onClick,
  onMarkerClick,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map("map").setView(center, zoom);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      if (onClick) {
        map.on("click", onClick);
      }
      
      mapRef.current = map;
    } else {
      // Update center and zoom if they change
      mapRef.current.setView(center, zoom);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only run once on mount
  
  // Update center and zoom when they change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);
  
  // Handle markers
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};
    
    // Add new markers
    markers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng]).addTo(mapRef.current!);
      
      if (markerData.popup) {
        marker.bindPopup(markerData.popup);
      }
      
      if (onMarkerClick) {
        marker.on("click", () => {
          onMarkerClick(markerData.id);
        });
      }
      
      markersRef.current[markerData.id] = marker;
    });
  }, [markers, onMarkerClick]);
  
  return <div id="map" className={cn("h-full w-full", className)} />;
}
