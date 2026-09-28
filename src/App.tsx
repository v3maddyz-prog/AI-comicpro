/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { ComicCreatorForm } from './components/ComicCreatorForm';
import { ComicViewer } from './components/ComicViewer';
import { ComicReaderModal } from './components/ComicReaderModal';
import { PanelEditorModal } from './components/PanelEditorModal';
import { GalleryModal } from './components/GalleryModal';
import { GenerationProgressModal } from './components/GenerationProgressModal';
import {
  ComicStory,
  ComicPanel,
  StoryGenerationRequest,
  SoundFXItem,
} from './types/comic';
import { PRESET_COMICS } from './utils/presetComics';
import { generateComicPDF } from './utils/pdfGenerator';

const STORAGE_KEY = 'comiccraft_saved_comics_v1';

export default function App() {
  // State
  const [currentComic, setCurrentComic] = useState<ComicStory | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }
    return PRESET_COMICS[0];
  });

  const [savedComics, setSavedComics] = useState<ComicStory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from local storage:', e);
    }
    return [...PRESET_COMICS];
  });

  // Modal visibility
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<ComicPanel | null>(null);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'story' | 'images' | 'finalizing'>('story');
  const [currentPanelGenIdx, setCurrentPanelGenIdx] = useState(1);
  const [totalPanelsToGen, setTotalPanelsToGen] = useState(4);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // PDF download
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'strip'>('grid');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync saved comics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedComics));
    } catch (e) {
      console.warn('Failed to save to local storage:', e);
    }
  }, [savedComics]);

  // Handle Comic Generation Workflow (Steps 1, 2, 3)
  const handleGenerateComic = async (request: StoryGenerationRequest) => {
    setIsCreateOpen(false);
    setIsGenerating(true);
    setGenerationStep('story');
    setGenerationError(null);
    setCurrentPanelGenIdx(1);
    setTotalPanelsToGen(request.panel_count || 4);

    try {
      // Step 2: Generate Story & Script with Google Gemini
      const storyRes = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!storyRes.ok) {
        const errData = await storyRes.json().catch(() => ({}));
        throw new Error(errData.error || `Story generation failed with status ${storyRes.status}`);
      }

      const storyData = await storyRes.json();
      const generatedComic: ComicStory = {
        id: `comic-${Date.now()}`,
        title: storyData.comic.title || 'UNTITLED CHRONICLES',
        logline: storyData.comic.logline || request.story_prompt,
        characters: storyData.comic.characters || [
          { name: request.character_name, description: request.character_description || '' },
        ],
        panels: storyData.comic.panels || [],
        art_style: request.art_style,
        tone: request.tone,
        setting: request.setting,
        created_at: new Date().toISOString(),
        author: 'ComicCraft Studio',
        issue_number: Math.floor(Math.random() * 99) + 1,
      };

      // Step 3: Generate Comic-Style Illustrations for each panel
      setGenerationStep('images');
      const updatedPanels = [...generatedComic.panels];

      for (let i = 0; i < updatedPanels.length; i++) {
        setCurrentPanelGenIdx(i + 1);
        const panel = updatedPanels[i];

        try {
          const imgRes = await fetch('/api/generate-panel-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              panel_number: panel.panel_number,
              image_prompt: panel.image_prompt,
              art_style: request.art_style,
              tone: request.tone,
              character_name: request.character_name,
              character_description: request.character_description,
              setting: request.setting,
              negative_prompt: request.negative_prompt,
              seed: Math.floor(Math.random() * 999999),
            }),
          });

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            updatedPanels[i] = {
              ...panel,
              image_url: imgData.image_url,
            };
          }
        } catch (imgErr) {
          console.warn(`Panel ${i + 1} image generation issue:`, imgErr);
        }
      }

      generatedComic.panels = updatedPanels;

      // Step 4: Finalize & Display
      setGenerationStep('finalizing');
      await new Promise((r) => setTimeout(r, 600));

      setCurrentComic(generatedComic);
      setSavedComics((prev) => [generatedComic, ...prev]);
      setIsGenerating(false);

      // Celebrate
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`🎉 "${generatedComic.title}" successfully created!`);
    } catch (err: any) {
      console.error('Comic generation error:', err);
      setGenerationError(err.message || 'An error occurred during generation.');
    }
  };

  // Regenerate single panel image
  const handleRegeneratePanelImage = async (panel: ComicPanel, customPrompt?: string) => {
    if (!currentComic) return;

    // Mark as generating
    const targetIdx = currentComic.panels.findIndex((p) => p.panel_number === panel.panel_number);
    if (targetIdx === -1) return;

    const newPanels = [...currentComic.panels];
    newPanels[targetIdx] = { ...newPanels[targetIdx], is_generating_image: true };
    setCurrentComic({ ...currentComic, panels: newPanels });

    try {
      const res = await fetch('/api/generate-panel-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panel_number: panel.panel_number,
          image_prompt: customPrompt || panel.image_prompt,
          art_style: currentComic.art_style,
          tone: currentComic.tone,
          character_name: currentComic.characters[0]?.name || 'Hero',
          character_description: currentComic.characters[0]?.description || '',
          setting: currentComic.setting,
          seed: Math.floor(Math.random() * 9999999),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        newPanels[targetIdx] = {
          ...newPanels[targetIdx],
          image_url: data.image_url,
          is_generating_image: false,
        };
        const updatedComic = { ...currentComic, panels: newPanels };
        setCurrentComic(updatedComic);
        setSavedComics((prev) =>
          prev.map((c) => (c.id === updatedComic.id ? updatedComic : c))
        );
        showToast(`Panel #${panel.panel_number} illustration updated!`);
      } else {
        newPanels[targetIdx] = { ...newPanels[targetIdx], is_generating_image: false };
        setCurrentComic({ ...currentComic, panels: newPanels });
      }
    } catch (e) {
      console.error('Error regenerating panel image:', e);
      newPanels[targetIdx] = { ...newPanels[targetIdx], is_generating_image: false };
      setCurrentComic({ ...currentComic, panels: newPanels });
    }
  };

  // Regenerate all panel images
  const handleRegenerateAllImages = async () => {
    if (!currentComic) return;
    for (const panel of currentComic.panels) {
      await handleRegeneratePanelImage(panel);
    }
    showToast('All comic panels redrawn with fresh seeds!');
  };

  // Save edited panel
  const handleSavePanel = (updatedPanel: ComicPanel) => {
    if (!currentComic) return;
    const newPanels = currentComic.panels.map((p) =>
      p.panel_number === updatedPanel.panel_number ? updatedPanel : p
    );
    const updated = { ...currentComic, panels: newPanels };
    setCurrentComic(updated);
    setSavedComics((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Panel #${updatedPanel.panel_number} saved.`);
  };

  // Add / remove sound FX stickers
  const handleAddSoundFX = (panelNumber: number, fx: SoundFXItem) => {
    if (!currentComic) return;
    const newPanels = currentComic.panels.map((p) => {
      if (p.panel_number === panelNumber) {
        return {
          ...p,
          sound_effects: [...(p.sound_effects || []), fx],
        };
      }
      return p;
    });
    const updated = { ...currentComic, panels: newPanels };
    setCurrentComic(updated);
    setSavedComics((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleRemoveSoundFX = (panelNumber: number, fxId: string) => {
    if (!currentComic) return;
    const newPanels = currentComic.panels.map((p) => {
      if (p.panel_number === panelNumber) {
        return {
          ...p,
          sound_effects: (p.sound_effects || []).filter((s) => s.id !== fxId),
        };
      }
      return p;
    });
    const updated = { ...currentComic, panels: newPanels };
    setCurrentComic(updated);
    setSavedComics((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!currentComic) return;
    setIsDownloadingPdf(true);
    showToast('Building your printable comic book PDF...');

    try {
      await generateComicPDF(currentComic);
      showToast('Comic PDF download started!');
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Delete comic
  const handleDeleteComic = (comicId: string) => {
    setSavedComics((prev) => prev.filter((c) => c.id !== comicId));
    if (currentComic?.id === comicId) {
      const remaining = savedComics.filter((c) => c.id !== comicId);
      setCurrentComic(remaining[0] || PRESET_COMICS[0]);
    }
    showToast('Comic removed from your library.');
  };

  // Import comic JSON
  const handleImportComic = (imported: ComicStory) => {
    const withId = { ...imported, id: `imported-${Date.now()}` };
    setSavedComics((prev) => [withId, ...prev]);
    setCurrentComic(withId);
    setIsLibraryOpen(false);
    showToast(`Imported "${withId.title}" successfully!`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black px-4 py-2.5 rounded-xl comic-border comic-shadow font-bold text-xs sm:text-sm animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentComic={currentComic}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenLibraryModal={() => setIsLibraryOpen(true)}
        onOpenReaderModal={() => setIsReaderOpen(true)}
        onDownloadPDF={handleDownloadPDF}
        isDownloadingPdf={isDownloadingPdf}
        layoutMode={layoutMode}
        onChangeLayoutMode={setLayoutMode}
        savedComicsCount={savedComics.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentComic ? (
          <ComicViewer
            comic={currentComic}
            layoutMode={layoutMode}
            onEditPanel={(panel) => setEditingPanel(panel)}
            onRegenerateImage={(panel) => handleRegeneratePanelImage(panel)}
            onRegenerateAllImages={handleRegenerateAllImages}
            onDownloadPDF={handleDownloadPDF}
            isDownloadingPdf={isDownloadingPdf}
            onOpenReaderModal={() => setIsReaderOpen(true)}
            onAddSoundFX={handleAddSoundFX}
            onRemoveSoundFX={handleRemoveSoundFX}
          />
        ) : (
          <div className="max-w-md mx-auto text-center py-20 px-4">
            <h2 className="font-comic-display text-3xl text-white">No Comic Loaded</h2>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-6 py-2.5 bg-amber-500 text-black font-bold rounded-xl comic-border"
            >
              Create New Comic
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ComicCreatorForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleGenerateComic}
        isLoading={isGenerating}
      />

      <PanelEditorModal
        panel={editingPanel}
        isOpen={!!editingPanel}
        onClose={() => setEditingPanel(null)}
        onSave={handleSavePanel}
        onRegenerateImage={(panel, customPrompt) =>
          handleRegeneratePanelImage(panel, customPrompt)
        }
      />

      <ComicReaderModal
        comic={currentComic}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        onDownloadPDF={handleDownloadPDF}
      />

      <GalleryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        savedComics={savedComics}
        currentComicId={currentComic?.id}
        onSelectComic={(comic) => setCurrentComic(comic)}
        onDeleteComic={handleDeleteComic}
        onImportComic={handleImportComic}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      <GenerationProgressModal
        isOpen={isGenerating}
        step={generationStep}
        currentPanelIndex={currentPanelGenIdx}
        totalPanels={totalPanelsToGen}
        comicTitle={currentComic?.title}
        error={generationError}
        onRetry={() => setIsGenerating(false)}
        onCancel={() => setIsGenerating(false)}
      />
    </div>
  );
}
