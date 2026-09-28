import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { ComicStory } from '../types/comic';

interface ComicReaderModalProps {
  comic: ComicStory | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
}

export const ComicReaderModal: React.FC<ComicReaderModalProps> = ({
  comic,
  isOpen,
  onClose,
  onDownloadPDF,
}) => {
  if (!isOpen || !comic) return null;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const panels = comic.panels;
  const currentPanel = panels[currentIdx];

  // Synthesize a comic transition sound using Web Audio API
  const playPageSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  };

  const handleNext = () => {
    if (currentIdx < panels.length - 1) {
      playPageSound();
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      playPageSound();
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIdx, panels.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between text-white select-none">
      {/* Top Bar */}
      <div className="h-16 px-4 sm:px-8 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-comic-display text-xl sm:text-2xl text-amber-400 tracking-wider uppercase">
            {comic.title}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-neutral-800 text-neutral-300 rounded border border-neutral-700">
            ISSUE #{comic.issue_number || 1}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="text-xs sm:text-sm font-bold text-neutral-300">
          Panel <span className="text-amber-400">{currentIdx + 1}</span> of {panels.length}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700'
            }`}
            title={soundEnabled ? 'Turn Sound FX Off' : 'Turn Sound FX On'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Download PDF button */}
          <button
            onClick={onDownloadPDF}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg comic-border"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center font-bold text-neutral-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Panel Cinematic Viewer */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Navigation Arrow Left */}
        {currentIdx > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-30 w-12 h-12 rounded-full bg-black/70 hover:bg-amber-500 hover:text-black text-white border-2 border-neutral-700 flex items-center justify-center transition-all shadow-xl backdrop-blur-xs"
            title="Previous Panel (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navigation Arrow Right */}
        {currentIdx < panels.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-30 w-12 h-12 rounded-full bg-black/70 hover:bg-amber-500 hover:text-black text-white border-2 border-neutral-700 flex items-center justify-center transition-all shadow-xl backdrop-blur-xs"
            title="Next Panel (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Panel Container */}
        <div className="relative w-full max-w-2xl max-h-[75vh] aspect-square bg-neutral-900 rounded-2xl comic-border-thick comic-shadow-lg overflow-hidden flex flex-col justify-between">
          {/* Panel Header */}
          <div className="bg-black/90 px-4 py-2 border-b-2 border-black flex items-center justify-between z-10">
            <span className="font-comic-display text-base sm:text-lg text-amber-400 tracking-wide uppercase">
              #{currentPanel.panel_number}: {currentPanel.title}
            </span>
            <span className="text-[11px] text-neutral-400 italic">
              {comic.art_style} • {comic.tone}
            </span>
          </div>

          {/* Canvas Illustration */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
            {currentPanel.image_url ? (
              <img
                src={currentPanel.image_url}
                alt={currentPanel.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-8 text-center text-neutral-400">
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <h4 className="font-comic-display text-xl text-white">
                  {currentPanel.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-2 max-w-sm">
                  {currentPanel.scene_description}
                </p>
              </div>
            )}

            {/* Narration Box */}
            {currentPanel.narration && (
              <div className="absolute top-3 left-3 right-3 z-15">
                <div className="bg-amber-100 text-black px-4 py-2 rounded-lg comic-border shadow-md">
                  <p className="font-comic-body text-xs sm:text-sm font-bold italic leading-tight text-neutral-900">
                    {currentPanel.narration}
                  </p>
                </div>
              </div>
            )}

            {/* Speech Bubbles */}
            {currentPanel.dialogue && currentPanel.dialogue.length > 0 && (
              <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2.5 z-20 pointer-events-none">
                {currentPanel.dialogue.map((d, dIdx) => (
                  <div
                    key={dIdx}
                    className="self-start max-w-[80%] bg-white text-black px-4 py-2 rounded-xl comic-border shadow-lg"
                  >
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                      {d.character}
                    </span>
                    <span className="font-comic-body text-xs sm:text-sm font-bold leading-snug">
                      "{d.text}"
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sound FX Stickers */}
            {currentPanel.sound_effects &&
              currentPanel.sound_effects.map((sfx) => (
                <div
                  key={sfx.id}
                  className="absolute z-25 pointer-events-none"
                  style={{
                    left: `${sfx.xPercent}%`,
                    top: `${sfx.yPercent}%`,
                    transform: `translate(-50%, -50%) rotate(${sfx.rotation}deg) scale(${sfx.scale})`,
                  }}
                >
                  <span
                    className="font-comic-display text-3xl sm:text-4xl font-black drop-shadow-[3px_3px_0px_#000]"
                    style={{
                      color: sfx.color,
                      WebkitTextStroke: '2px black',
                    }}
                  >
                    {sfx.text}
                  </span>
                </div>
              ))}
          </div>

          {/* Panel Direction Caption */}
          <div className="bg-neutral-950 px-4 py-2 border-t border-neutral-800 text-[11px] text-neutral-400 text-center">
            {currentPanel.scene_description}
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="h-20 bg-neutral-950 px-4 sm:px-8 border-t border-neutral-800 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {panels.map((p, idx) => (
            <button
              key={p.panel_number}
              onClick={() => {
                playPageSound();
                setCurrentIdx(idx);
              }}
              className={`relative h-12 w-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                currentIdx === idx
                  ? 'border-amber-500 scale-105 ring-2 ring-amber-500/50'
                  : 'border-neutral-800 opacity-60 hover:opacity-100'
              }`}
            >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                  #{p.panel_number}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Shortcuts guide */}
        <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500">
          <span>Use</span>
          <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300">
            →
          </kbd>
          <span>or Spacebar to turn pages</span>
        </div>
      </div>
    </div>
  );
};
