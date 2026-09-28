import React, { useState } from 'react';
import {
  Sparkles,
  User,
  MapPin,
  Palette,
  Layers,
  Wand2,
  AlertCircle,
  HelpCircle,
  Dice5,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ArtStyle, StoryGenerationRequest, Tone } from '../types/comic';

interface ComicCreatorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: StoryGenerationRequest) => void;
  isLoading: boolean;
}

const TONES: { name: Tone; emoji: string; desc: string; color: string }[] = [
  { name: 'Adventure', emoji: '⚔️', desc: 'Thrilling quests & heroics', color: 'border-amber-500 bg-amber-500/10' },
  { name: 'Dramatic', emoji: '🎭', desc: 'High stakes & tension', color: 'border-red-500 bg-red-500/10' },
  { name: 'Funny', emoji: '😂', desc: 'Humorous & chaotic antics', color: 'border-yellow-400 bg-yellow-400/10' },
  { name: 'Mysterious', emoji: '🔍', desc: 'Secrets, twists & clues', color: 'border-purple-500 bg-purple-500/10' },
  { name: 'Emotional', emoji: '💧', desc: 'Heartfelt moments & bonds', color: 'border-blue-400 bg-blue-400/10' },
  { name: 'Dark', emoji: '🌑', desc: 'Shadowy, gritty & intense', color: 'border-zinc-500 bg-zinc-500/10' },
  { name: 'Inspirational', emoji: '✨', desc: 'Triumph against odds', color: 'border-emerald-500 bg-emerald-500/10' },
  { name: 'Light-hearted', emoji: '☀️', desc: 'Warm, fun & cheerful', color: 'border-orange-400 bg-orange-400/10' },
];

const ART_STYLES: { name: ArtStyle; tag: string; desc: string; sampleColor: string }[] = [
  { name: 'Comic book', tag: 'Classic Marvel/DC', desc: 'Bold ink lines, vibrant colors & dynamic halftone shadows', sampleColor: 'from-blue-600 to-red-600' },
  { name: 'Anime', tag: 'Modern Shonen/Ghibli', desc: 'Clean cell-shading, vibrant eyes & dramatic lighting', sampleColor: 'from-pink-500 to-indigo-600' },
  { name: 'Manga', tag: 'Authentic Ink', desc: 'Black & white screentone, intense action hatching & speed lines', sampleColor: 'from-neutral-700 to-neutral-900' },
  { name: 'Noir', tag: 'Sin City Style', desc: 'Gritty chiaroscuro, heavy black ink & moody rain accents', sampleColor: 'from-neutral-900 via-neutral-800 to-amber-900' },
  { name: 'Fantasy illustration', tag: 'Epic Concept Art', desc: 'Luminous magical glows, painterly brushwork & rich armor', sampleColor: 'from-purple-700 to-emerald-600' },
  { name: 'Cartoon', tag: 'Saturday Morning', desc: 'Playful proportions, expressive faces & colorful vector art', sampleColor: 'from-amber-400 to-cyan-500' },
  { name: 'Watercolor', tag: 'Artistic Storybook', desc: 'Soft bleeding washes, delicate contour ink & paper textures', sampleColor: 'from-teal-400 to-rose-400' },
  { name: 'Cinematic concept art', tag: 'Hyper-detailed', desc: 'Volumetric atmosphere, photoreal digital rendering & cinematic depth', sampleColor: 'from-cyan-900 to-indigo-900' },
];

const STORY_IDEAS = [
  {
    title: 'Cyberpunk Sleuth',
    prompt: 'A cyber-detective intercepts an encrypted signal from a rogue sentient AI right before security drones breach the room.',
    name: 'Kai Vance',
    character_desc: 'Wears a holographic trench coat, cybernetic glowing amber eye, messy dark hair.',
    setting: 'Neo-Tokyo rainy skyscraper rooftop under flickering neon signs',
    tone: 'Mysterious' as Tone,
    art_style: 'Noir' as ArtStyle,
  },
  {
    title: 'Dragon Quest',
    prompt: 'An apprentice spellblade ventures into the forbidden crystalline caverns and accidentally wakes a colossal slumbering golden dragon.',
    name: 'Lyra Starling',
    character_desc: 'Young elven warrior with a silver braid, leather riding armor, and an azure rune-inscribed gauntlet.',
    setting: 'The glittering crystal caverns beneath Mount Ignis',
    tone: 'Adventure' as Tone,
    art_style: 'Fantasy illustration' as ArtStyle,
  },
  {
    title: 'Kitchen Chaos',
    prompt: 'A brilliant raccoon chef sneaks into a 3-star Parisian kitchen at 2 AM to bake the ultimate soufflé before the head chef arrives.',
    name: 'Chef Barnaby',
    character_desc: 'A charming fluffy raccoon in a miniature white chef toque and tiny red bandana.',
    setting: 'An immaculate copper-and-marble gourmet French kitchen',
    tone: 'Funny' as Tone,
    art_style: 'Cartoon' as ArtStyle,
  },
  {
    title: 'Chrono Samurai',
    prompt: 'A time-displaced samurai lands in the middle of a neon-lit floating highway in the year 3042 and defends an innocent hover-taxi.',
    name: 'Kenji',
    character_desc: 'Weathered samurai armor reinforced with glowing neon circuits, wielding an energized plasma katana.',
    setting: 'A floating skyway high above a megalopolis cloud layer',
    tone: 'Dramatic' as Tone,
    art_style: 'Anime' as ArtStyle,
  },
];

