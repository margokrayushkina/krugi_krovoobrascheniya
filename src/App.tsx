import { useState } from 'react';
import { BodySimulation } from './components/BodySimulation';
import { Glossary } from './components/Glossary';
import { Quiz } from './components/Quiz';

type Screen = 'simulation' | 'glossary' | 'quiz';

function App() {
  const [screen, setScreen] = useState<Screen>('simulation');

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1a1a2e] to-[#16213e] overflow-hidden">
      {screen === 'simulation' && (
        <BodySimulation 
          onOpenGlossary={() => setScreen('glossary')} 
          onOpenQuiz={() => setScreen('quiz')} 
        />
      )}
      {screen === 'glossary' && (
        <Glossary onBack={() => setScreen('simulation')} />
      )}
      {screen === 'quiz' && (
        <Quiz onBack={() => setScreen('simulation')} />
      )}
    </div>
  );
}

export default App;
