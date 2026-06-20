"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

type PlaybackState = "idle" | "playing" | "paused";

const VOICE_STORAGE_KEY = "tgmarinho-blog-tts-voice";

interface PostAudioPlayerLabels {
  title: string;
  description: string;
  unsupported: string;
  voiceLabel: string;
  voiceDefault: string;
  noVoices: string;
  rateLabel: string;
  play: string;
  pause: string;
  resume: string;
  stop: string;
  progress: string;
}

interface PostAudioPlayerProps {
  locale: Locale;
  text: string;
  labels: PostAudioPlayerLabels;
  className?: string;
}

function getSpeechLang(locale: Locale) {
  return locale === "pt-BR" ? "pt-BR" : "en-US";
}

function getVoiceFamily(locale: Locale) {
  return locale === "pt-BR" ? "pt" : "en";
}

function decodeEntities(text: string) {
  if (typeof window === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function normalizeSpeechText(text: string) {
  return decodeEntities(text)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function chunkSpeechText(text: string, maxLength = 1800) {
  const normalized = normalizeSpeechText(text);
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [
    normalized,
  ];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = sentence.trim();
    if (!next) continue;

    if (next.length > maxLength) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      for (let index = 0; index < next.length; index += maxLength) {
        chunks.push(next.slice(index, index + maxLength).trim());
      }
      continue;
    }

    if (`${current} ${next}`.trim().length > maxLength) {
      chunks.push(current.trim());
      current = next;
    } else {
      current = `${current} ${next}`.trim();
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

function getSupportedVoices(locale: Locale, voices: SpeechSynthesisVoice[]) {
  const voiceFamily = getVoiceFamily(locale);
  const localeVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(voiceFamily),
  );

  const scopedVoices = localeVoices.length > 0 ? localeVoices : voices;

  return [...scopedVoices].sort((a, b) => {
    const scoreVoice = (voice: SpeechSynthesisVoice) => {
      const name = voice.name.toLowerCase();
      let score = 0;

      if (name.includes("natural") || name.includes("neural")) score += 100;
      if (name.includes("premium")) score += 90;
      if (name.includes("google")) score += 80;
      if (name.includes("online")) score += 70;
      if (
        name.includes("samantha") ||
        name.includes("alex") ||
        name.includes("daniel") ||
        name.includes("luciana")
      ) {
        score += 60;
      }
      if (voice.lang === getSpeechLang(locale)) score += 12;
      if (voice.localService) score += 2;

      return score;
    };

    return scoreVoice(b) - scoreVoice(a);
  });
}

function subscribeToSpeechSupport() {
  return () => {};
}

function getSpeechSupportSnapshot() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getServerSpeechSupportSnapshot() {
  return false;
}

function getStoredVoiceURI() {
  try {
    return window.localStorage.getItem(VOICE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredVoiceURI(voiceURI: string) {
  try {
    if (voiceURI) {
      window.localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
    } else {
      window.localStorage.removeItem(VOICE_STORAGE_KEY);
    }
  } catch {
    // Browsers can block localStorage in private or restricted contexts.
  }
}

export function PostAudioPlayer({
  locale,
  text,
  labels,
  className,
}: PostAudioPlayerProps) {
  const isSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getServerSpeechSupportSnapshot,
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [rate, setRate] = useState(1.2);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [currentChunk, setCurrentChunk] = useState(0);

  const chunks = useMemo(() => chunkSpeechText(text), [text]);
  const chunksRef = useRef(chunks);
  const chunkIndexRef = useRef(0);
  const selectedVoiceURIRef = useRef(selectedVoiceURI);
  const rateRef = useRef(rate);
  const shouldContinueRef = useRef(false);
  const speechRunRef = useRef(0);

  const availableVoices = useMemo(
    () => getSupportedVoices(locale, voices),
    [locale, voices],
  );

  useEffect(() => {
    chunksRef.current = chunks;
    chunkIndexRef.current = 0;
  }, [chunks]);

  useEffect(() => {
    selectedVoiceURIRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      const nextAvailableVoices = getSupportedVoices(locale, nextVoices);

      setVoices(nextVoices);

      if (selectedVoiceURIRef.current || nextAvailableVoices.length === 0) {
        return;
      }

      const savedVoiceURI = getStoredVoiceURI();
      if (
        savedVoiceURI &&
        nextAvailableVoices.some((voice) => voice.voiceURI === savedVoiceURI)
      ) {
        setSelectedVoiceURI(savedVoiceURI);
        return;
      }

      const preferredVoice =
        nextAvailableVoices.find(
          (voice) => voice.lang === getSpeechLang(locale),
        ) ?? nextAvailableVoices[0];

      setSelectedVoiceURI(preferredVoice.voiceURI);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    const timeoutId = window.setTimeout(loadVoices, 150);

    return () => {
      window.clearTimeout(timeoutId);
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [isSupported, locale]);

  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    setStoredVoiceURI(voiceURI);
  };

  const handleRateChange = (nextRate: number) => {
    setRate(nextRate);
    rateRef.current = nextRate;

    if (!isSupported || playbackState !== "playing") return;

    const currentIndex = chunkIndexRef.current;
    shouldContinueRef.current = false;
    speechRunRef.current += 1;
    window.speechSynthesis.cancel();
    shouldContinueRef.current = true;
    speakChunk(currentIndex);
  };

  function speakChunk(index: number) {
    if (!isSupported) return;

    const chunk = chunksRef.current[index];
    if (!chunk) {
      shouldContinueRef.current = false;
      chunkIndexRef.current = 0;
      setCurrentChunk(0);
      setPlaybackState("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    const speechRun = speechRunRef.current;
    utterance.lang = getSpeechLang(locale);
    utterance.rate = rateRef.current;
    utterance.voice =
      window.speechSynthesis
        .getVoices()
        .find((voice) => voice.voiceURI === selectedVoiceURIRef.current) ??
      null;

    chunkIndexRef.current = index;
    setCurrentChunk(index + 1);
    setPlaybackState("playing");

    utterance.onend = () => {
      if (!shouldContinueRef.current || speechRun !== speechRunRef.current) {
        return;
      }
      speakChunk(index + 1);
    };

    utterance.onerror = () => {
      if (speechRun !== speechRunRef.current) return;
      shouldContinueRef.current = false;
      setPlaybackState("idle");
    };

    window.speechSynthesis.speak(utterance);
  }

  const handlePlay = () => {
    if (!isSupported || chunks.length === 0) return;

    if (playbackState === "paused") {
      shouldContinueRef.current = true;
      window.speechSynthesis.resume();
      setPlaybackState("playing");
      return;
    }

    window.speechSynthesis.cancel();
    shouldContinueRef.current = true;
    speechRunRef.current += 1;
    speakChunk(0);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setPlaybackState("paused");
  };

  const handleStop = () => {
    if (!isSupported) return;
    shouldContinueRef.current = false;
    speechRunRef.current += 1;
    window.speechSynthesis.cancel();
    chunkIndexRef.current = 0;
    setCurrentChunk(0);
    setPlaybackState("idle");
  };

  const progressLabel =
    playbackState === "idle" || chunks.length === 0
      ? labels.description
      : labels.progress
          .replace("{current}", String(currentChunk))
          .replace("{total}", String(chunks.length));

  if (!isSupported) {
    return (
      <aside
        className={cn(
          "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        {labels.unsupported}
      </aside>
    );
  }

  return (
    <aside
      aria-label={labels.title}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.035] p-4 backdrop-blur-md md:p-5",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(420px 180px at 0% 0%, rgba(34,211,238,0.10), transparent 62%), radial-gradient(360px 160px at 100% 100%, rgba(217,70,239,0.08), transparent 62%)",
        }}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <Volume2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              {labels.title}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {progressLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <label className="grid gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {labels.voiceLabel}
            </span>
            <select
              value={selectedVoiceURI}
              onChange={(event) => handleVoiceChange(event.target.value)}
              className="h-10 rounded-lg border border-white/[0.08] bg-background/70 px-3 font-mono text-[12px] text-foreground outline-none transition-colors hover:border-cyan-300/30 focus:border-cyan-300/40"
            >
              {availableVoices.length === 0 ? (
                <option value="">{labels.noVoices}</option>
              ) : (
                <>
                  <option value="">{labels.voiceDefault}</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} · {voice.lang}
                    </option>
                  ))}
                </>
              )}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {labels.rateLabel}: {rate.toFixed(1)}x
            </span>
            <input
              type="range"
              min="0.7"
              max="2"
              step="0.1"
              value={rate}
              onChange={(event) => handleRateChange(Number(event.target.value))}
              className="h-10 accent-cyan-300"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePlay}
            disabled={chunks.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-cyan-100 transition-all hover:border-cyan-300/50 hover:bg-cyan-300/15 disabled:pointer-events-none disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {playbackState === "paused" ? labels.resume : labels.play}
          </button>

          <button
            type="button"
            onClick={handlePause}
            disabled={playbackState !== "playing"}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground transition-all hover:border-cyan-300/30 hover:text-cyan-200 disabled:pointer-events-none disabled:opacity-45"
          >
            <Pause className="h-3.5 w-3.5" />
            {labels.pause}
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={playbackState === "idle"}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground transition-all hover:border-cyan-300/30 hover:text-cyan-200 disabled:pointer-events-none disabled:opacity-45"
          >
            <Square className="h-3.5 w-3.5" />
            {labels.stop}
          </button>
        </div>
      </div>
    </aside>
  );
}
