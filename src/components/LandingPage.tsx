interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-indigo-700 mb-3">
            🎯 Meeting Bingo
          </h1>
          <p className="text-xl text-gray-600">
            Turn any meeting into a game.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Auto-detects buzzwords using speech recognition.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xl font-bold rounded-2xl shadow-lg transition-all duration-150 hover:scale-105 active:scale-95 mb-6"
        >
          🎮 New Game
        </button>

        {/* Privacy */}
        <p className="text-sm text-gray-500 mb-10">
          🔒 Audio processed locally. Never recorded.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* How it works */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">How It Works</h2>
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            { step: '1️⃣', text: 'Pick a buzzword category' },
            { step: '2️⃣', text: 'Enable mic for auto-detection' },
            { step: '3️⃣', text: 'Join your meeting and listen' },
            { step: '4️⃣', text: 'Watch squares fill automatically!' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-2 bg-white rounded-xl p-3 shadow-sm">
              <span className="text-xl">{step}</span>
              <span className="text-sm text-gray-600 leading-tight">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
