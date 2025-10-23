import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="bg-white/6 backdrop-blur-lg rounded-xl p-8 w-full max-w-lg border border-white/20 text-center">
        <h1 className="text-white text-lg font-semibold mb-2">Pokemon MMORPG</h1>
        <p className="text-white/80 mb-6">Educational Battle Arena</p>

        <div className="mb-6">
          <p className="text-white/70">Welcome trainer — embark on a journey!</p>
        </div>

        <button
          onClick={onStart}
          aria-label="Start game"
          className="w-48 mx-auto py-2 rounded-lg text-white font-semibold shadow-lg hover:scale-105 transition-transform bg-cover bg-center"
          style={{
            backgroundImage: `url(${new URL('../assets/UI/Buttons/Button_Blue_3Slides.png', import.meta.url).href})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            paddingTop: '12px',
            paddingBottom: '12px',
          }}
        >
          <span className="sr-only">Start</span>
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
