
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onPhotoTaken: (file: File) => void;
  onClose: () => void;
}

const ShutterIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);


const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoTaken, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        activeStream = stream;
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
        // Fallback to any camera if environment fails
        try {
             const stream = await navigator.mediaDevices.getUserMedia({ video: true });
             activeStream = stream;
             setStream(stream);
             if (videoRef.current) {
                videoRef.current.srcObject = stream;
             }
             setError(null); // Clear previous error
        } catch (fallbackErr) {
             console.error("Fallback camera access failed:", fallbackErr);
             setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const handleTakePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onPhotoTaken(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [onPhotoTaken]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-3xl aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-2xl m-4">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
        />
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                <p className="text-white text-center p-4">{error}</p>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex items-center justify-center space-x-8 mt-4">
        <button 
            onClick={onClose}
            className="text-white bg-gray-700 bg-opacity-50 hover:bg-opacity-75 rounded-full px-6 py-2 transition-colors"
            aria-label="Tutup Kamera"
        >
          Batal
        </button>
        <button 
            onClick={handleTakePhoto}
            disabled={!!error}
            className="text-white p-4 rounded-full border-4 border-white hover:bg-white hover:bg-opacity-20 transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ambil Foto"
        >
            <ShutterIcon className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
