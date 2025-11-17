
import React, { useState, useCallback } from 'react';
import { analyzePlantImage } from './services/geminiService';
import type { GroundingChunk } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import CameraCapture from './components/CameraCapture';

const CameraIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg 
        xmlns="http://www.w.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      // Clean up previous object URL if it exists
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setSources(null);
      setError(null);
    }
  };
  
  const handlePhotoTaken = (file: File) => {
    handleImageChange(file);
    setIsCameraOpen(false);
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
    if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
    }
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
            <p className="text-gray-600 mt-2">Unggah foto atau gunakan kamera untuk identifikasi penyakit oleh AI.</p>
          </div>
          
          {!imageUrl && (
            <div>
                <ImageUploader onImageSelect={handleImageChange} />
                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">ATAU</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <button
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center transform hover:scale-105"
                >
                    <CameraIcon className="w-5 h-5 mr-3" />
                    Gunakan Kamera
                </button>
            </div>
          )}
          
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
      
      {isCameraOpen && (
        <CameraCapture 
            onPhotoTaken={handlePhotoTaken}
            onClose={() => setIsCameraOpen(false)}
        />
      )}

      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Didukung oleh Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
