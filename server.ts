import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client (following the gemini-api skill instructions)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Style enhancers mapping for Stable Diffusion prompts
const ART_STYLE_MODIFIERS: Record<string, string> = {
  'Anime': 'masterpiece anime illustration, clean precise lineart, vibrant cel-shaded color palette, dramatic anime lighting, Makoto Shinkai and ufotable aesthetic, comic panel framing, highly detailed, no text, no speech bubbles',
  'Comic book': 'masterpiece American comic book panel art, dynamic ink lines, Jim Lee and Jack Kirby graphic novel style, bold dramatic shadows, vibrant saturated colors, halftone textures, no text, no speech bubbles',
  'Cartoon': 'vibrant modern animated cartoon illustration, expressive character design, clean vector art style, playful cinematic shadows, Disney/Pixar 2D concept art style, no text, no speech bubbles',
  'Watercolor': 'expressive watercolor graphic novel illustration, delicate black ink contour lines, wet-on-wet luminous watercolor washes, artistic paper texture, storybook illustration, no text, no speech bubbles',
  'Noir': 'gritty film noir comic panel art, heavy black ink chiaroscuro, sharp contrast, dramatic venetian blind shadows, moody cinematic lighting, 1940s graphic novel style, no text, no speech bubbles',
  'Manga': 'authentic Japanese manga panel illustration, dramatic screentones, intense speed lines, bold black and white ink hatching, expressive shonen art style, no text, no speech bubbles',
  'Fantasy illustration': 'epic fantasy graphic novel illustration, luminous magical lighting, rich atmospheric depth, detailed textures, Magic the Gathering art style, painterly digital art, no text, no speech bubbles',
  'Cinematic concept art': 'hyper-detailed cinematic concept art, octane render lighting, dramatic wide-angle perspective, volumetric fog, atmospheric depth, 8k resolution, photorealistic digital painting, no text, no speech bubbles',
};

const DEFAULT_NEGATIVE_PROMPT = 'blurry, distorted face, extra limbs, malformed hands, low quality, duplicate characters, unreadable text, watermark, logo, cropped image, speech bubble, text, typography, subtitles, border';

