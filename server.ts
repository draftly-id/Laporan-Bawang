import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { calculateGarlicYieldPrediction } from './src/services/predictiveEngine';
import { PredictiveAnalysisInput } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Predictive Garlic Yield Analysis Endpoint
  app.post('/api/predict-yield', async (req, res) => {
    try {
      const input: PredictiveAnalysisInput = req.body;

      // Deterministic Base Calculation
      const baseResult = calculateGarlicYieldPrediction(input);

      // Optionally enhance recommendations using Gemini if API key is present
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `Sebagai pakar agronomis budidaya bawang putih Indonesia, berikan 3 saran taktis spesifik dan relevan untuk lokasi berikut:
Kabupaten: ${input.kabupaten || 'Enrekang'}, Ketinggian: ${input.ketinggianMdpl} mdpl, Jenis Tanah: ${input.jenisTanah}, Irigasi: ${input.jenisIrigasi}, Curah Hujan: ${input.curahHujanMmBulan} mm/bulan, Luas Tanam: ${input.luasTanamM2} m2, Bibit: ${input.jumlahBibitKg} kg (${input.varietasBawang}).
Saran harus praktis, singkat (maksimal 2 kalimat per poin), fokus pada pencegahan hama lokal (misal Layu Fusarium/Bercak Ungu Stemphylium) & pemupukan berimbang NPK/Organik.
Jawab langsung dalam format bullet point tanpa intro.`;

          const modelsToTry = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
          let response = null;

          for (const modelName of modelsToTry) {
            try {
              response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
              });
              if (response && response.text) break;
            } catch (_err) {
              // Silence individual model fallback errors to prevent stderr noise
            }
          }

          const aiText = response?.text;
          if (aiText) {
            const aiLines = aiText
              .split('\n')
              .map((line) => line.replace(/^[-*•\d.]+\s*/, '').trim())
              .filter((line) => line.length > 10);

            if (aiLines.length > 0) {
              baseResult.rekomendasiAgronomis = [
                ...aiLines.slice(0, 3),
                ...baseResult.rekomendasiAgronomis,
              ];
            }
          }
        } catch (geminiErr) {
          console.warn('Gemini enhancement skipped, using standard engine:', geminiErr);
        }
      }

      res.json({ success: true, data: baseResult });
    } catch (err: any) {
      console.error('Error calculating yield prediction:', err);
      res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIPERBAWA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
