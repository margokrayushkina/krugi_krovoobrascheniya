import { OrganInfo } from '../data';

interface InfoPanelProps {
  organ: OrganInfo;
  onClose: () => void;
}

export function InfoPanel({ organ, onClose }: InfoPanelProps) {
  const getCategoryIcon = () => {
    switch (organ.category) {
      case 'heart': return '❤️';
      case 'organ': return '🫁';
      case 'circle': return '🔄';
    }
  };

  const getCategoryLabel = () => {
    switch (organ.category) {
      case 'heart': return 'Камера сердца';
      case 'organ': return 'Орган';
      case 'circle': return 'Круг кровообращения';
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
      <div 
        className="pointer-events-auto bg-[#1a1a3e]/95 backdrop-blur-md border-2 border-blue-400/50 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/30 hover:bg-red-500/60 text-white text-xl font-bold transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{getCategoryIcon()}</span>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">{organ.name}</h2>
            <span className="text-sm text-blue-300">{getCategoryLabel()}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-blue-300 mb-1">Описание:</h3>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
            {organ.description}
          </p>
        </div>

        {/* Role */}
        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
          <h3 className="text-sm font-semibold text-yellow-300 mb-1">Роль в кровообращении:</h3>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed">
            {organ.role}
          </p>
        </div>
      </div>
    </div>
  );
}
