
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GroundingChunk, AnalysisResponse } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzePlantImage = async (imageFile: File): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);
  
  const prompt = `
    Anda adalah seorang ahli patologi tumbuhan virtual yang canggih. Tugas Anda adalah menganalisis gambar tanaman yang diunggah pengguna.
    
    Lakukan analisis berikut dalam format Markdown yang jelas dan terstruktur dengan baik:
    
    1.  **Diagnosis:** Identifikasi penyakit, hama, atau masalah nutrisi yang paling mungkin terlihat pada gambar. Jika tanaman terlihat sehat, nyatakan demikian. Bersikaplah se-spesifik mungkin.
    2.  **Deskripsi & Gejala:** Jelaskan penyakit atau masalah tersebut. Rincikan gejala-gejala yang Anda identifikasi dari gambar (misalnya, 'bercak kuning dengan lingkaran hitam', 'daun menguning', 'terdapat jaring laba-laba halus').
    3.  **Saran Perawatan & Pencegahan:** Berikan saran yang dapat ditindaklanjuti untuk mengatasi masalah ini. Sertakan metode organik dan kimia (jika ada). Berikan juga tips untuk mencegah masalah ini di masa depan.
    
    Gunakan informasi terbaru dari web untuk memastikan saran Anda akurat dan relevan. Format respons Anda dengan jelas menggunakan heading, bold, dan bullet points agar mudah dibaca.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                imagePart
            ],
        },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const analysis = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks?.filter(chunk => 'web' in chunk) || []) as GroundingChunk[];

    if (!analysis) {
        throw new Error("API tidak memberikan hasil analisis.");
    }

    return { analysis, sources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi.");
  }
};
