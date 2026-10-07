import { useState } from 'react';
import { organData, OrganInfo } from '../data';

interface GlossaryProps {
  onBack: () => void;
}

export function Glossary({ onBack }: GlossaryProps) {
  const [selectedTerm, setSelectedTerm] = useState<OrganInfo | null>(null);
  
  const allTerms = Object.values(organData).sort((a, b) => 
    a.name.localeCompare(b.name, 'ru')
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'heart': return 'bg-red-900/50 border-red-500/50';
      case 'organ': return 'bg-green-900/50 border-green-500/50';
      case 'circle': return 'bg-blue-900/50 border-blue-500/50';
      default: return 'bg-gray-900/50 border-gray-500/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'heart': return '❤️';
      case 'organ': return '🫁';
      case 'circle': return '🔄';
      default: return '📋';
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3e] to-[#0d1b2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0d1b2a]/80 border-b border-blue-500/30">
        <h1 className="text-xl md:text-3xl font-bold text-white">📖 Словарь терминов</h1>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base md:text-lg transition-colors min-w-[44px] min-h-[44px]"
        >
          <span>←</span>
          <span>К симуляции</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Terms list */}
        <div className="w-full md:w-1/2 overflow-y-auto p-4 md:p-6 space-y-3">
          {allTerms.map(term => (
            <button
              key={term.id}
              onClick={() => setSelectedTerm(term)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[44px] ${
                selectedTerm?.id === term.id 
                  ? getCategoryColor(term.category) + ' border-opacity-100 scale-[1.02]' 
                  : 'bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50 hover:border-gray-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getCategoryIcon(term.category)}</span>
                <span className="text-base md:text-lg font-semibold text-white">{term.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="hidden md:flex w-1/2 flex-col p-6 bg-[#0d1b2a]/50 border-l border-blue-500/20 overflow-y-auto">
          {selectedTerm ? (
            <div className="animate-fadeIn" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{getCategoryIcon(selectedTerm.category)}</span>
                <h2 className="text-2xl font-bold text-white">{selectedTerm.name}</h2>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">Описание</h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  {selectedTerm.description}
                </p>
              </div>

              <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                <h3 className="text-sm font-semibold text-yellow-300 mb-2 uppercase tracking-wide">Роль в кровообращении</h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  {selectedTerm.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-lg">
              <p>← Выберите термин из списка</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile detail view */}
      {selectedTerm && (
        <div className="md:hidden absolute bottom-20 left-4 right-4 bg-[#1a1a3e]/95 backdrop-blur-md border-2 border-blue-400/50 rounded-2xl p-5 shadow-2xl z-30">
          <button 
            onClick={() => setSelectedTerm(null)}
            className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/30 hover:bg-red-500/60 text-white text-xl font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{getCategoryIcon(selectedTerm.category)}</span>
            <h2 className="text-lg font-bold text-white">{selectedTerm.name}</h2>
          </div>
          <p className="text-base text-gray-200 mb-3">{selectedTerm.description}</p>
          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
            <p className="text-sm font-semibold text-yellow-300 mb-1">Роль:</p>
            <p className="text-base text-gray-200">{selectedTerm.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
