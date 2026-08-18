import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface GpsPickerMapProps {
  lat: number;
  lng: number;
  onChangeLocation: (lat: number, lng: number) => void;
  locationLabel?: string;
}

export const GpsPickerMap: React.FC<GpsPickerMapProps> = ({
  lat,
  lng,
  onChangeLocation,
  locationLabel,
}) => {
  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState<string>(lat.toString());
  const [manualLng, setManualLng] = useState<string>(lng.toString());

  useEffect(() => {
    setManualLat(lat.toString());
    setManualLng(lng.toString());
  }, [lat, lng]);

  const handleAutoDetectGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation API tidak didukung di browser ini.');
      return;
    }

    setDetecting(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));
        onChangeLocation(newLat, newLng);
        setDetecting(false);
      },
      (err) => {
        console.warn('GPS Error, falling back to area coordinates', err);
        setErrorMsg('Gagal mendeteksi lokasi otomatis. Silakan pilih di peta atau input manual.');
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyManual = () => {
    const parsedLat = parseFloat(manualLat);
    const parsedLng = parseFloat(manualLng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChangeLocation(Number(parsedLat.toFixed(6)), Number(parsedLng.toFixed(6)));
    }
  };

  // Static OSM map image tile URL preview
  const tileUrl = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lng},${lat}&z=14&l=map&size=600,240&pt=${lng},${lat},pm2rdm`;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> Titik Koordinat GPS Google Maps
        </label>

        <button
          type="button"
          onClick={handleAutoDetectGps}
          disabled={detecting}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
          {detecting ? 'Deteksi GPS...' : 'Auto-Detect Koordinat'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-3 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-2 rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Tile Map Representation */}
      <div className="relative h-44 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <iframe
          title="Google Maps Coordinate Preview"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
        />

        {/* Center Pin Indicator */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow mb-1">
              {locationLabel || 'Titik Lahan'}
            </div>
            <MapPin className="w-8 h-8 text-rose-500 drop-shadow-md animate-bounce" />
          </div>
        </div>
      </div>

      {/* Lat & Long Manual Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
        <div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-0.5 font-medium">
            Latitude
          </span>
          <input
            type="number"
            step="0.000001"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            onBlur={handleApplyManual}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-md px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-0.5 font-medium">
            Longitude
          </span>
          <input
            type="number"
            step="0.000001"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            onBlur={handleApplyManual}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-md px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-end">
          <button
            type="button"
            onClick={handleApplyManual}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-md flex items-center justify-center gap-1 cursor-pointer shadow-sm transition"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Terapkan Pin
          </button>
        </div>
      </div>
    </div>
  );
};
