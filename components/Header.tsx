
import React from 'react';

const LeafIcon: React.FC<{className?: string}> = ({ className }) => (
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
        <path d="M12 22c-2.3-1.3-4.1-3.4-5.3-6.1C5.2 11.9 6 8.2 9.1 6.3c2.4-1.5 5.5-.6 7.2 1.7.9 1.2 1.3 2.7 1.2 4.2-.1 1.5-.7 2.9-1.8 4-.8.8-1.8 1.4-2.9 1.8z" />
        <path d="M12 22c3.4-1.2 5.9-4.2 6.8-7.9.6-2.5.2-5.1-1.2-7.2-1.2-1.7-3.1-2.9-5.1-3.2-2.9-.4-5.7 1-7.2 3.4C4 9.9 4.2 13.1 6.1 16c1.2 1.8 3 3.2 5.1 4.1" />
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <LeafIcon className="w-8 h-8 text-brand-light-green mr-3" />
        <h1 className="text-xl md:text-2xl font-bold text-brand-green">
          Detektor Penyakit Tanaman AI
        </h1>
      </div>
    </header>
  );
};

export default Header;
