import { useState, useCallback } from 'react';
import { quizQuestions, organData } from '../data';

interface QuizProps {
  onBack: () => void;
}

export function Quiz({ onBack }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];

  const handleOrganClick = useCallback((organId: string) => {
    // Блокируем любые нажатия при правильном ответе или во время показа ошибки
    if (feedback === 'correct' || feedback === 'wrong') return;
    
    const newOrder = [...selectedOrder, organId];
    const expectedIndex = newOrder.length - 1;

    // Проверяем, правильный ли это шаг
    if (question.correctOrder[expectedIndex] !== organId) {
      // Неправильный ответ: НЕ добавляем элемент, сразу показываем ошибку
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
      return;
    }

    // Правильный шаг — добавляем в порядок
    setSelectedOrder(newOrder);

    // Проверяем, все ли шаги завершены
    if (newOrder.length === question.correctOrder.length) {
      setFeedback('correct');
      setScore(s => s + 1);
    }
  }, [selectedOrder, question, feedback]);

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedOrder([]);
      setFeedback(null);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedOrder([]);
    setFeedback(null);
    setScore(0);
    setCompleted(false);
  };

  const getOrganName = (id: string) => organData[id]?.name || id;

  if (completed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3e] to-[#0d1b2a]">
        <div className="bg-[#1a1a3e]/90 backdrop-blur-md border-2 border-green-500/50 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">
            {score === quizQuestions.length ? '🏆' : score >= 2 ? '🎉' : '📚'}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {score === quizQuestions.length ? 'Отлично! Все ответы верные!' : 
             score >= 2 ? 'Хороший результат!' : 'Попробуй ещё раз!'}
          </h1>
          <p className="text-xl text-gray-200 mb-6">
            Правильных ответов: <span className="text-green-400 font-bold">{score}</span> из {quizQuestions.length}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-colors min-w-[44px] min-h-[44px]"
            >
              🔄 Пройти заново
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-semibold text-lg transition-colors min-w-[44px] min-h-[44px]"
            >
              ← К симуляции
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3e] to-[#0d1b2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0d1b2a]/80 border-b border-blue-500/30">
        <h1 className="text-xl md:text-3xl font-bold text-white">✅ Проверь себя</h1>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base md:text-lg transition-colors min-w-[44px] min-h-[44px]"
        >
          <span>←</span>
          <span>К симуляции</span>
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 md:px-8 py-3 bg-[#0d1b2a]/50">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm md:text-base">Вопрос {currentQuestion + 1} из {quizQuestions.length}</span>
          <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion) / quizQuestions.length) * 100}%` }}
            />
          </div>
          <span className="text-green-400 text-sm md:text-base font-semibold">⭐ {score}</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="bg-[#1a1a3e]/90 backdrop-blur-md border-2 border-blue-500/30 rounded-2xl p-6 md:p-8 max-w-2xl w-full">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{question.title}</h2>
          <p className="text-base md:text-lg text-gray-300 mb-6">{question.description}</p>

          {/* Selected order display */}
          <div className="mb-6 min-h-[60px] bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
            <p className="text-sm text-gray-400 mb-2">Твой ответ:</p>
            <div className="flex flex-wrap gap-2">
              {selectedOrder.map((id, idx) => (
                <span 
                  key={`${id}-${idx}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/50 text-white text-sm md:text-base font-semibold border border-blue-400/50"
                >
                  {idx + 1}. {getOrganName(id)}
                </span>
              ))}
              {selectedOrder.length === 0 && (
                <span className="text-gray-500 text-sm md:text-base italic">Нажимай на кнопки ниже в правильном порядке...</span>
              )}
            </div>
          </div>

          {/* Organ buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {question.organIds.map(organId => {
              const isSelected = selectedOrder.includes(organId);
              const organ = organData[organId];
              const isLocked = feedback === 'correct' || feedback === 'wrong';
              return (
                <button
                  key={organId}
                  onClick={() => handleOrganClick(organId)}
                  disabled={isSelected || isLocked}
                  className={`p-3 md:p-4 rounded-xl font-semibold text-sm md:text-base transition-all min-h-[44px] ${
                    isSelected 
                      ? 'bg-blue-700/50 text-blue-300 border-2 border-blue-500/50 opacity-60'
                      : isLocked
                        ? 'bg-gray-700/70 text-gray-400 border-2 border-gray-500/30 opacity-60 cursor-not-allowed'
                        : 'bg-gray-700/70 hover:bg-gray-600/70 text-white border-2 border-gray-500/30 hover:border-blue-400/50 hover:scale-105'
                  }`}
                >
                  {organ?.name || organId}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback === 'wrong' && (
            <div className="p-4 rounded-xl bg-red-900/50 border-2 border-red-500/50 text-center animate-pulse">
              <p className="text-lg md:text-xl text-red-300 font-semibold">
                ❌ Неверно! Попробуй ещё раз.
              </p>
              <p className="text-sm text-red-200 mt-1">Подсказка: вспомни, куда течёт кровь из этой камеры.</p>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-4 rounded-xl bg-green-900/50 border-2 border-green-500/50 text-center">
              <p className="text-lg md:text-xl text-green-300 font-semibold">
                ✅ Правильно! Отличная работа!
              </p>
              <button
                onClick={handleNext}
                className="mt-4 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-lg transition-colors min-w-[44px] min-h-[44px]"
              >
                {currentQuestion < quizQuestions.length - 1 ? 'Следующий вопрос →' : 'Завершить тест 🏆'}
              </button>
            </div>
          )}

          {/* Reset button */}
          {selectedOrder.length > 0 && feedback !== 'correct' && feedback !== 'wrong' && (
            <button
              onClick={() => setSelectedOrder([])}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors min-h-[44px]"
            >
              🔄 Начать заново
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
