import React, { useRef } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  Palette,
  Flame,
} from 'lucide-react';
import { ComicStory } from '../types/comic';
import { PRESET_COMICS } from '../utils/presetComics';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedComics: ComicStory[];
  currentComicId?: string;
  onSelectComic: (comic: ComicStory) => void;
  onDeleteComic: (comicId: string) => void;
  onImportComic: (comic: ComicStory) => void;
  onOpenCreate: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedComics,
  currentComicId,
  onSelectComic,
  onDeleteComic,
  onImportComic,
  onOpenCreate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = (comic: ComicStory) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(comic, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${comic.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_comic.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && Array.isArray(parsed.panels)) {
          onImportComic(parsed);
        } else {
          alert('Invalid comic project JSON file.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const allComics = [...savedComics];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-neutral-900 border-2 border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-black rounded-lg comic-border">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-comic-display text-2xl text-white tracking-wide uppercase">
                Comic Library & Presets
              </h3>
              <p className="text-xs text-neutral-400">
                Switch between your generated comics or explore curated sample graphic novels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
              title="Import Comic JSON"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* User's Created Comics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Your Generated Comics ({savedComics.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreate();
                }}
                className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg comic-border transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New</span>
              </button>
            </div>

            {savedComics.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/60 rounded-xl border border-neutral-800">
                <p className="text-sm text-neutral-400">
                  You haven't generated any custom comics yet.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreate();
                  }}
                  className="mt-3 px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg comic-border"
                >
                  Create Your First Comic
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedComics.map((comic) => (
                  <div
                    key={comic.id}
                    className={`p-4 bg-neutral-950 rounded-xl border transition-all ${
                      currentComicId === comic.id
                        ? 'border-amber-500 ring-2 ring-amber-500/40 bg-neutral-900'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded uppercase">
                            Issue #{comic.issue_number || 1}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {comic.panels.length} Panels
                          </span>
                        </div>
                        <h5 className="font-comic-display text-lg text-white tracking-wide uppercase line-clamp-1">
                          {comic.title}
                        </h5>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                          {comic.logline}
                        </p>
                      </div>

                      {comic.panels[0]?.image_url && (
                        <img
                          src={comic.panels[0].image_url}
                          alt={comic.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover border border-neutral-700 shrink-0"
                        />
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <span>{comic.art_style}</span>
                        <span>•</span>
                        <span>{comic.tone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExportJSON(comic)}
                          className="p-1 text-neutral-400 hover:text-white"
                          title="Export JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteComic(comic.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Delete Comic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onSelectComic(comic);
                            onClose();
                          }}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-md"
                        >
                          {currentComicId === comic.id ? 'Viewing' : 'Open'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curated Sample Comic Books */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Curated Sample Comic Books
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_COMICS.map((sample) => (
                <div
                  key={sample.id}
                  className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-sky-500 text-black text-[10px] font-black rounded uppercase">
                          PRESET
                        </span>
                        <span className="text-xs text-neutral-400">
                          {sample.panels.length} Panels
                        </span>
                      </div>
                      <h5 className="font-comic-display text-lg text-white tracking-wide uppercase line-clamp-1">
                        {sample.title}
                      </h5>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                        {sample.logline}
                      </p>
                    </div>

                    {sample.panels[0]?.image_url && (
                      <img
                        src={sample.panels[0].image_url}
                        alt={sample.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-neutral-700 shrink-0"
                      />
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span>{sample.art_style}</span>
                      <span>•</span>
                      <span>{sample.tone}</span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectComic(sample);
                        onClose();
                      }}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold rounded-md border border-neutral-700"
                    >
                      Load Sample
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
