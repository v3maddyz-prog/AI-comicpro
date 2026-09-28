export type Tone =
  | 'Dramatic'
  | 'Funny'
  | 'Adventure'
  | 'Mysterious'
  | 'Emotional'
  | 'Dark'
  | 'Inspirational'
  | 'Light-hearted';

export type ArtStyle =
  | 'Anime'
  | 'Comic book'
  | 'Cartoon'
  | 'Watercolor'
  | 'Noir'
  | 'Manga'
  | 'Fantasy illustration'
  | 'Cinematic concept art';

export type BubblePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export type BubbleType = 'speech' | 'thought' | 'shout' | 'whisper';

export interface DialogueItem {
  id?: string;
  character: string;
  text: string;
  position?: BubblePosition;
  type?: BubbleType;
}

export interface SoundFXItem {
  id: string;
  text: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  rotation: number; // degrees
  color: string;
  scale: number;
}

export interface ComicPanel {
  panel_number: number;
  title: string;
  scene_description: string;
  narration: string;
  dialogue: DialogueItem[];
  image_prompt: string;
  image_url?: string;
  is_generating_image?: boolean;
  image_error?: string;
  sound_effects?: SoundFXItem[];
}

export interface ComicCharacter {
  name: string;
  description: string;
  avatar_url?: string;
}

export interface ComicStory {
  id: string;
  title: string;
  logline: string;
  characters: ComicCharacter[];
  panels: ComicPanel[];
  tone: Tone;
  art_style: ArtStyle;
  setting: string;
  created_at: string;
  author: string;
  issue_number: number;
  notes?: string;
}

export interface StoryGenerationRequest {
  story_prompt: string;
  character_name: string;
  character_description?: string;
  setting: string;
  tone: Tone;
  art_style: ArtStyle;
  panel_count: number;
  visual_details?: string;
  negative_prompt?: string;
}

export interface PanelImageRequest {
  panel_number: number;
  image_prompt: string;
  art_style: ArtStyle;
  tone: Tone;
  character_name: string;
  character_description?: string;
  setting?: string;
  negative_prompt?: string;
  seed?: number;
}
