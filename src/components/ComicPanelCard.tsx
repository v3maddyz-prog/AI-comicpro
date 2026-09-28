import React, { useState } from 'react';
import {
  Edit3,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Zap,
  Maximize2,
  Trash2,
  Volume2,
} from 'lucide-react';
import { ComicPanel, BubblePosition, BubbleType, SoundFXItem } from '../types/comic';

interface ComicPanelCardProps {
  panel: ComicPanel;
  panelIndex: number;
  totalPanels: number;
  artStyle: string;
  onEditPanel: (panel: ComicPanel) => void;
  onRegenerateImage: (panel: ComicPanel) => void;
  onAddSoundFX?: (panelNumber: number, fx: SoundFXItem) => void;
  onRemoveSoundFX?: (panelNumber: number, fxId: string) => void;
}

const COMMON_SFX = ['POW!', 'BAM!', 'KRASH!', 'WHOOSH!', 'ZAP!', 'BOOM!', 'THWIP!'];
const SFX_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export const ComicPanelCard: React.FC<ComicPanelCardProps> = ({
  panel,
  panelIndex,
  artStyle,
  onEditPanel,
  onRegenerateImage,
  onAddSoundFX,
  onRemoveSoundFX,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showSfxMenu, setShowSfxMenu] = useState(false);

  // Position helper for speech bubbles inside the panel
  const getBubbleStyle = (position?: BubblePosition) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4 max-w-[70%] bubble-tail-bottom-left';
      case 'top-right':
        return 'top-4 right-4 max-w-[70%] bubble-tail-bottom-right';
      case 'bottom-left':
        return 'bottom-4 left-4 max-w-[70%]';
      case 'bottom-right':
        return 'bottom-4 right-4 max-w-[70%]';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[80%]';
    }
  };

  const getBubbleBorder = (type?: BubbleType) => {
    if (type === 'shout') {
      return 'border-2 border-red-600 bg-yellow-50 text-red-950 font-bold uppercase';
    }
    if (type === 'thought') {
      return 'border-2 border-neutral-700 bg-white text-neutral-900 rounded-2xl italic';
    }
    if (type === 'whisper') {
      return 'border-2 border-dashed border-neutral-600 bg-white/95 text-neutral-800 text-xs';
    }
    return 'border-2 border-black bg-white text-black rounded-xl';
  };

  const handleQuickAddSfx = (text: string) => {
    if (onAddSoundFX) {
      const newFx: SoundFXItem = {
        id: `sfx-${Date.now()}`,
        text,
        xPercent: 30 + Math.random() * 40,
        yPercent: 30 + Math.random() * 40,
        rotation: (Math.random() - 0.5) * 30,
        color: SFX_COLORS[Math.floor(Math.random() * SFX_COLORS.length)],
        scale: 1.1,
      };
      onAddSoundFX(panel.panel_number, newFx);
    }
    setShowSfxMenu(false);
  };

  return (
    <div className="relative group bg-neutral-900 rounded-xl overflow-hidden comic-border comic-shadow-lg transition-transform hover:-translate-y-0.5">
      {/* Panel Top Title Bar */}
      <div className="bg-black px-3 py-1.5 flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded uppercase tracking-wider">
            #{panel.panel_number}
          </span>
          <span className="font-comic-display text-sm text-neutral-100 tracking-wide uppercase line-clamp-1">
            {panel.title}
          </span>
        </div>

        {/* Panel Hover Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Quick Sound FX button */}
          <div className="relative">
            <button
              onClick={() => setShowSfxMenu(!showSfxMenu)}
              className="p-1 rounded bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 transition-colors"
              title="Add Sound FX Sticker"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
            {showSfxMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 p-2 bg-neutral-950 border border-neutral-700 rounded-lg shadow-xl flex flex-wrap gap-1 w-44">
                <div className="text-[10px] font-bold text-neutral-400 w-full mb-1">Add Sound FX</div>
                {COMMON_SFX.map((sfx) => (
                  <button
                    key={sfx}
                    onClick={() => handleQuickAddSfx(sfx)}
                    className="px-2 py-0.5 text-[11px] font-comic-display bg-amber-500 text-black rounded hover:scale-105 transition-transform"
                  >
                    {sfx}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Regenerate image */}
          <button
            onClick={() => onRegenerateImage(panel)}
            disabled={panel.is_generating_image}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
            title="Regenerate Panel Illustration"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${panel.is_generating_image ? 'animate-spin text-amber-400' : ''}`}
            />
          </button>

          {/* Edit Panel Script */}
          <button
            onClick={() => onEditPanel(panel)}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Edit Panel Script & Dialogue"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comic Illustration Canvas Area */}
      <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
        {/* Loading overlay if regenerating */}
        {panel.is_generating_image && (
          <div className="absolute inset-0 z-20 bg-black/75 flex flex-col items-center justify-center gap-2 backdrop-blur-xs">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="font-comic-display text-sm tracking-wider text-amber-300">
              Drawing Panel #{panel.panel_number}...
            </span>
          </div>
        )}

        {/* Panel Image */}
        {panel.image_url && !imageError ? (
          <img
            src={panel.image_url}
            alt={panel.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          /* Styled Fallback Vector Artwork */
          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-amber-500/20 halftone-dark">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <h4 className="font-comic-display text-lg text-white mb-1 tracking-wide">
              {panel.title}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-3 max-w-xs">
              {panel.scene_description}
            </p>
            <button
              onClick={() => onRegenerateImage(panel)}
              className="mt-3 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg comic-border"
            >
              Generate Illustration
            </button>
          </div>
        )}

        {/* Narration Box (Classic comic top/bottom yellow banner) */}
        {panel.narration && (
          <div className="absolute top-2 left-2 right-2 z-10">
            <div className="bg-amber-100 text-black px-3 py-1.5 rounded-md comic-border shadow-md">
              <p className="font-comic-body text-xs font-bold italic leading-tight text-neutral-900">
                {panel.narration}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Character Speech Bubbles */}
        {panel.dialogue && panel.dialogue.length > 0 && (
          <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-end gap-2 z-15">
            {panel.dialogue.map((item, dIdx) => (
              <div
                key={dIdx}
                className={`pointer-events-auto self-start max-w-[85%] px-3 py-1.5 shadow-lg ${getBubbleBorder(
                  item.type
                )}`}
              >
                <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                  {item.character}
                </div>
                <div className="font-comic-body text-xs font-bold leading-snug">
                  "{item.text}"
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sound FX Stickers Overlay */}
        {panel.sound_effects &&
          panel.sound_effects.map((sfx) => (
            <div
              key={sfx.id}
              className="absolute z-20 group/sfx select-none cursor-pointer"
              style={{
                left: `${sfx.xPercent}%`,
                top: `${sfx.yPercent}%`,
                transform: `translate(-50%, -50%) rotate(${sfx.rotation}deg) scale(${sfx.scale})`,
              }}
              title="Click to remove SFX"
              onClick={() => onRemoveSoundFX?.(panel.panel_number, sfx.id)}
            >
              <span
                className="font-comic-display text-2xl sm:text-3xl font-black drop-shadow-[2px_2px_0px_#000] tracking-wider"
                style={{
                  color: sfx.color,
                  WebkitTextStroke: '1.5px black',
                }}
              >
                {sfx.text}
              </span>
            </div>
          ))}
      </div>

      {/* Panel Bottom Meta */}
      <div className="bg-neutral-950 p-2.5 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
        <span className="line-clamp-1 italic">
          "{panel.scene_description.slice(0, 70)}..."
        </span>
        <button
          onClick={() => onEditPanel(panel)}
          className="text-amber-400 hover:text-amber-300 font-semibold shrink-0 ml-2"
        >
          Edit Panel
        </button>
      </div>
    </div>
  );
};
