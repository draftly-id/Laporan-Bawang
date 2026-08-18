import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Layers,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Sparkles,
  Maximize2,
  Globe2,
  Sprout,
  UserCheck,
  TrendingUp,
  Mountain,
  Search,
  RotateCcw,
  ExternalLink,
  Printer,
  Table,
  Map as MapIcon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import L from 'leaflet';
import { LaporanBudidaya } from '../../types';

interface GisMapViewProps {
  reports: LaporanBudidaya[];
  onOpenPredictive: (report: LaporanBudidaya) => void;
}

type TileLayerType = 'OSM' | 'SATELLITE' | 'TOPO';

export const GisMapView: React.FC<GisMapViewProps> = ({
  reports,
  onOpenPredictive,
}) => {
  // Region & Status Filters
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>('SEMUA');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('SEMUA');
  const [selectedFase, setSelectedFase] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View States
  const [viewMode, setViewMode] = useState<'MAP' | 'TABLE'>('MAP');
  const [activeTile, setActiveTile] = useState<TileLayerType>('OSM');
  const [selectedReport, setSelectedReport] = useState<LaporanBudidaya | null>(
    reports[0] || null
  );

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Derive unique Kabupaten list from reports
  const kabupatenList = useMemo(() => {
    return Array.from(
      new Set(reports.map((r) => r.dataLahan.kabupaten))
    ).filter(Boolean);
  }, [reports]);

  // Derive unique Kecamatan list based on selected Kabupaten
  const kecamatanList = useMemo(() => {
    const subset =
      selectedKabupaten === 'SEMUA'
        ? reports
        : reports.filter((r) => r.dataLahan.kabupaten === selectedKabupaten);
    return Array.from(
      new Set(subset.map((r) => r.dataLahan.kecamatan))
    ).filter(Boolean);
  }, [reports, selectedKabupaten]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (
        selectedKabupaten !== 'SEMUA' &&
        r.dataLahan.kabupaten !== selectedKabupaten
      ) {
        return false;
      }
      if (
        selectedKecamatan !== 'SEMUA' &&
        r.dataLahan.kecamatan !== selectedKecamatan
      ) {
        return false;
      }
      if (selectedFase !== 'SEMUA' && r.statusTanaman !== selectedFase) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKelompok = r.kelompokTani.namaKelompok
          .toLowerCase()
          .includes(q);
        const matchDesa = r.dataLahan.desaKelurahan.toLowerCase().includes(q);
        const matchBhabin = r.userName.toLowerCase().includes(q);
        const matchId = r.id.toLowerCase().includes(q);
        if (!matchKelompok && !matchDesa && !matchBhabin && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [reports, selectedKabupaten, selectedKecamatan, selectedFase, searchQuery]);

  // Summary Aggregates for Filtered Data
  const aggregates = useMemo(() => {
    const totalTitik = filteredReports.length;
    const totalLuasM2 = filteredReports.reduce(
      (acc, r) => acc + (r.dataLahan.luasTanamM2 || 0),
      0
    );
    const totalLuasHa = (totalLuasM2 / 10000).toFixed(2);
    const totalEstimasiKg = filteredReports.reduce(
      (acc, r) => acc + (r.dataLahan.produksiPanenKg || 0),
      0
    );
    const totalEstimasiTon = (totalEstimasiKg / 1000).toFixed(1);
    const avgProduktivitasTonHa =
      totalLuasM2 > 0
        ? ((totalEstimasiKg / 1000) / (totalLuasM2 / 10000)).toFixed(2)
        : '0.00';
    const avgKetinggian =
      totalTitik > 0
        ? Math.round(
            filteredReports.reduce(
              (acc, r) => acc + (r.dataLahan.ketinggianMdpl || 0),
              0
            ) / totalTitik
          )
        : 0;

    return {
      totalTitik,
      totalLuasM2,
      totalLuasHa,
      totalEstimasiKg,
      totalEstimasiTon,
      avgProduktivitasTonHa,
      avgKetinggian,
    };
  }, [filteredReports]);

  // Get marker status color styling
  const getMarkerBadgeStyle = (statusTanaman: string) => {
    if (statusTanaman.includes('Siap Panen')) {
      return {
        bgColor: '#10b981', // emerald-500
        borderColor: '#6ee7b7',
        pulseClass: 'bg-emerald-500/40',
        label: 'Siap Panen',
        chipClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      };
    }
    if (statusTanaman.includes('Generatif')) {
      return {
        bgColor: '#f59e0b', // amber-500
        borderColor: '#fcd34d',
        pulseClass: 'bg-amber-500/40',
        label: 'Generatif',
        chipClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
    if (statusTanaman.includes('Vegetatif')) {
      return {
        bgColor: '#0284c7', // sky-600
        borderColor: '#7dd3fc',
        pulseClass: 'bg-sky-500/40',
        label: 'Vegetatif',
        chipClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      };
    }
    if (statusTanaman.includes('Bibit')) {
      return {
        bgColor: '#a855f7', // purple-500
        borderColor: '#d8b4fe',
        pulseClass: 'bg-purple-500/40',
        label: 'Bibit/Tanam Baru',
        chipClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      };
    }
    return {
      bgColor: '#ea580c', // orange-600
      borderColor: '#fdba74',
      pulseClass: 'bg-orange-500/40',
      label: 'Olahan Tanah',
      chipClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    };
  };

  // Tile Layer Configs
  const getTileUrl = (type: TileLayerType) => {
    switch (type) {
      case 'SATELLITE':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'TOPO':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'OSM':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileAttribution = (type: TileLayerType) => {
    switch (type) {
      case 'SATELLITE':
        return '&copy; Esri World Imagery';
      case 'TOPO':
        return '&copy; OpenTopoMap';
      case 'OSM':
      default:
        return '&copy; OpenStreetMap contributors';
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const initialLat = selectedReport?.dataLahan.latitude || -3.5642;
      const initialLng = selectedReport?.dataLahan.longitude || 119.7731;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: false,
      });

      // Add Zoom Control on top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add base Tile Layer
      const tile = L.tileLayer(getTileUrl(activeTile), {
        attribution: getTileAttribution(activeTile),
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tile;

      // Create LayerGroup for markers
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when tile type changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getTileUrl(activeTile));
  }, [activeTile]);

  // Render & Update Markers whenever filteredReports or selectedReport changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (filteredReports.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredReports.forEach((report) => {
      const lat = report.dataLahan.latitude;
      const lng = report.dataLahan.longitude;
      if (isNaN(lat) || isNaN(lng)) return;

      bounds.extend([lat, lng]);

      const isSelected = selectedReport?.id === report.id;
      const badgeStyle = getMarkerBadgeStyle(report.statusTanaman);

      // Custom DivIcon for map pin
      const customIcon = L.divIcon({
        className: 'custom-gis-pin-container',
        html: `
          <div class="relative group cursor-pointer flex items-center justify-center">
            ${
              isSelected
                ? `<div class="absolute -inset-2 rounded-full ${badgeStyle.pulseClass} animate-ping"></div>`
                : ''
            }
            <div style="background-color: ${badgeStyle.bgColor}; border-color: ${
          badgeStyle.borderColor
        };" class="w-8 h-8 rounded-full border-2 shadow-xl flex items-center justify-center text-slate-950 font-black text-xs transform transition duration-200 group-hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -top-7 whitespace-nowrap bg-slate-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${report.kelompokTani.namaKelompok}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content inside Leaflet
      const popupHtml = `
        <div class="p-3 bg-slate-900 text-slate-100 rounded-xl max-w-xs font-sans">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span class="text-[10px] font-mono font-bold text-amber-400">${
              report.id
            }</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
              badgeStyle.chipClass
            }">
              ${badgeStyle.label}
            </span>
          </div>
          <h4 class="font-bold text-xs text-white leading-tight">${
            report.kelompokTani.namaKelompok
          }</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Desa ${report.dataLahan.desaKelurahan}, Kec. ${
        report.dataLahan.kecamatan
      }
          </p>
          <div class="mt-2 text-[11px] space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div class="flex justify-between"><span class="text-slate-400">Luas Tanam:</span> <span class="font-bold text-white">${report.dataLahan.luasTanamM2.toLocaleString(
              'id-ID'
            )} m²</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Estimasi Panen:</span> <span class="font-bold text-emerald-400">${(
              report.dataLahan.produksiPanenKg / 1000
            ).toFixed(1)} Ton</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Bhabin:</span> <span class="text-amber-300">${
              report.userName
            }</span></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // On marker click
      marker.on('click', () => {
        setSelectedReport(report);
      });

      marker.addTo(layerGroup);
    });

    // Auto fit map bounds if multiple reports exist and user hasn't explicitly selected
    if (bounds.isValid() && filteredReports.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredReports, selectedReport]);

  // Center map on selected report when changed
  const handleSelectReport = (report: LaporanBudidaya) => {
    setSelectedReport(report);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [report.dataLahan.latitude, report.dataLahan.longitude],
        14,
        { duration: 1.2 }
      );
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedKabupaten('SEMUA');
    setSelectedKecamatan('SEMUA');
    setSelectedFase('SEMUA');
    setSearchQuery('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-2xl space-y-5">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Globe2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Peta Tematik GIS Sebaran Lahan Bawang Putih
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Real-time Data
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sistem Informasi Geografis Pemetaan Potensi Lahan Bhabinkamtibmas
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Layer Selector */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Map Tile Layers */}
          {viewMode === 'MAP' && (
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setActiveTile('OSM')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTile === 'OSM'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Peta
              </button>
              <button
                onClick={() => setActiveTile('SATELLITE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTile === 'SATELLITE'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Satelit
              </button>
              <button
                onClick={() => setActiveTile('TOPO')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTile === 'TOPO'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Topografi
              </button>
            </div>
          )}

          {/* Map vs Table View */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'MAP'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Peta GIS
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'TABLE'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Tabel Matriks
            </button>
          </div>
        </div>
      </div>

      {/* 2. Region & Attribute Filter Toolbar */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Filter Wilayah & Parameter Lahan
          </span>
          {(selectedKabupaten !== 'SEMUA' ||
            selectedKecamatan !== 'SEMUA' ||
            selectedFase !== 'SEMUA' ||
            searchQuery !== '') && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Kabupaten Filter */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
              Kabupaten / Kota
            </label>
            <select
              value={selectedKabupaten}
              onChange={(e) => {
                setSelectedKabupaten(e.target.value);
                setSelectedKecamatan('SEMUA'); // Reset child kecamatan
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Kabupaten / Kota</option>
              {kabupatenList.map((kab) => (
                <option key={kab} value={kab}>
                  Kab. {kab}
                </option>
              ))}
            </select>
          </div>

          {/* Kecamatan Filter */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
              Kecamatan
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Kecamatan</option>
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  Kec. {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Fase Tanaman Filter */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
              Fase Growth / Status Tanaman
            </label>
            <select
              value={selectedFase}
              onChange={(e) => setSelectedFase(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-amber-500 focus:outline-none"
            >
              <option value="SEMUA">Semua Fase Tanaman</option>
              <option value="Siap Panen (90+ HST)">Siap Panen (90+ HST)</option>
              <option value="Generatif (46-90 HST)">Generatif (46-90 HST)</option>
              <option value="Vegetatif (0-45 HST)">Vegetatif (0-45 HST)</option>
              <option value="Bibit / Tanam Baru">Bibit / Tanam Baru</option>
              <option value="Olahan Tanah">Olahan Tanah</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
              Cari Kelompok / Bhabin / Desa
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Ketik kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filtered Regional Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Titik Lahan
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-amber-400">
              {aggregates.totalTitik}
            </span>
            <span className="text-[10px] text-slate-400">Lokasi</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Luas Tanam
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-sky-400">
              {aggregates.totalLuasHa}
            </span>
            <span className="text-[10px] text-slate-400">Ha ({aggregates.totalLuasM2.toLocaleString('id-ID')} m²)</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Proyeksi Panen
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-emerald-400">
              {aggregates.totalEstimasiTon}
            </span>
            <span className="text-[10px] text-slate-400">Ton ({aggregates.totalEstimasiKg.toLocaleString('id-ID')} Kg)</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Rata-Rata Produktivitas
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-purple-400">
              {aggregates.avgProduktivitasTonHa}
            </span>
            <span className="text-[10px] text-slate-400">Ton / Ha</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Rerata Altitude
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-amber-300">
              {aggregates.avgKetinggian}
            </span>
            <span className="text-[10px] text-slate-400">mdpl</span>
          </div>
        </div>
      </div>

      {/* 4. Main Interactive Map & Details Section */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* GIS Leaflet Map Container */}
          <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative min-h-[460px] flex flex-col shadow-inner">
            {/* The Actual Leaflet Map DIV */}
            <div
              ref={mapContainerRef}
              className="w-full flex-1 min-h-[420px] z-0"
            />

            {/* Quick Horizontal Points Selector Bar at Bottom */}
            <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2.5 flex items-center gap-2 overflow-x-auto z-10">
              <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Titik Lahan ({filteredReports.length}):
              </span>
              {filteredReports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                const badgeStyle = getMarkerBadgeStyle(r.statusTanaman);
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReport(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 border transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: badgeStyle.bgColor }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>{r.kelompokTani.namaKelompok}</span>
                    <span className="text-[10px] opacity-80 font-mono">
                      ({r.dataLahan.desaKelurahan})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Location Statistical Summary Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            {selectedReport ? (
              <div className="space-y-3.5">
                {/* Header ID & Status */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 block">
                      {selectedReport.id}
                    </span>
                    <h3 className="font-bold text-base text-white leading-tight">
                      {selectedReport.kelompokTani.namaKelompok}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      getMarkerBadgeStyle(selectedReport.statusTanaman).chipClass
                    }`}
                  >
                    {selectedReport.statusTanaman}
                  </span>
                </div>

                {/* Location Administrative Info */}
                <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wilayah:</span>
                    <span className="font-semibold text-white">
                      Desa {selectedReport.dataLahan.desaKelurahan}, Kec. {selectedReport.dataLahan.kecamatan}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kabupaten:</span>
                    <span className="font-semibold text-white">
                      Kab. {selectedReport.dataLahan.kabupaten}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Koordinat GPS:</span>
                    <span className="font-mono text-sky-400 font-bold">
                      {selectedReport.dataLahan.latitude}, {selectedReport.dataLahan.longitude}
                    </span>
                  </div>
                </div>

                {/* Farmers & Officers Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ketua Kelompok</span>
                    <span className="font-bold text-white text-xs block truncate">
                      {selectedReport.kelompokTani.ketuaKelompok}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      📞 {selectedReport.kelompokTani.noHpKetua}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Petugas Bhabin</span>
                    <span className="font-bold text-amber-300 text-xs block truncate">
                      {selectedReport.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {selectedReport.userPolres}
                    </span>
                  </div>
                </div>

                {/* Production Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Luas Tanam</span>
                    <span className="font-bold text-white text-sm">
                      {selectedReport.dataLahan.luasTanamM2.toLocaleString('id-ID')} m²
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({(selectedReport.dataLahan.luasTanamM2 / 10000).toFixed(2)} Ha)
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Proyeksi Panen</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {(selectedReport.dataLahan.produksiPanenKg / 1000).toFixed(2)} Ton
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({selectedReport.dataLahan.produksiPanenKg.toLocaleString('id-ID')} Kg)
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ketinggian Lahan</span>
                    <span className="font-semibold text-amber-300">
                      {selectedReport.dataLahan.ketinggianMdpl} mdpl
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Varietas & Jenis Tanah</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {selectedReport.dataLahan.varietasBawang}
                    </span>
                  </div>
                </div>

                {/* Field Notes */}
                {selectedReport.catatanLapangan && (
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block mb-0.5">
                      Catatan Lapangan Bhabin:
                    </span>
                    <p className="text-slate-300 italic text-[11px] leading-relaxed">
                      "{selectedReport.catatanLapangan}"
                    </p>
                  </div>
                )}

                {/* Photo Bukti Preview */}
                {selectedReport.buktiFoto && selectedReport.buktiFoto.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Bukti Foto Lapangan Geotagged:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.buktiFoto.map((foto) => (
                        <div
                          key={foto.id}
                          className="relative rounded-lg overflow-hidden border border-slate-700 h-24 bg-slate-900 group"
                        >
                          <img
                            src={foto.url}
                            alt="Bukti Lapangan"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-1.5 flex flex-col justify-end">
                            <span className="text-[8px] font-mono text-amber-300 truncate">
                              {foto.watermarkText}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => onOpenPredictive(selectedReport)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> Analisis Prediktif Panen (AI Gemini)
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.dataLahan.latitude},${selectedReport.dataLahan.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" /> Buka Lokasi di Google Maps Tab
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
                <MapPin className="w-10 h-10 text-slate-600 animate-bounce" />
                <p className="text-xs font-semibold">
                  Klik salah satu titik pada peta untuk melihat ringkasan statistik detail lahan.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Table Matrix View */
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">ID & Kelompok Tani</th>
                <th className="p-3">Wilayah Binaan</th>
                <th className="p-3">Luas Tanam</th>
                <th className="p-3">Proyeksi Panen</th>
                <th className="p-3">Ketinggian</th>
                <th className="p-3">Status Tanaman</th>
                <th className="p-3">Petugas Bhabin</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredReports.map((r) => {
                const badgeStyle = getMarkerBadgeStyle(r.statusTanaman);
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-900/60 transition cursor-pointer"
                    onClick={() => {
                      setSelectedReport(r);
                      setViewMode('MAP');
                    }}
                  >
                    <td className="p-3">
                      <div className="font-bold text-white">{r.kelompokTani.namaKelompok}</div>
                      <div className="text-[10px] font-mono text-amber-400">{r.id}</div>
                    </td>
                    <td className="p-3">
                      <div>Desa {r.dataLahan.desaKelurahan}</div>
                      <div className="text-[10px] text-slate-500">
                        Kec. {r.dataLahan.kecamatan}, Kab. {r.dataLahan.kabupaten}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {r.dataLahan.luasTanamM2.toLocaleString('id-ID')} m²
                      <span className="text-[10px] text-slate-500 block">
                        ({(r.dataLahan.luasTanamM2 / 10000).toFixed(2)} Ha)
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {(r.dataLahan.produksiPanenKg / 1000).toFixed(2)} Ton
                      <span className="text-[10px] text-slate-500 block">
                        ({r.dataLahan.produksiPanenKg.toLocaleString('id-ID')} Kg)
                      </span>
                    </td>
                    <td className="p-3 text-amber-300 font-semibold">
                      {r.dataLahan.ketinggianMdpl} mdpl
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle.chipClass}`}
                      >
                        {r.statusTanaman}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{r.userName}</div>
                      <div className="text-[10px] text-slate-500">{r.userPolres}</div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPredictive(r);
                        }}
                        className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded text-[10px] font-bold flex items-center gap-1 transition ml-auto"
                      >
                        <Sparkles className="w-3 h-3" /> Analisis AI
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data lahan bawang putih untuk filter wilayah yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