// Endpoint: Generate Comic Story & Script via Gemini
app.post('/api/generate-story', async (req, res) => {
  try {
    const {
      story_prompt,
      character_name,
      character_description = '',
      setting,
      tone,
      art_style,
      panel_count = 4,
      visual_details = '',
    } = req.body;

    if (!story_prompt || !character_name || !setting) {
      return res.status(400).json({
        error: 'Missing required fields: story_prompt, character_name, and setting are required.',
      });
    }

    const panelCountNum = Math.min(Math.max(parseInt(panel_count, 10) || 4, 2), 6);

    const promptText = `
You are an award-winning comic book writer, editor, and visual storyboard artist.
Generate an engaging, structured comic story based on the user's input.

USER SPECIFICATIONS:
- Story Prompt / Concept: "${story_prompt}"
- Main Character: "${character_name}"
- Character Description: "${character_description || 'A distinctive protagonist with expressive features'}"
- Story Setting: "${setting}"
- Tone: "${tone || 'Adventure'}"
- Art Style: "${art_style || 'Comic book'}"
- Number of Comic Panels: ${panelCountNum}
${visual_details ? `- Additional Visual Details: "${visual_details}"` : ''}

CRITICAL REQUIREMENTS:
1. Provide a catchy, memorable comic title and a 1-sentence logline.
2. Provide a list of character profiles with descriptions that emphasize consistent visual traits (clothing, colors, hair, signature items) so they look consistent across all panels.
3. Generate exactly ${panelCountNum} sequential comic panels. Each panel must advance the plot with visual storytelling.
4. Each panel MUST contain:
   - "panel_number": sequential integer from 1 to ${panelCountNum}
   - "title": short descriptive title for the moment (e.g. "The Discovery", "Clash in the Shadows")
   - "scene_description": detailed visual breakdown of camera shot (wide shot, close-up, extreme low angle), character pose, expression, lighting, and action
   - "narration": 1-2 punchy narration sentences (classic comic box style) or empty string
   - "dialogue": array of speech items with "character" and "text" (keep dialogue snappy and natural for comics, 1 to 2 lines per panel)
   - "image_prompt": A highly descriptive Stable Diffusion image prompt tailored for ${art_style}. Describe the exact scene, subject position, camera angle, lighting, background, and visual mood. NEVER include speech bubbles, words, or text in the image prompt!

OUTPUT FORMAT:
You MUST return ONLY valid JSON matching this exact structure with no Markdown fences, no backticks, and no commentary:
{
  "title": "Comic title",
  "logline": "Short story summary",
  "characters": [
    {
      "name": "${character_name}",
      "description": "Consistent visual description (clothing colors, hair, accessories)"
    }
  ],
  "panels": [
    {
      "panel_number": 1,
      "title": "Panel title",
      "scene_description": "Detailed visual description of the scene",
      "narration": "Narrator text",
      "dialogue": [
        {
          "character": "${character_name}",
          "text": "Dialogue text"
        }
      ],
      "image_prompt": "Detailed Stable Diffusion prompt for this panel"
    }
  ]
}
`;

    let comicData = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction:
              'You are an expert comic book creator. You must output exclusively raw, valid JSON matching the requested schema. Do not enclose in backticks or markdown.',
            responseMimeType: 'application/json',
            temperature: 0.8,
          },
        });

        const rawText = response.text || '';
        // Clean any accidental markdown code fences
        const cleanedText = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        comicData = JSON.parse(cleanedText);
      } catch (geminiError) {
        console.error('Gemini generation error, falling back to algorithmic comic builder:', geminiError);
      }
    }

    // Fallback comic generator if Gemini is unavailable or JSON failed
    if (!comicData || !comicData.panels || !Array.isArray(comicData.panels)) {
      comicData = generateFallbackComic({
        story_prompt,
        character_name,
        character_description,
        setting,
        tone: tone || 'Adventure',
        art_style: art_style || 'Comic book',
        panel_count: panelCountNum,
      });
    }

    // Ensure valid positions for dialogues
    const defaultPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
    comicData.panels.forEach((p: any, idx: number) => {
      p.panel_number = idx + 1;
      if (!p.dialogue) p.dialogue = [];
      p.dialogue = p.dialogue.map((d: any, dIdx: number) => ({
        character: d.character || character_name,
        text: d.text || '...',
        position: defaultPositions[dIdx % defaultPositions.length],
        type: 'speech',
      }));
    });

    res.json({
      success: true,
      comic: comicData,
    });
  } catch (error: any) {
    console.error('Error generating comic story:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate comic story',
    });
  }
});

