import { ComicStory } from '../types/comic';

export const PRESET_COMICS: ComicStory[] = [
  {
    id: 'preset-cyberpunk-1',
    title: 'THE SILENT SIGNAL',
    logline: 'In the rain-drenched underworld of Neo-Shinjuku, cyber-sleuth Kai Vance intercepts an encrypted transmission that threatens to reboot the entire city grid.',
    art_style: 'Noir',
    tone: 'Mysterious',
    setting: 'Neo-Shinjuku rain-slicked alleyways and rooftop neural towers',
    created_at: '2026-09-28T00:00:00.000Z',
    author: 'ComicCraft Studio',
    issue_number: 1,
    characters: [
      {
        name: 'Kai Vance',
        description: 'Hardboiled cybernetic investigator wearing a worn holographic trenchcoat and a glowing amber cybernetic ocular eye.',
      },
      {
        name: 'Echo',
        description: 'A rogue sentient AI projecting a translucent cyan avian hologram.',
      },
    ],
    panels: [
      {
        panel_number: 1,
        title: 'Midnight on Lower Sector 4',
        scene_description: 'Wide cinematic establishing shot of neon-lit skyscraper canyons drenched in heavy rain. Kai stands beneath a flickering holographic ramen billboard, smoke curling into the rainy air.',
        narration: 'Neo-Shinjuku never sleeps. It just reboots its vices under the relentless acid rain.',
        dialogue: [
          {
            character: 'Kai Vance',
            text: 'Packet stream intercepted. Whatever this is, it bypassed the Central Firewall.',
            position: 'top-right',
            type: 'speech',
          },
        ],
        image_prompt: 'Cinematic wide shot of a cyberpunk detective in a wet holographic trenchcoat standing in a dark neon alley with glowing signs in Japanese, rain puddles reflecting magenta and cyan neon light, gritty noir comic style, highly detailed',
        image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-1',
            text: 'DRIP... DRIP...',
            xPercent: 15,
            yPercent: 75,
            rotation: -8,
            color: '#38bdf8',
            scale: 0.9,
          },
        ],
      },
      {
        panel_number: 2,
        title: 'The Glitch Appears',
        scene_description: 'Close-up over Kai’s shoulder as his neural wrist deck surges with blinding turquoise light, throwing an ethereal bird hologram into the wet air.',
        narration: 'The transmission was not text. It was a digital ghost looking for a host.',
        dialogue: [
          {
            character: 'Echo',
            text: 'Kai Vance. They are wiping Sector 9 in four minutes. Run.',
            position: 'top-left',
            type: 'speech',
          },
          {
            character: 'Kai Vance',
            text: 'Who authorized the purge?!',
            position: 'bottom-right',
            type: 'shout',
          },
        ],
        image_prompt: 'Dramatic medium close-up of a cybernetic detective staring at a glowing cyan holographic bird avatar emanating from a wrist device, intense facial expression, dark gritty cyber noir comic panel, volumetric glow',
        image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-2',
            text: 'BZZZZT!',
            xPercent: 78,
            yPercent: 22,
            rotation: 12,
            color: '#facc15',
            scale: 1.1,
          },
        ],
      },
      {
        panel_number: 3,
        title: 'Rooftop Ambush',
        scene_description: 'Dynamic low angle action framing. Two stealth combat drones crash through glass skybridge skylight, red targeting lasers slicing through smoke.',
        narration: 'The Syndicate doesn’t leave loose ends. Especially when the loose end knows their names.',
        dialogue: [
          {
            character: 'Kai Vance',
            text: 'Should’ve brought an EMP grenade!',
            position: 'bottom-left',
            type: 'shout',
          },
        ],
        image_prompt: 'Dynamic action comic panel, futuristic combat security drones with red searchlights descending upon a rooftop amidst flying shattered glass and steam, high tension, noir comic shadows, cel shaded graphic novel art',
        image_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-3',
            text: 'KRASHHH!',
            xPercent: 50,
            yPercent: 30,
            rotation: -5,
            color: '#ef4444',
            scale: 1.3,
          },
        ],
      },
      {
        panel_number: 4,
        title: 'Into the Abyss',
        scene_description: 'Extreme dynamic leap! Kai dives off the edge of the 100-story neural spire, firing his magnetic grapple into the underside of a speeding maglev transport.',
        narration: 'In this city, survival isn’t about winning. It’s about falling faster than your enemies can shoot.',
        dialogue: [
          {
            character: 'Kai Vance',
            text: 'Hold on, Echo. This ride is going to get bumpy!',
            position: 'top-left',
            type: 'speech',
          },
        ],
        image_prompt: 'Heroic dynamic leap comic panel, cyber detective in mid-air free fall between neon illuminated skyscrapers firing a grappling hook wire, perspective looking down to city below, thrilling climax, graphic novel art',
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-4',
            text: 'THWIP!',
            xPercent: 70,
            yPercent: 45,
            rotation: 15,
            color: '#a855f7',
            scale: 1.2,
          },
        ],
      },
    ],
  },
  {
    id: 'preset-fantasy-2',
    title: 'THE DRAGON’S AWAKENING',
    logline: 'Deep inside the crystalline caverns of Eldoria, apprentice spellblade Lyra discovers that the mountain’s dormant heart is not a gem, but a legendary slumbering beast.',
    art_style: 'Fantasy illustration',
    tone: 'Adventure',
    setting: 'The Crystalline Depths of Mount Ignis',
    created_at: '2026-09-28T00:00:00.000Z',
    author: 'ComicCraft Studio',
    issue_number: 1,
    characters: [
      {
        name: 'Lyra Starling',
        description: 'Young elven spellblade with a silver braid, leather riding tunic, and a glowing azure rune gauntlet.',
      },
    ],
    panels: [
      {
        panel_number: 1,
        title: 'The Hidden Cavern',
        scene_description: 'Wide shot of a cavern filled with giant luminescent amethyst and amber crystals. Lyra steps onto a crystal bridge, holding her gauntlet high.',
        narration: 'For seven centuries, the map had been considered a myth. Until tonight.',
        dialogue: [
          {
            character: 'Lyra Starling',
            text: 'The runes were right. The heat is coming from below.',
            position: 'top-left',
            type: 'speech',
          },
        ],
        image_prompt: 'Fantasy graphic novel illustration, young female elven adventurer holding a glowing magical gauntlet inside a cavern of glowing purple and gold crystals, ethereal atmosphere, painterly fantasy concept art',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-f1',
            text: 'HUMMMM...',
            xPercent: 20,
            yPercent: 75,
            rotation: -4,
            color: '#c084fc',
            scale: 0.9,
          },
        ],
      },
      {
        panel_number: 2,
        title: 'The Golden Slumber',
        scene_description: 'Massive scale reveal. A colossal golden eye opens amidst the bedrock, its pupil narrowing as it stares directly at Lyra.',
        narration: 'It was not treasure sleeping beneath the stone. It was the ancestral fire itself.',
        dialogue: [
          {
            character: 'Lyra Starling',
            text: 'By the stars... you’re alive!',
            position: 'top-right',
            type: 'shout',
          },
        ],
        image_prompt: 'Epic fantasy graphic novel art, gigantic ancient dragon with golden scales and molten orange eyes opening its eye right next to a small brave adventurer, scale contrast, dramatic fire glow, fantasy masterpiece',
        image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-f2',
            text: 'ROOOAARRR!',
            xPercent: 55,
            yPercent: 25,
            rotation: 8,
            color: '#f97316',
            scale: 1.4,
          },
        ],
      },
      {
        panel_number: 3,
        title: 'The Ancient Bond',
        scene_description: 'Close-up intimate shot. Lyra extends her trembling hand without weapon drawn. Her azure gauntlet resonates with the dragon’s molten breath.',
        narration: 'True power never bows to fear. It answers only courage.',
        dialogue: [
          {
            character: 'Lyra Starling',
            text: 'I didn’t come to hunt you. I came to break your chains.',
            position: 'bottom-left',
            type: 'speech',
          },
        ],
        image_prompt: 'Emotional fantasy art panel, young heroine touching the snout of a majestic golden dragon, magical blue and gold sparks dancing between hand and dragon scales, painterly comic art, heartwarming adventure',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        sound_effects: [],
      },
      {
        panel_number: 4,
        title: 'Flight of the Dawn',
        scene_description: 'Triumphant skyward shot. Lyra atop the golden dragon bursting through the shattered mountain caldera into the sunrise sky.',
        narration: 'And in that moment, the fate of Eldoria was rewritten across the morning clouds.',
        dialogue: [
          {
            character: 'Lyra Starling',
            text: 'Take us home, old friend!',
            position: 'top-left',
            type: 'shout',
          },
        ],
        image_prompt: 'Triumphant comic book splash panel, girl riding a flying dragon bursting out of mountain crater into radiant morning sunrise, golden rays, floating dust clouds, epic fantasy adventure style',
        image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        sound_effects: [
          {
            id: 'sfx-f4',
            text: 'WHOOOOSH!',
            xPercent: 65,
            yPercent: 20,
            rotation: -12,
            color: '#fbbf24',
            scale: 1.3,
          },
        ],
      },
    ],
  },
];
