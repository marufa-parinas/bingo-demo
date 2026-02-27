interface Props {
  transcript: string;
  interimTranscript: string;
  detectedWords: string[];
  isListening: boolean;
}

export function TranscriptPanel({
  transcript,
  interimTranscript,
  detectedWords,
  isListening,
}: Props) {
  const displayTranscript = transcript.slice(-120);

  return (
    <div className="w-full max-w-md bg-gray-100 rounded-xl p-3 mt-3">
      {/* Status row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        <span className="text-xs font-medium text-gray-600">
          {isListening ? '🎤 Listening...' : '🎤 Paused'}
        </span>
      </div>

      {/* Transcript text */}
      <div className="text-xs text-gray-700 min-h-[32px] leading-relaxed">
        <span>{displayTranscript || 'Waiting for speech…'}</span>
        {interimTranscript && (
          <span className="italic text-gray-400"> {interimTranscript}</span>
        )}
      </div>

      {/* Detected word chips */}
      {detectedWords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">Detected:</span>
          {detectedWords.slice(-5).map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium"
            >
              ✨ {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
