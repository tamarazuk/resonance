import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

type UseVoiceDictationOptions = {
  disabled?: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAfterInputChange?: () => void;
};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };

  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

function combineTranscript(base: string, dictated: string) {
  const normalizedBase = base.trimEnd();
  const normalizedDictated = dictated.trim();

  if (!normalizedDictated) {
    return base;
  }

  if (!normalizedBase) {
    return normalizedDictated;
  }

  return `${normalizedBase} ${normalizedDictated}`;
}

function mapSpeechError(errorCode: string) {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission is blocked. Allow access and try again.";
    case "audio-capture":
      return "No microphone was detected. Check your microphone settings.";
    case "network":
      return "Voice dictation lost connection. Please try again.";
    case "no-speech":
      return "No speech detected. Try speaking a little louder.";
    default:
      return "Voice dictation failed. Please try again.";
  }
}

export function useVoiceDictation({
  disabled = false,
  inputValue,
  onInputChange,
  onAfterInputChange,
}: UseVoiceDictationOptions) {
  const [isVoiceSupported] = useState(
    () => getSpeechRecognitionConstructor() !== null,
  );
  const [isListening, setIsListening] = useState(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string | null>(
    null,
  );

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const dictationBaseRef = useRef("");
  const finalTranscriptRef = useRef("");
  const hadRecognitionErrorRef = useRef(false);
  const isDictatingRef = useRef(false);

  const stopVoiceDictation = useCallback((mode: "stop" | "abort" = "stop") => {
    isDictatingRef.current = false;
    setIsListening(false);
    setVoiceStatusMessage(null);

    if (mode === "abort") {
      recognitionRef.current?.abort();
      return;
    }

    recognitionRef.current?.stop();
  }, []);

  const resetVoiceDictation = useCallback(() => {
    dictationBaseRef.current = "";
    finalTranscriptRef.current = "";
    hadRecognitionErrorRef.current = false;
    setVoiceStatusMessage(null);
  }, []);

  const clearVoiceStatusMessage = useCallback(() => {
    setVoiceStatusMessage(null);
  }, []);

  useEffect(() => {
    if (!disabled || !isListening) {
      return;
    }

    stopVoiceDictation();
  }, [disabled, isListening, stopVoiceDictation]);

  useEffect(() => {
    return () => {
      stopVoiceDictation("abort");
      recognitionRef.current = null;
    };
  }, [stopVoiceDictation]);

  const ensureRecognition = useCallback(() => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      if (!isDictatingRef.current) {
        return;
      }

      let interimTranscript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const segment = result[0]?.transcript?.trim() ?? "";

        if (!segment) {
          continue;
        }

        if (result.isFinal) {
          finalTranscriptRef.current = combineTranscript(
            finalTranscriptRef.current,
            segment,
          );
        } else {
          interimTranscript = combineTranscript(interimTranscript, segment);
        }
      }

      const combinedDictation = combineTranscript(
        finalTranscriptRef.current,
        interimTranscript,
      );
      const nextValue = combineTranscript(
        dictationBaseRef.current,
        combinedDictation,
      );

      onInputChange(nextValue);
      onAfterInputChange?.();
    };

    recognition.onerror = (event) => {
      isDictatingRef.current = false;
      hadRecognitionErrorRef.current = true;
      setVoiceStatusMessage(mapSpeechError(event.error));
      setIsListening(false);

      if (typeof recognition.abort === "function") {
        recognition.abort();
      }
    };

    recognition.onend = () => {
      isDictatingRef.current = false;
      setIsListening(false);
      if (!hadRecognitionErrorRef.current) {
        setVoiceStatusMessage(null);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [onAfterInputChange, onInputChange]);

  const toggleVoiceDictation = useCallback(() => {
    if (disabled) {
      return;
    }

    if (isListening) {
      stopVoiceDictation();
      return;
    }

    const recognition = ensureRecognition();
    if (!recognition) {
      setVoiceStatusMessage(
        "Voice dictation is not supported in this browser.",
      );
      return;
    }

    dictationBaseRef.current = inputValue;
    finalTranscriptRef.current = "";
    hadRecognitionErrorRef.current = false;
    setVoiceStatusMessage("Listening...");

    try {
      recognition.start();
      isDictatingRef.current = true;
      setIsListening(true);
    } catch {
      isDictatingRef.current = false;
      hadRecognitionErrorRef.current = true;
      setVoiceStatusMessage(
        "Unable to start voice dictation. Please try again.",
      );
      setIsListening(false);
    }
  }, [
    disabled,
    ensureRecognition,
    inputValue,
    isListening,
    stopVoiceDictation,
  ]);

  return {
    isVoiceSupported,
    isListening,
    voiceStatusMessage,
    clearVoiceStatusMessage,
    toggleVoiceDictation,
    stopVoiceDictation,
    resetVoiceDictation,
  };
}
