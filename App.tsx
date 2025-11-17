
import React, { useState, useCallback } from 'react';
import { analyzePlantImage } from './services/geminiService';
import type { GroundingChunk } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setSources(null);
      setError(null);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Silakan pilih gambar terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSources(null);

    try {
      const result = await analyzePlantImage(imageFile);
      setAnalysis(result.analysis);
      setSources(result.sources);
    } catch (err) {
      console.error(err);
      setError('Gagal menganalisis gambar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setSources(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-green">Deteksi Penyakit Tanaman</h2>
            <p className="text-gray-600 mt-2">Unggah foto daun tanaman Anda untuk identifikasi penyakit oleh AI.</p>
          </div>
          
          {!imageUrl && <ImageUploader onImageSelect={handleImageChange} />}
          
          {imageUrl && (
            <div className="flex flex-col items-center">
                <div className="w-full max-w-md mb-6 relative">
                    <img src={imageUrl} alt="Pratinjau Tanaman" className="rounded-xl shadow-lg w-full h-auto object-contain" />
                </div>
                 {!isLoading && !analysis && (
                     <button
                        onClick={handleAnalyzeClick}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-brand-light-green hover:bg-brand-green text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                     >
                       Analisis Gambar
                     </button>
                 )}
            </div>
          )}

          {isLoading && <Spinner />}

          {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
          
          {analysis && (
            <>
              <AnalysisResult analysis={analysis} sources={sources} />
              <div className="text-center mt-8">
                <button
                  onClick={handleReset}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out"
                >
                  Analisis Gambar Lain
                </button>
              </div>
            </>
          )}

        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Didukung oleh Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