// Endpoint: Generate / Enhance Comic Panel Image
app.post('/api/generate-panel-image', async (req, res) => {
  try {
    const {
      panel_number,
      image_prompt,
      art_style = 'Comic book',
      tone = 'Adventure',
      character_name,
      character_description = '',
      setting = '',
      negative_prompt = DEFAULT_NEGATIVE_PROMPT,
      seed,
    } = req.body;

    const styleModifier = ART_STYLE_MODIFIERS[art_style] || ART_STYLE_MODIFIERS['Comic book'];
    const randomSeed = seed || Math.floor(Math.random() * 9999999);

    // Build enhanced Stable Diffusion prompt
    const enhancedPrompt = `${image_prompt}. Featuring ${character_name} (${character_description}). Setting: ${setting}. Mood: ${tone}. ${styleModifier}`;

    // Stable Diffusion / Flux via Pollinations (instant, high quality, no API key barrier)
    const encodedPrompt = encodeURIComponent(enhancedPrompt.slice(0, 800));
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${randomSeed}&model=flux&nologo=true`;

    res.json({
      success: true,
      panel_number,
      image_url: imageUrl,
      enhanced_prompt: enhancedPrompt,
      seed: randomSeed,
    });
  } catch (error: any) {
    console.error('Error generating panel image:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate panel image',
    });
  }
});

// Helper for high-quality fallback comic generation
function generateFallbackComic(params: {
  story_prompt: string;
  character_name: string;
  character_description?: string;
  setting: string;
  tone: string;
  art_style: string;
  panel_count: number;
}) {
  const { story_prompt, character_name, character_description, setting, tone, art_style, panel_count } = params;

  const titleWords = story_prompt.split(' ').slice(0, 4).join(' ');
  const title = `${character_name}: ${titleWords ? titleWords.toUpperCase() : 'THE CHRONICLES'}`;
  const logline = `In the heart of ${setting}, ${character_name} confronts unexpected destiny in an unforgettable ${tone.toLowerCase()} tale.`;

  const panelTemplates = [
    {
      title: 'The Calm Before',
      narration: `It began like any other cycle in ${setting}. But tranquility was an illusion.`,
      dialogue: [{ character: character_name, text: 'Something in the air feels different today...' }],
      scene: `Wide establishing shot of ${setting}. ${character_name} looking towards the horizon with a determined expression.`,
      prompt: `Cinematic wide shot of ${setting}, ${character_name} standing on an overlook, atmospheric lighting, ${art_style} style, dynamic perspective`,
    },
    {
      title: 'The Catalyst',
      narration: 'Without warning, the quiet shattered. An anomaly emerged from the shadows.',
      dialogue: [{ character: character_name, text: 'No way... the legends were actually true!' }],
      scene: `Medium dramatic shot. ${character_name} reacting in awe as an arcane or technological anomaly pulses with brilliant light.`,
      prompt: `Medium action shot of ${character_name} discovering an ethereal glowing artifact in ${setting}, vivid colors, high contrast, ${art_style} style`,
    },
    {
      title: 'The Confrontation',
      narration: 'There was no turning back. Hesitation meant defeat.',
      dialogue: [{ character: character_name, text: 'If you want to take this, you have to go through me!' }],
      scene: `Dynamic low-angle action framing. ${character_name} stepping forward into battle stance with fiery resolve.`,
      prompt: `Dynamic low-angle heroic action shot of ${character_name} facing an impending challenge in ${setting}, dramatic rim lighting, intense focus, ${art_style} style`,
    },
    {
      title: 'The Tipping Point',
      narration: 'Channeling every ounce of will, the decisive move unfolded.',
      dialogue: [{ character: character_name, text: 'Now or never!' }],
      scene: `Climactic power shot. Energy bursts around ${character_name} as the climax reaches its peak.`,
      prompt: `Climactic explosive power surge scene with ${character_name} in ${setting}, sparkling energy particles, vibrant visual effects, ${art_style} style`,
    },
    {
      title: 'The Aftermath',
      narration: 'The dust began to settle, revealing a transformed reality.',
      dialogue: [{ character: character_name, text: 'We did it. But this is only the beginning.' }],
      scene: `Atmospheric wide shot of ${setting} after the storm. Sunlight breaking through clouds as ${character_name} stands victorious.`,
      prompt: `Atmospheric wide aftermath shot in ${setting}, morning sunlight piercing through dust, ${character_name} standing tall, emotional resolution, ${art_style} style`,
    },
    {
      title: 'A New Horizon',
      narration: 'A hero had answered the call, leaving an indelible mark upon the world.',
      dialogue: [{ character: character_name, text: 'Onward to the next adventure!' }],
      scene: `Heroic iconic pose. ${character_name} gazing into the endless horizon as destiny awaits.`,
      prompt: `Heroic silhouette and iconic portrait of ${character_name} looking into a breathtaking sky over ${setting}, epic cinematic composition, ${art_style} style`,
    },
  ];

  const panels = [];
  for (let i = 0; i < panel_count; i++) {
    const template = panelTemplates[i % panelTemplates.length];
    panels.push({
      panel_number: i + 1,
      title: template.title,
      scene_description: template.scene,
      narration: template.narration,
      dialogue: template.dialogue,
      image_prompt: template.prompt,
    });
  }

  return {
    title,
    logline,
    characters: [
      {
        name: character_name,
        description: character_description || `A courageous protagonist in ${setting} with iconic traits.`,
      },
    ],
    panels,
  };
}

// Full-stack Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ComicCraft server running on port ${PORT}`);
  });
}

startServer();
