import React, { useRef, useState } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';
import { PhotoBukti } from '../types';

interface WatermarkCanvasProps {
  officerName: string;
  officerNrp: string;
  locationName: string;
  latitude: number;
  longitude: number;
  onPhotoCaptured: (photo: PhotoBukti) => void;
}

export const WatermarkCanvas: React.FC<WatermarkCanvasProps> = ({
  officerName,
  officerNrp,
  locationName,
  latitude,
  longitude,
  onPhotoCaptured,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processImage = (file: File) => {
    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Scale canvas to image dimensions (bounded to reasonable max width)
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw main photo
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark Banner Styling
        const bannerHeight = Math.max(120, Math.round(height * 0.18));
        const bannerY = height - bannerHeight;

        // Dark gradient overlay background
        const gradient = ctx.createLinearGradient(0, bannerY - 30, 0, height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.82)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.96)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY - 30, width, bannerHeight + 30);

        // Accent gold/amber line
        ctx.fillStyle = '#f59e0b'; // Amber-500
        ctx.fillRect(0, bannerY - 30, width, 4);

        // Watermark Text Details
        const nowStr = new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB';

        const fontSizeMain = Math.max(14, Math.round(width * 0.024));
        const fontSizeSub = Math.max(12, Math.round(width * 0.02));

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSizeMain}px sans-serif`;

        const paddingX = Math.round(width * 0.03);
        let currentY = bannerY + Math.round(fontSizeMain * 0.8);

        // Line 1: POLRI Bhabinkamtibmas & Officer
        ctx.fillText(`👮 PETUGAS: ${officerName} (NRP ${officerNrp})`, paddingX, currentY);

        // Line 2: GPS Coordinates
        currentY += Math.round(fontSizeSub * 1.5);
        ctx.fillStyle = '#fbbf24'; // Yellow-400
        ctx.font = `bold ${fontSizeSub}px sans-serif`;
        ctx.fillText(`📍 GPS: Lat ${latitude.toFixed(6)}, Long ${longitude.toFixed(6)}`, paddingX, currentY);

        // Line 3: Location Name
        currentY += Math.round(fontSizeSub * 1.4);
        ctx.fillStyle = '#e2e8f0'; // Slate-200
        ctx.font = `${fontSizeSub}px sans-serif`;
        ctx.fillText(`🌾 WILAYAH: ${locationName}`, paddingX, currentY);

        // Line 4: Timestamp & Watermark Stamp
        currentY += Math.round(fontSizeSub * 1.4);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`🕒 WAKTU: ${nowStr} | DOKUMENTASI PRESISI BHABINKAMTIBMAS`, paddingX, currentY);

        // Convert to data URL
        const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPreviewUrl(watermarkedDataUrl);
        setProcessing(false);

        const newPhoto: PhotoBukti = {
          id: `photo-${Date.now()}`,
          url: watermarkedDataUrl,
          timestamp: nowStr,
          watermarkText: `${officerName} (NRP ${officerNrp}) | Lat: ${latitude}, Lng: ${longitude}`,
          lat: latitude,
          lng: longitude,
          officerName,
        };

        onPhotoCaptured(newPhoto);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  // Sample photo generator for quick testing if device camera is unavailable
  const generateSampleFieldPhoto = () => {
    setProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw realistic garlic field illustration canvas background
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 350);
    skyGradient.addColorStop(0, '#7dd3fc');
    skyGradient.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 1000, 350);

    // Mountain silhouettes in background
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(250, 120);
    ctx.lineTo(550, 350);
    ctx.lineTo(800, 180);
    ctx.lineTo(1000, 350);
    ctx.closePath();
    ctx.fill();

    // Field Soil
    const fieldGradient = ctx.createLinearGradient(0, 350, 0, 700);
    fieldGradient.addColorStop(0, '#451a03');
    fieldGradient.addColorStop(1, '#78350f');
    ctx.fillStyle = fieldGradient;
    ctx.fillRect(0, 350, 1000, 350);

    // Garlic plants rows
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 12;
    for (let x = 50; x < 950; x += 80) {
      for (let y = 380; y < 650; y += 45) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x - 20, y - 30, x - 10, y - 50);
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 20, y - 30, x + 10, y - 50);
        ctx.stroke();
      }
    }

    // Convert canvas to blob & process
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'field_sample.jpg', { type: 'image/jpeg' });
        processImage(file);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="font-semibold text-amber-400 text-sm flex items-center gap-2">
            <Camera className="w-4 h-4" /> Kamera & Watermark Otomatis GPS
          </h4>
          <p className="text-xs text-slate-400">
            Foto dilapisi watermark otomatis: Waktu, Nama Petugas, NRP, dan Koordinat GPS.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" /> Unggah / Ambil Foto
          </button>

          <button
            type="button"
            onClick={generateSampleFieldPhoto}
            disabled={processing}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 border border-slate-700"
            title="Simulasi foto lapangan otomatis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
            Simulasi Foto
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {previewUrl && (
        <div className="mt-3 relative rounded-lg overflow-hidden border border-amber-500/30 group">
          <img
            src={previewUrl}
            alt="Bukti Lapangan Watermarked"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
            <CheckCircle2 className="w-3 h-3" /> Watermark GPS Valid
          </div>
        </div>
      )}
    </div>
  );
};
