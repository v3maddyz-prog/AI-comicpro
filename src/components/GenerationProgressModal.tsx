import React from 'react';
import { Sparkles, Wand2, Palette, BookOpen, Layers } from 'lucide-react';

interface GenerationProgressModalProps {
  isOpen: boolean;
  step: 'story' | 'images' | 'finalizing';
  currentPanelIndex?: number;
  totalPanels?: number;
  comicTitle?: string;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  isOpen,
  step,
  currentPanelIndex = 1,
  totalPanels = 4,
  comicTitle,
  error,
  onRetry,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-6 sm:p-8 comic-shadow-lg text-center space-y-6">
        {/* Animated Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center transform rotate-6 animate-pulse">
            {step === 'story' && <Wand2 className="w-10 h-10 text-amber-400" />}
            {step === 'images' && <Palette className="w-10 h-10 text-amber-400" />}
            {step === 'finalizing' && <Layers className="w-10 h-10 text-amber-400" />}
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-comic-display text-2xl sm:text-3xl text-white tracking-wide uppercase">
            {error
              ? 'Generation Paused'
              : step === 'story'
              ? 'Drafting Story & Script...'
              : step === 'images'
              ? `Drawing Panel ${currentPanelIndex} of ${totalPanels}...`
              : 'Assembling Graphic Novel...'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : step === 'story' ? (
              'Google Gemini is generating the plot outline, character dialogue, narration boxes, and Stable Diffusion prompts.'
            ) : step === 'images' ? (
              'Rendering high-resolution comic illustrations with consistent art style and character framing.'
            ) : (
              'Positioning speech bubbles, gutter lines, and preparing your printable comic book.'
            )}
          </p>
        </div>

        {/* Progress Bar */}
        {!error && (
          <div className="space-y-2">
            <div className="w-full h-3 bg-neutral-950 rounded-full border border-neutral-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500"
                style={{
                  width:
                    step === 'story'
                      ? '30%'
                      : step === 'images'
                      ? `${30 + ((currentPanelIndex - 1) / (totalPanels || 4)) * 60}%`
                      : '95%',
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <span className={step === 'story' ? 'text-amber-400' : ''}>1. Script</span>
              <span className={step === 'images' ? 'text-amber-400' : ''}>2. Artworks</span>
              <span className={step === 'finalizing' ? 'text-amber-400' : ''}>3. Layout</span>
            </div>
          </div>
        )}

        {/* Footer / Buttons if error */}
        {error && (
          <div className="flex items-center justify-center gap-3 pt-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold"
              >
                Close
              </button>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold comic-border"
              >
                Retry Generation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
