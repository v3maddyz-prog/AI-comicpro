import React from 'react';
import { BookOpen, Download, PlusCircle, Sparkles, Library, Maximize2, Columns, Rows } from 'lucide-react';
import { ComicStory } from '../types/comic';

interface NavbarProps {
  currentComic: ComicStory | null;
  onOpenCreateModal: () => void;
  onOpenLibraryModal: () => void;
  onOpenReaderModal: () => void;
  onDownloadPDF: () => void;
  isDownloadingPdf: boolean;
  layoutMode: 'grid' | 'strip';
  onChangeLayoutMode: (mode: 'grid' | 'strip') => void;
  savedComicsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentComic,
  onOpenCreateModal,
  onOpenLibraryModal,
  onOpenReaderModal,
  onDownloadPDF,
  isDownloadingPdf,
  layoutMode,
  onChangeLayoutMode,
  savedComicsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b-2 border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-amber-500 rounded-lg comic-border flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
              <span className="font-comic-display text-2xl text-black">CC</span>
            </div>
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] font-bold bg-red-600 text-white rounded uppercase tracking-wider comic-border">
              AI
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-comic-display text-2xl tracking-wider text-white">
                COMICCRAFT
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              AI Comic Book & Graphic Novel Creator
            </p>
          </div>
        </div>

        {/* Center: Layout controls if comic is loaded */}
        {currentComic && (
          <div className="hidden md:flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => onChangeLayoutMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Classic Comic Page Grid"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => onChangeLayoutMode('strip')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                layoutMode === 'strip'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Vertical Webtoon Strip"
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Webtoon View</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Library Button */}
          <button
            onClick={onOpenLibraryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
            title="Browse Presets & Saved Comics"
          >
            <Library className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Comics</span>
            {savedComicsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-black font-bold rounded-full">
                {savedComicsCount}
              </span>
            )}
          </button>

          {/* Reader Mode (if comic available) */}
          {currentComic && (
            <button
              onClick={onOpenReaderModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
              title="Fullscreen Comic Reader"
            >
              <Maximize2 className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Read Fullscreen</span>
            </button>
          )}

          {/* Download PDF (if comic available) */}
          {currentComic && (
            <button
              onClick={onDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg comic-border transition-transform active:scale-95 shadow-sm"
              title="Export Printable Comic Book PDF"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          )}

          {/* Create New Comic button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-lg comic-border transition-transform active:scale-95 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Comic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