export const ComicCreatorForm: React.FC<ComicCreatorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [characterDesc, setCharacterDesc] = useState('');
  const [setting, setSetting] = useState('');
  const [tone, setTone] = useState<Tone>('Adventure');
  const [artStyle, setArtStyle] = useState<ArtStyle>('Comic book');
  const [panelCount, setPanelCount] = useState<number>(4);
  const [visualDetails, setVisualDetails] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(
    'blurry, distorted face, extra limbs, malformed hands, low quality, duplicate characters, unreadable text, watermark, logo, cropped image, speech bubble, text'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (idea: typeof STORY_IDEAS[0]) => {
    setStoryPrompt(idea.prompt);
    setCharacterName(idea.name);
    setCharacterDesc(idea.character_desc);
    setSetting(idea.setting);
    setTone(idea.tone);
    setArtStyle(idea.art_style);
    setErrorMsg(null);
  };

  const handleRandomize = () => {
    const random = STORY_IDEAS[Math.floor(Math.random() * STORY_IDEAS.length)];
    handleApplyPreset(random);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyPrompt.trim()) {
      setErrorMsg('Please enter a story prompt or premise.');
      return;
    }
    if (!characterName.trim()) {
      setErrorMsg('Please specify a main character name.');
      return;
    }
    if (!setting.trim()) {
      setErrorMsg('Please specify a story setting or location.');
      return;
    }

    setErrorMsg(null);
    onSubmit({
      story_prompt: storyPrompt.trim(),
      character_name: characterName.trim(),
      character_description: characterDesc.trim(),
      setting: setting.trim(),
      tone,
      art_style: artStyle,
      panel_count: panelCount,
      visual_details: visualDetails.trim(),
      negative_prompt: negativePrompt.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-neutral-900 border-2 border-neutral-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header with comic styling */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-5 sm:p-6 text-black border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black text-amber-400 rounded-xl comic-border">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-comic-display text-2xl sm:text-3xl tracking-wide uppercase">
                  Create New AI Comic
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neutral-900">
                  Step 1: Customize your story script, art style & characters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRandomize}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-black rounded-lg border-2 border-black hover:bg-neutral-100 transition-transform active:scale-95 shadow"
                title="Random Story Idea"
              >
                <Dice5 className="w-4 h-4 text-amber-600" />
                <span>Inspire Me</span>
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-8 h-8 rounded-lg bg-black text-white hover:bg-neutral-800 flex items-center justify-center text-lg font-bold comic-border"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Quick idea chips */}
        <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-neutral-400 whitespace-nowrap font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Ideas:
          </span>
          {STORY_IDEAS.map((idea, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(idea)}
              className="px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 whitespace-nowrap transition-colors"
            >
              {idea.title}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Story Premise */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-1.5">
              1. Story Prompt / Concept <span className="text-red-400">*</span>
            </label>
            <textarea
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              placeholder="e.g. A brave space archeologist finds a mysterious glowing orb inside an abandoned moon base that awakens a forgotten alien power..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm leading-relaxed"
              required
            />
          </div>

          {/* Section 2: Character & Setting Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Character Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Main Character Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. Kai Vance, Maya Sunstrider, Rex"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>

            {/* Setting */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Story Setting / World <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g. Neo-Tokyo cyberpunk alley, Enchanted Whispering Forest"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Character Description for Consistency */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Character Visual Details (For Image Consistency)
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              value={characterDesc}
              onChange={(e) => setCharacterDesc(e.target.value)}
              placeholder="e.g. Amber robotic eye, black trenchcoat with glowing collar, spiky silver hair, tall athletic build"
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Adding clothing colors, hairstyle, or iconic accessories helps the AI keep the character consistent across panels.
            </p>
          </div>

          {/* Section 3: Tone Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Story Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTone(t.name)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tone === t.name
                      ? `${t.color} border-2 shadow-md`
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{t.emoji}</span>
                    <span className="text-xs font-bold text-white">{t.name}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Art Style Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Art Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ART_STYLES.map((style) => (
                <button
                  key={style.name}
                  type="button"
                  onClick={() => setArtStyle(style.name)}
                  className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden ${
                    artStyle === style.name
                      ? 'border-amber-500 bg-neutral-800/90 ring-2 ring-amber-500/50'
                      : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`h-1.5 w-full rounded-full bg-gradient-to-r ${style.sampleColor} mb-2`}
                  />
                  <div className="text-xs font-bold text-white leading-tight">{style.name}</div>
                  <div className="text-[10px] text-amber-400/90 font-medium mt-0.5">{style.tag}</div>
                  <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-snug">
                    {style.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Panels Count */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Number of Comic Panels
            </label>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPanelCount(count)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    panelCount === count
                      ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-sm'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {count} Panels
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Accordion (Negative Prompt & Extra Instructions) */}
          <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 bg-neutral-950/70 flex items-center justify-between text-xs font-semibold text-neutral-400 hover:text-white"
            >
              <span>Advanced Generation Options (Negative Prompts, Visual Tweaks)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-neutral-950 space-y-3 border-t border-neutral-800">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Visual Details & Story Notes
                  </label>
                  <input
                    type="text"
                    value={visualDetails}
                    onChange={(e) => setVisualDetails(e.target.value)}
                    placeholder="e.g. Heavy atmospheric rain, dramatic low angle framing, high contrast lighting"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Negative Prompt (What to Avoid in Artwork)
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-neutral-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-comic-display text-lg tracking-wider text-black bg-amber-500 hover:bg-amber-400 active:scale-95 transition-transform comic-border shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isLoading ? 'Crafting Comic...' : 'Generate Comic with AI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
