import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognitionState } from '../types';

// Web Speech API type shims
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

const SpeechRecognitionCtor: (new () => SpeechRecognitionInstance) | null =
  (typeof window !== 'undefined' &&
    ((window as unknown as Record<string, unknown>).SpeechRecognition as new () => SpeechRecognitionInstance) ||
    ((window as unknown as Record<string, unknown>).webkitSpeechRecognition as new () => SpeechRecognitionInstance)) ||
  null;

export function useSpeechRecognition(onFinalResult?: (transcript: string) => void) {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SpeechRecognitionCtor,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));

      if (final && onFinalResultRef.current) {
        onFinalResultRef.current(final);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' is not a real error — just silence
      if (event.error === 'no-speech') return;
      setState((prev) => ({ ...prev, error: event.error, isListening: false }));
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already starting
        }
      } else {
        setState((prev) => ({ ...prev, isListening: false }));
      }
    };

    recognitionRef.current = recognition;
    return () => {
      isListeningRef.current = false;
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    isListeningRef.current = true;
    setState((prev) => ({
      ...prev,
      isListening: true,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
    try {
      recognitionRef.current.start();
    } catch {
      // Already running
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setState((prev) => ({ ...prev, isListening: false, interimTranscript: '' }));
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
