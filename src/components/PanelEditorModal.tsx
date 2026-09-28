import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Zap,
  AlignLeft,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ComicPanel,
  BubblePosition,
  BubbleType,
  DialogueItem,
  SoundFXItem,
} from '../types/comic';

interface PanelEditorModalProps {
  panel: ComicPanel | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPanel: ComicPanel) => void;
  onRegenerateImage: (panel: ComicPanel, customPrompt?: string) => void;
}

const SFX_PRESETS = ['POW!', 'BAM!', 'KRASH!', 'WHOOSH!', 'ZAP!', 'BOOM!', 'THWIP!', 'SWOOSH!', 'WHAM!'];
const SFX_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];

export const PanelEditorModal: React.FC<PanelEditorModalProps> = ({
  panel,
  isOpen,
  onClose,
  onSave,
  onRegenerateImage,
}) => {
  if (!isOpen || !panel) return null;

  const [title, setTitle] = useState(panel.title);
  const [narration, setNarration] = useState(panel.narration);
  const [sceneDescription, setSceneDescription] = useState(panel.scene_description);
  const [imagePrompt, setImagePrompt] = useState(panel.image_prompt);
  const [dialogues, setDialogues] = useState<DialogueItem[]>(
    panel.dialogue ? [...panel.dialogue] : []
  );
  const [soundEffects, setSoundEffects] = useState<SoundFXItem[]>(
    panel.sound_effects ? [...panel.sound_effects] : []
  );

  const handleAddDialogue = () => {
    setDialogues([
      ...dialogues,
      {
        character: 'Hero',
        text: 'New dialogue line...',
        position: 'top-left',
        type: 'speech',
      },
    ]);
  };

  const handleRemoveDialogue = (idx: number) => {
    setDialogues(dialogues.filter((_, i) => i !== idx));
  };

  const handleDialogueChange = (idx: number, field: keyof DialogueItem, value: any) => {
    const updated = [...dialogues];
    updated[idx] = { ...updated[idx], [field]: value };
    setDialogues(updated);
  };

  const handleAddSfx = (text: string) => {
    const newSfx: SoundFXItem = {
      id: `sfx-${Date.now()}`,
      text,
      xPercent: 30 + Math.random() * 40,
      yPercent: 30 + Math.random() * 40,
      rotation: (Math.random() - 0.5) * 30,
      color: SFX_COLORS[Math.floor(Math.random() * SFX_COLORS.length)],
      scale: 1.1,
    };
    setSoundEffects([...soundEffects, newSfx]);
  };

  const handleRemoveSfx = (id: string) => {
    setSoundEffects(soundEffects.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    onSave({
      ...panel,
      title: title.trim(),
      narration: narration.trim(),
      scene_description: sceneDescription.trim(),
      image_prompt: imagePrompt.trim(),
      dialogue: dialogues,
      sound_effects: soundEffects,
    });
    onClose();
  };

  const handleTriggerRegen = () => {
    onRegenerateImage(
      {
        ...panel,
        image_prompt: imagePrompt.trim(),
      },
      imagePrompt.trim()
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-neutral-950 px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-black rounded uppercase">
              Panel #{panel.panel_number}
            </span>
            <h3 className="font-comic-display text-xl text-white tracking-wide uppercase">
              Edit Panel Script & Art
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Panel Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Panel Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Narration Box Text */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-amber-400" />
              Narration Caption (Yellow Comic Box)
            </label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. As the acid rain drummed against the skylight, Kai felt the chill of impending doom..."
              rows={2}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-amber-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 italic"
            />
          </div>

          {/* Dialogue Speech Bubbles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Character Speech Bubbles ({dialogues.length})
              </label>
              <button
                type="button"
                onClick={handleAddDialogue}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg comic-border"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Speech</span>
              </button>
            </div>

            {dialogues.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.character}
                    onChange={(e) => handleDialogueChange(idx, 'character', e.target.value)}
                    placeholder="Character Name"
                    className="w-1/3 px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-amber-400 font-bold"
                  />
                  <select
                    value={item.type || 'speech'}
                    onChange={(e) =>
                      handleDialogueChange(idx, 'type', e.target.value as BubbleType)
                    }
                    className="w-1/3 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200"
                  >
                    <option value="speech">Normal Speech</option>
                    <option value="shout">Shout / Scream</option>
                    <option value="thought">Thought Bubble</option>
                    <option value="whisper">Whisper</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveDialogue(idx)}
                    className="p-1 rounded text-red-400 hover:bg-red-500/20 ml-auto"
                    title="Remove Speech Bubble"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleDialogueChange(idx, 'text', e.target.value)}
                  placeholder="Dialogue text..."
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                />
              </div>
            ))}
          </div>

          {/* Sound FX Stickers */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Add Comic Sound Effects
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SFX_PRESETS.map((sfx) => (
                <button
                  key={sfx}
                  type="button"
                  onClick={() => handleAddSfx(sfx)}
                  className="px-2.5 py-1 text-xs font-comic-display bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 rounded-md border border-neutral-700 transition-colors"
                >
                  +{sfx}
                </button>
              ))}
            </div>
            {soundEffects.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {soundEffects.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 text-xs text-neutral-200 border border-neutral-700"
                  >
                    <span className="font-comic-display text-amber-400">{s.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSfx(s.id)}
                      className="text-neutral-400 hover:text-red-400 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Prompt & Scene Description */}
          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Stable Diffusion Image Prompt
                </span>
                <button
                  type="button"
                  onClick={handleTriggerRegen}
                  disabled={panel.is_generating_image}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${panel.is_generating_image ? 'animate-spin' : ''}`}
                  />
                  <span>Redraw Image Now</span>
                </button>
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Visual Scene Breakdown / Direction
              </label>
              <input
                type="text"
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-300"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 px-5 py-3 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl comic-border transition-transform active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
