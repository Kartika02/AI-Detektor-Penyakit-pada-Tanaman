import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-6 h-6 transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-green rounded"
        aria-expanded={isOpen}
      >
        <h3 className="text-xl font-semibold text-brand-green">{title}</h3>
        <ChevronIcon isOpen={isOpen} />
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="pb-4 pt-1 text-gray-700 leading-relaxed">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
