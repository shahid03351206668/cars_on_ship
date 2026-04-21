import { useState } from 'react';

interface Year {
  name: string;
  year?: string;
}

interface Make {
  name: string;
}

interface Model {
  name: string;
  make?: string;
}

interface Variant {
  name: string;
  model?: string;
}

interface CarInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (carInfo: { year: string; make: string; model: string; variant: string }) => void
  years: Year[];
  makes: Make[];
  models: Model[];
  variants: Variant[];
  selectedYear: string;
  selectedMake: string;
  selectedModel: string;
  onYearChange: (year: string) => void;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  onVariantChange: (variant: string) => void;
}


interface ColumnListProps<T extends { name: string }> {
  items: T[];
  selected: string;
  onSelect: (name: string) => void;
  placeholder: string;
  loading?: boolean;
}

const ColumnList = <T extends { name: string }>({ 
  items, 
  selected,
  onSelect, 
  placeholder, 
  loading 
}: ColumnListProps<T>) => (
  <div className="overflow-hidden border border-gray-300 rounded-lg h-80">
    {!loading && items.length > 0 ? (
      <div className="h-full overflow-y-auto">
        {items.map((item) => (
          <button 
            key={item.name} 
            type="button" 
            onClick={() => onSelect(item.name)}
            className={`w-full text-left px-4 py-2.5 border-b border-gray-100 transition-colors ${
              selected === item.name
                ? 'bg-[#FC7844] text-white font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        {placeholder}
      </div>
    )}
  </div>
);

export default function CarInfoModal({ isOpen, onClose, onSelect, years, makes, models, variants, selectedYear, selectedMake, selectedModel, onYearChange, onMakeChange, onModelChange, onVariantChange }: CarInfoModalProps) {
  const [selectedVariant, setSelectedVariant] = useState('');

  if (!isOpen) return null;

  const handleDone = () => {
    if (selectedYear && selectedMake && selectedModel) {
      onSelect({ 
        year: selectedYear, 
        make: selectedMake, 
        model: selectedModel, 
        variant: selectedVariant || '' 
      });
      setSelectedVariant('');
    } else {
      alert('Please select year, make, and model');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Car Info</h2>
            <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-xs font-semibold text-gray-600 uppercase">Model Year</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Make</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Model</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Version <span className="text-gray-400">(Optional)</span></div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <ColumnList 
                items={years} 
                selected={selectedYear} 
                onSelect={onYearChange} 
                placeholder="Select Year" 
              />
              <ColumnList 
                items={selectedYear ? makes : []} 
                selected={selectedMake} 
                onSelect={onMakeChange} 
                placeholder="Select Make" 
                loading={!selectedYear} 
              />
              <ColumnList 
                items={selectedMake ? models : []} 
                selected={selectedModel} 
                onSelect={onModelChange} 
                placeholder="Select Model" 
                loading={!selectedMake} 
              />
              <ColumnList 
                items={selectedModel ? variants : []} 
                selected={selectedVariant} 
                onSelect={(variant) => {
                  setSelectedVariant(variant);
                  onVariantChange(variant);
                }} 
                placeholder="Select Version" 
                loading={!selectedModel} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button onClick={onClose} className="px-5 py-2 font-medium text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleDone} disabled={!selectedYear || !selectedMake || !selectedModel} className="px-6 py-2 font-medium text-white transition bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">Done</button>
          </div>
        </div>
      </div>
    </>
  );
}