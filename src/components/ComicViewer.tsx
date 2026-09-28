import React from 'react';
import {
  Download,
  Maximize2,
  Plus,
  RefreshCw,
  Sparkles,
  Share2,
  BookOpen,
  User,
  MapPin,
  Flame,
  Palette,
  FileText,
} from 'lucide-react';
import { ComicPanelCard } from './ComicPanelCard';
import { ComicStory, ComicPanel, SoundFXItem } from '../types/comic';

interface ComicViewerProps {
  comic: ComicStory;
  layoutMode: 'grid' | 'strip';
  onEditPanel: (panel: ComicPanel) => void;
  onRegenerateImage: (panel: ComicPanel) => void;
  onRegenerateAllImages: () => void;
  onDownloadPDF: () => void;
  isDownloadingPdf: boolean;
  onOpenReaderModal: () => void;
  onAddSoundFX: (panelNumber: number, fx: SoundFXItem) => void;
  onRemoveSoundFX: (panelNumber: number, fxId: string) => void;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({
  comic,
  layoutMode,
  onEditPanel,
  onRegenerateImage,
  onRegenerateAllImages,
  onDownloadPDF,
  isDownloadingPdf,
  onOpenReaderModal,
  onAddSoundFX,
  onRemoveSoundFX,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Comic Book Header Banner */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 rounded-2xl comic-border comic-shadow-lg p-6 sm:p-8 overflow-hidden">
        {/* Halftone texture background */}
        <div className="absolute inset-0 halftone-dark opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500 text-black rounded uppercase tracking-wider comic-border">
                ISSUE #{comic.issue_number || 1}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-neutral-800 text-neutral-200 rounded border border-neutral-700 flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-400" />
                {comic.art_style}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-neutral-800 text-neutral-200 rounded border border-neutral-700 flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-400" />
                {comic.tone}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-300 rounded border border-neutral-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {comic.setting}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-comic-display text-3xl sm:text-5xl tracking-wider text-white uppercase drop-shadow-md">
              {comic.title}
            </h1>

            {/* Logline Box */}
            <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-700/80">
              <p className="text-xs sm:text-sm text-neutral-300 italic leading-relaxed">
                "{comic.logline}"
              </p>
            </div>

            {/* Characters Lineup */}
            {comic.characters && comic.characters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Cast:
                </span>
                {comic.characters.map((char, cIdx) => (
                  <div
                    key={cIdx}
                    className="px-2.5 py-1 bg-black/60 border border-neutral-800 rounded-lg text-xs"
                    title={char.description}
                  >
                    <span className="font-bold text-amber-400">{char.name}</span>
                    {char.description && (
                      <span className="text-neutral-400 text-[11px] ml-1.5 hidden sm:inline">
                        — {char.description.slice(0, 45)}...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex md:flex-col items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenReaderModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-bold rounded-xl border border-neutral-700 shadow-sm transition-transform active:scale-95"
            >
              <Maximize2 className="w-4 h-4 text-sky-400" />
              <span>Read Fullscreen</span>
            </button>

            <button
              onClick={onDownloadPDF}
              disabled={isDownloadingPdf}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black text-xs sm:text-sm font-extrabold rounded-xl comic-border shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Creating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onRegenerateAllImages}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl border border-neutral-800 transition-colors"
              title="Redraw all panel images with new seeds"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Redraw All Panels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panels Layout Area */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-comic-display text-2xl text-white tracking-wide uppercase">
              Comic Panels ({comic.panels.length})
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              Click edit on any panel to modify dialogue, add sound FX, or regenerate art
            </span>
          </div>
        </div>

        {/* Panel Grid / Strip */}
        <div
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
              : 'flex flex-col gap-8 max-w-2xl mx-auto'
          }
        >
          {comic.panels.map((panel, idx) => (
            <ComicPanelCard
              key={panel.panel_number}
              panel={panel}
              panelIndex={idx}
              totalPanels={comic.panels.length}
              artStyle={comic.art_style}
              onEditPanel={onEditPanel}
              onRegenerateImage={onRegenerateImage}
              onAddSoundFX={onAddSoundFX}
              onRemoveSoundFX={onRemoveSoundFX}
            />
          ))}
        </div>
      </div>

      {/* Comic Page Bottom Shelf */}
      <div className="p-6 bg-neutral-900/60 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>
            Created with ComicCraft AI Studio • All illustrations and scripts are personalized & downloadable.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadPDF}
            className="text-amber-400 hover:text-amber-300 font-bold underline"
          >
            Export Complete PDF Booklet
          </button>
          <span>•</span>
          <button
            onClick={onOpenReaderModal}
            className="text-sky-400 hover:text-sky-300 font-bold underline"
          >
            Open Reader
          </button>
        </div>
      </div>
    </div>
  );
};
