
import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
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
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
    
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
    
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-brand-green bg-green-50' : 'border-gray-300 hover:border-brand-light-green'}`}
        onClick={() => document.getElementById('file-upload')?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center text-gray-500">
        <UploadIcon className="w-12 h-12 mb-4 text-gray-400"/>
        <p className="font-semibold">Seret & lepas gambar di sini</p>
        <p className="text-sm my-2">atau</p>
        <p className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium">
          Pilih File
        </p>
        <p className="text-xs text-gray-400 mt-4">PNG, JPG, WEBP</p>
      </div>
    </div>
  );
};

export default ImageUploader;
