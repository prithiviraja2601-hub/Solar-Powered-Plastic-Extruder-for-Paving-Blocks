import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Eye } from 'lucide-react';

interface MapComponentProps {
  height?: string;
  onSelectLocation?: (locationId: string) => void;
  selectedLocationId?: string | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  height = '420px',
  onSelectLocation,
  selectedLocationId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { locations, bins, setCurrentPage, setSelectedLocationIdFilter } = useApp();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.8505, 78.7047], // Center of Tamil Nadu
        zoom: 7,
        minZoom: 6,
        maxZoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;

    if (markersGroup && map) {
      markersGroup.clearLayers();

      locations.forEach((loc) => {
        const locBins = bins.filter((b) => b.locationId === loc.id);
        const totalCap = locBins.reduce((sum, b) => sum + b.maxCapacity, 0) || loc.binCapacity * (loc.numberOfBins || 1);
        const currentWeight = locBins.reduce((sum, b) => sum + b.currentWeight, 0);
        const fillPct = totalCap > 0 ? (currentWeight / totalCap) * 100 : 0;
        const remainingCap = Math.max(0, totalCap - currentWeight);

        const hasCollectionRequired = locBins.some(
          (b) => b.status === 'COLLECTION_REQUIRED' || (b.currentWeight / b.maxCapacity) * 100 > 90
        );
        const hasNearlyFull = locBins.some(
          (b) => b.status === 'NEARLY_FULL' || (b.currentWeight / b.maxCapacity) * 100 >= 70
        );

        let markerColor = '#10b981'; // emerald
        let statusLabel = 'AVAILABLE';
        let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';

        if (hasCollectionRequired) {
          markerColor = '#ef4444'; // rose/red
          statusLabel = 'COLLECTION REQUIRED';
          badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
        } else if (hasNearlyFull) {
          markerColor = '#f59e0b'; // amber
          statusLabel = 'NEARLY FULL';
          badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
        }

        // Custom leaflet HTML icon
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${
                hasCollectionRequired
                  ? `<div style="
                      position: absolute;
                      width: 44px;
                      height: 44px;
                      border-radius: 9999px;
                      background-color: ${markerColor}33;
                      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                    "></div>`
                  : ''
              }
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 9999px;
                background: ${markerColor};
                border: 3px solid #ffffff;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-weight: 700;
                font-size: 11px;
              ">
                ${Math.round(fillPct)}%
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-800';
        popupContent.style.minWidth = '220px';
        popupContent.innerHTML = `
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">
              ${loc.city} &bull; ${loc.district}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">
              ${loc.name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              ${loc.address}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 600; color: #475569;">Status:</span>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${
              hasCollectionRequired ? '#fee2e2' : hasNearlyFull ? '#fef3c7' : '#d1fae5'
            }; color: ${
              hasCollectionRequired ? '#991b1b' : hasNearlyFull ? '#92400e' : '#065f46'
            }; border: 1px solid ${
              hasCollectionRequired ? '#fca5a5' : hasNearlyFull ? '#fcd34d' : '#6ee7b7'
            };">
              ${statusLabel}
            </span>
          </div>

          <div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div><span style="color: #64748b;">Bins:</span> <strong>${locBins.length}</strong></div>
            <div><span style="color: #64748b;">Fill:</span> <strong>${fillPct.toFixed(1)}%</strong></div>
            <div><span style="color: #64748b;">Weight:</span> <strong>${currentWeight} kg</strong></div>
            <div><span style="color: #64748b;">Remaining:</span> <strong>${remainingCap} kg</strong></div>
          </div>

          <button
            id="popup-view-loc-${loc.id}"
            style="
              width: 100%;
              padding: 6px 10px;
              background-color: #0284c7;
              color: white;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            "
          >
            <span>View Location Details &rarr;</span>
          </button>
        `;

        // Attach event listener to the button inside popup
        popupContent.querySelector(`#popup-view-loc-${loc.id}`)?.addEventListener('click', () => {
          if (onSelectLocation) {
            onSelectLocation(loc.id);
          } else {
            setSelectedLocationIdFilter(loc.id);
            setCurrentPage('locations');
          }
        });

        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);

        if (selectedLocationId === loc.id) {
          map.setView([loc.latitude, loc.longitude], 11, { animate: true });
          marker.openPopup();
        }
      });
    }

    // Force map resize check
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance alive across quick re-renders or destroy cleanly on page change
    };
  }, [locations, bins, selectedLocationId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Map Header / Status legend overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span>Tamil Nadu Live Collection Map</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            &lt;70%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            70–90%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            &gt;90% Pickup Req.
          </span>
        </div>
      </div>

      <div
        id="tn-leaflet-map"
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="z-0"
      />
    </div>
  );
};
