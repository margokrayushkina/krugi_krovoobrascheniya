interface ControlPanelProps {
  isPaused: boolean;
  onTogglePause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGlossary: () => void;
  onOpenQuiz: () => void;
}

export function ControlPanel({
  isPaused,
  onTogglePause,
  speed,
  onSpeedChange,
  showLabels,
  onToggleLabels,
  soundEnabled,
  onToggleSound,
  onOpenGlossary,
  onOpenQuiz,
}: ControlPanelProps) {
  return (
    <div className="relative z-20 bg-[#0d1b2a]/90 backdrop-blur-md border-t border-blue-500/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
        {/* Play/Pause */}
        <button
          onClick={onTogglePause}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm md:text-base transition-colors min-w-[44px] min-h-[44px]"
          title={isPaused ? 'Воспроизвести' : 'Пауза'}
        >
          <span className="text-lg">{isPaused ? '▶️' : '⏸️'}</span>
          <span className="hidden md:inline">{isPaused ? 'Пуск' : 'Пауза'}</span>
        </button>

        {/* Speed slider */}
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">🐢</span>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-20 md:w-32 h-2 rounded-full appearance-none bg-gray-600 cursor-pointer accent-blue-500"
            title={`Скорость: ${speed.toFixed(1)}x`}
          />
          <span className="text-white text-sm">🐇</span>
          <span className="text-blue-300 text-xs md:text-sm min-w-[3ch]">{speed.toFixed(1)}x</span>
        </div>

        {/* Labels toggle */}
        <button
          onClick={onToggleLabels}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-colors min-w-[44px] min-h-[44px] ${
            showLabels 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
          }`}
          title="Показать/скрыть подписи"
        >
          <span className="text-lg">🏷️</span>
          <span className="hidden md:inline">Подписи</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-colors min-w-[44px] min-h-[44px] ${
            soundEnabled 
              ? 'bg-purple-600 hover:bg-purple-500 text-white' 
              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
          }`}
          title="Включить/выключить звук"
        >
          <span className="text-lg">{soundEnabled ? '🔊' : '🔇'}</span>
          <span className="hidden md:inline">Звук</span>
        </button>

        {/* Glossary */}
        <button
          onClick={onOpenGlossary}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm md:text-base transition-colors min-w-[44px] min-h-[44px]"
          title="Словарь терминов"
        >
          <span className="text-lg">📖</span>
          <span className="hidden md:inline">Словарь</span>
        </button>

        {/* Quiz */}
        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm md:text-base transition-colors min-w-[44px] min-h-[44px]"
          title="Проверь себя"
        >
          <span className="text-lg">✅</span>
          <span className="hidden md:inline">Тест</span>
        </button>
      </div>
    </div>
  );
}
