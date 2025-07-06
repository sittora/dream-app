import { Dream, AnalysisResult } from '../types';
import OpenAI from 'openai';

// Initialize OpenAI with environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true
});

// Enhanced Jungian symbol database with comprehensive meanings and psychological insights
const JUNGIAN_SYMBOLS: Record<string, {
  meanings: string[];
  archetypes: string[];
  alchemical: string[];
  psychological: string[];
  personal: string[];
  collective: string[];
}> = {
  water: {
    meanings: ['unconscious', 'emotion', 'purification', 'life force', 'transformation', 'fluidity'],
    archetypes: ['Great Mother', 'Spirit', 'Anima', 'Unconscious'],
    alchemical: ['dissolution', 'prima materia', 'solutio', 'liquefaction'],
    psychological: ['emotional processing', 'unconscious content', 'spiritual renewal', 'adaptability'],
    personal: ['emotional state', 'relationship dynamics', 'personal growth'],
    collective: ['collective unconscious', 'archetypal emotions', 'universal life force']
  },
  snake: {
    meanings: ['transformation', 'wisdom', 'healing', 'unconscious drives', 'kundalini', 'danger'],
    archetypes: ['Shadow', 'Anima/Animus', 'Trickster', 'Healer'],
    alchemical: ['mercurius', 'ouroboros', 'serpens', 'transformation'],
    psychological: ['shadow integration', 'transformation', 'healing process', 'instinctual wisdom'],
    personal: ['personal transformation', 'healing journey', 'shadow work'],
    collective: ['collective transformation', 'archetypal healing', 'universal wisdom']
  },
  tree: {
    meanings: ['growth', 'individuation', 'life', 'knowledge', 'connection', 'stability'],
    archetypes: ['Self', 'Great Mother', 'Wise Old Man', 'Axis Mundi'],
    alchemical: ['philosophical tree', 'arbor philosophica', 'growth', 'stability'],
    psychological: ['personal growth', 'individuation process', 'life force', 'stability'],
    personal: ['personal development', 'life journey', 'inner strength'],
    collective: ['collective growth', 'universal life force', 'archetypal wisdom']
  },
  moon: {
    meanings: ['feminine', 'intuition', 'cycles', 'unconscious', 'mystery', 'reflection'],
    archetypes: ['Anima', 'Great Mother', 'Lunar Goddess', 'Intuition'],
    alchemical: ['luna', 'silver', 'feminine principle', 'reflection'],
    psychological: ['intuitive knowing', 'emotional cycles', 'unconscious wisdom', 'feminine energy'],
    personal: ['intuition', 'emotional cycles', 'feminine aspects'],
    collective: ['collective intuition', 'archetypal feminine', 'universal cycles']
  },
  sun: {
    meanings: ['consciousness', 'masculine', 'energy', 'enlightenment', 'power', 'clarity'],
    archetypes: ['Animus', 'Hero', 'Solar God', 'Consciousness'],
    alchemical: ['sol', 'gold', 'masculine principle', 'illumination'],
    psychological: ['conscious awareness', 'personal power', 'enlightenment', 'clarity'],
    personal: ['consciousness', 'personal power', 'masculine energy'],
    collective: ['collective consciousness', 'archetypal masculine', 'universal enlightenment']
  },
  house: {
    meanings: ['self', 'psyche', 'shelter', 'family', 'inner structure', 'security'],
    archetypes: ['Self', 'Great Mother', 'Anima', 'Container'],
    alchemical: ['vessel', 'container', 'temenos', 'protection'],
    psychological: ['self-concept', 'inner world', 'psychological structure', 'security'],
    personal: ['self-image', 'inner world', 'personal space'],
    collective: ['collective psyche', 'archetypal home', 'universal shelter']
  },
  bridge: {
    meanings: ['transition', 'connection', 'transformation', 'passage', 'integration'],
    archetypes: ['Trickster', 'Guide', 'Threshold Guardian', 'Mediator'],
    alchemical: ['transformation', 'passage', 'liminal space', 'integration'],
    psychological: ['life transitions', 'consciousness shift', 'integration', 'connection'],
    personal: ['personal transitions', 'connections', 'integration'],
    collective: ['collective transitions', 'archetypal passages', 'universal connections']
  },
  door: {
    meanings: ['opportunity', 'passage', 'threshold', 'new beginning', 'choice'],
    archetypes: ['Threshold Guardian', 'Guide', 'Trickster', 'Opportunity'],
    alchemical: ['portal', 'transformation', 'initiation', 'passage'],
    psychological: ['new opportunities', 'consciousness expansion', 'initiation', 'choice'],
    personal: ['opportunities', 'new beginnings', 'choices'],
    collective: ['collective opportunities', 'archetypal thresholds', 'universal passages']
  },
  fire: {
    meanings: ['transformation', 'purification', 'energy', 'passion', 'destruction', 'illumination'],
    archetypes: ['Hero', 'Trickster', 'Solar God', 'Transformation'],
    alchemical: ['ignis', 'purification', 'transformation', 'illumination'],
    psychological: ['transformation', 'purification', 'vital energy', 'passion'],
    personal: ['personal transformation', 'passion', 'energy'],
    collective: ['collective transformation', 'archetypal fire', 'universal energy']
  },
  earth: {
    meanings: ['grounding', 'stability', 'material', 'nurturing', 'foundation', 'security'],
    archetypes: ['Great Mother', 'Self', 'Anima', 'Foundation'],
    alchemical: ['terra', 'foundation', 'material principle', 'stability'],
    psychological: ['grounding', 'stability', 'material concerns', 'security'],
    personal: ['grounding', 'stability', 'material life'],
    collective: ['collective grounding', 'archetypal earth', 'universal foundation']
  },
  bird: {
    meanings: ['spirit', 'freedom', 'transcendence', 'messenger', 'soul', 'elevation'],
    archetypes: ['Spirit', 'Messenger', 'Anima/Animus', 'Transcendence'],
    alchemical: ['spirit', 'transcendence', 'soul flight', 'elevation'],
    psychological: ['spiritual aspiration', 'freedom', 'soul guidance', 'transcendence'],
    personal: ['spiritual growth', 'freedom', 'soul journey'],
    collective: ['collective spirit', 'archetypal messengers', 'universal transcendence']
  },
  shadow: {
    meanings: ['repressed aspects', 'darkness', 'unconscious', 'integration', 'hidden'],
    archetypes: ['Shadow', 'Trickster', 'Dark Figure', 'Repressed'],
    alchemical: ['nigredo', 'darkness', 'prima materia', 'hidden'],
    psychological: ['shadow work', 'integration', 'unconscious content', 'repressed aspects'],
    personal: ['personal shadow', 'repressed aspects', 'integration work'],
    collective: ['collective shadow', 'archetypal darkness', 'universal unconscious']
  },
  light: {
    meanings: ['consciousness', 'enlightenment', 'clarity', 'spirit', 'illumination'],
    archetypes: ['Hero', 'Solar God', 'Spirit', 'Enlightenment'],
    alchemical: ['albedo', 'illumination', 'clarity', 'enlightenment'],
    psychological: ['conscious awareness', 'enlightenment', 'clarity', 'spiritual insight'],
    personal: ['consciousness', 'clarity', 'enlightenment'],
    collective: ['collective consciousness', 'archetypal light', 'universal enlightenment']
  },
  darkness: {
    meanings: ['unconscious', 'mystery', 'potential', 'unknown', 'hidden'],
    archetypes: ['Shadow', 'Great Mother', 'Dark Figure', 'Mystery'],
    alchemical: ['nigredo', 'potential', 'prima materia', 'mystery'],
    psychological: ['unconscious content', 'mystery', 'potential', 'hidden aspects'],
    personal: ['unconscious', 'mystery', 'potential'],
    collective: ['collective unconscious', 'archetypal mystery', 'universal potential']
  },
  child: {
    meanings: ['innocence', 'potential', 'new beginning', 'vulnerability', 'growth'],
    archetypes: ['Divine Child', 'Innocent', 'Hero', 'Potential'],
    alchemical: ['prima materia', 'innocence', 'potential', 'new beginning'],
    psychological: ['inner child', 'new beginnings', 'vulnerability', 'growth potential'],
    personal: ['inner child', 'new beginnings', 'vulnerability'],
    collective: ['collective innocence', 'archetypal child', 'universal potential']
  },
  mother: {
    meanings: ['nurturing', 'protection', 'unconditional love', 'source', 'care'],
    archetypes: ['Great Mother', 'Anima', 'Nurturer', 'Source'],
    alchemical: ['prima materia', 'source', 'nurturing', 'protection'],
    psychological: ['nurturing aspects', 'protection', 'unconditional love', 'care'],
    personal: ['nurturing', 'protection', 'care'],
    collective: ['collective nurturing', 'archetypal mother', 'universal care']
  },
  father: {
    meanings: ['authority', 'guidance', 'structure', 'protection', 'wisdom'],
    archetypes: ['Wise Old Man', 'Animus', 'Authority', 'Guide'],
    alchemical: ['structure', 'authority', 'guidance', 'wisdom'],
    psychological: ['authority figures', 'guidance', 'structure', 'wisdom'],
    personal: ['authority', 'guidance', 'structure'],
    collective: ['collective authority', 'archetypal father', 'universal guidance']
  },
  hero: {
    meanings: ['courage', 'transformation', 'journey', 'strength', 'adventure'],
    archetypes: ['Hero', 'Warrior', 'Savior', 'Adventurer'],
    alchemical: ['transformation', 'courage', 'journey', 'strength'],
    psychological: ['personal strength', 'transformation', 'heroic journey', 'courage'],
    personal: ['personal strength', 'courage', 'journey'],
    collective: ['collective hero', 'archetypal courage', 'universal journey']
  },
  death: {
    meanings: ['transformation', 'endings', 'rebirth', 'change', 'transition'],
    archetypes: ['Death', 'Transformation', 'Rebirth', 'Change'],
    alchemical: ['transformation', 'endings', 'rebirth', 'change'],
    psychological: ['transformation', 'endings', 'rebirth', 'change'],
    personal: ['personal transformation', 'endings', 'change'],
    collective: ['collective transformation', 'archetypal death', 'universal change']
  },
  chase: {
    meanings: ['avoidance', 'confrontation', 'shadow work', 'fear', 'escape'],
    archetypes: ['Shadow', 'Pursuer', 'Fear', 'Avoidance'],
    alchemical: ['confrontation', 'shadow work', 'fear', 'escape'],
    psychological: ['avoidance', 'confrontation', 'shadow work', 'fear'],
    personal: ['avoidance', 'confrontation', 'fear'],
    collective: ['collective avoidance', 'archetypal fear', 'universal confrontation']
  },
  falling: {
    meanings: ['loss of control', 'surrender', 'trust', 'fear', 'letting go'],
    archetypes: ['Loss of Control', 'Surrender', 'Trust', 'Fear'],
    alchemical: ['surrender', 'trust', 'letting go', 'loss of control'],
    psychological: ['loss of control', 'surrender', 'trust', 'fear'],
    personal: ['loss of control', 'surrender', 'trust'],
    collective: ['collective surrender', 'archetypal trust', 'universal letting go']
  },
  flying: {
    meanings: ['freedom', 'transcendence', 'spirituality', 'elevation', 'escape'],
    archetypes: ['Spirit', 'Freedom', 'Transcendence', 'Escape'],
    alchemical: ['transcendence', 'freedom', 'elevation', 'escape'],
    psychological: ['freedom', 'transcendence', 'spirituality', 'elevation'],
    personal: ['freedom', 'transcendence', 'spirituality'],
    collective: ['collective freedom', 'archetypal transcendence', 'universal elevation']
  }
};

const generatePrompt = (dream: Dream) => `
Analyze this dream from a comprehensive Jungian perspective with deep psychological insight:

Dream Content: ${dream.content}
Mood: ${dream.mood}
Identified Symbols: ${dream.symbols.join(', ')}

Please provide a detailed, sophisticated analysis including:

1. **Core Archetypal Patterns**: Identify the dominant archetypes present and their specific psychological significance in this dream
2. **Symbolic Interpretation**: Deep analysis of key symbols and their personal/collective meanings, including how they relate to the dreamer's current life situation
3. **Shadow Work**: Identify shadow aspects and specific integration opportunities, including repressed emotions or aspects of personality
4. **Individuation Process**: How this dream specifically relates to the dreamer's individuation journey and personal growth
5. **Alchemical Transformation**: Identify specific alchemical stages and transformation processes at work
6. **Practical Integration**: Concrete, actionable insights for psychological integration and growth
7. **Emotional Processing**: Understanding of emotional themes and their resolution, including specific emotional patterns
8. **Personal Context**: How this dream relates to the dreamer's current life circumstances and challenges
9. **Psychological Development**: Specific insights about the dreamer's psychological development and growth areas
10. **Integration Strategies**: Practical steps for integrating the dream's insights into daily life

Base your analysis on:
- Carl Jung's analytical psychology and archetypal theory
- Marie-Louise von Franz's amplification method
- Alchemical symbolism and transformation stages
- Contemporary depth psychology research
- Trauma-informed dream work approaches
- Cross-cultural dream symbolism

Provide a comprehensive interpretation that is both psychologically sophisticated and practically useful for the dreamer's personal growth and self-understanding. Be specific, avoid generic statements, and offer concrete insights.
`;

export const analyzeDream = async (dream: Dream): Promise<AnalysisResult> => {
  try {
    // Find significant symbols by comprehensive string matching
    const significantSymbols = Object.keys(JUNGIAN_SYMBOLS).filter(symbol => 
      dream.content.toLowerCase().includes(symbol) || 
      dream.symbols.includes(symbol) ||
      dream.content.toLowerCase().includes(symbol + 's') ||
      dream.content.toLowerCase().includes(symbol + 'ing') ||
      dream.content.toLowerCase().includes(symbol + 'ed')
    );

    // Check if OpenAI API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'dummy-key') {
      console.warn('OpenAI API key not configured. Using fallback analysis.');
      return generateFallbackAnalysis(dream, significantSymbols);
    }

    // Generate AI interpretation with enhanced prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a master Jungian analyst with deep expertise in dream interpretation, trained in the methods of Carl Jung, Marie-Louise von Franz, and contemporary depth psychology. You provide detailed, psychologically sophisticated analyses that help users understand their unconscious processes and support their individuation journey. Always be specific, avoid generic statements, and offer concrete insights."
        },
        {
          role: "user",
          content: generatePrompt(dream)
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const interpretation = completion.choices[0].message.content;

    // Combine analysis with identified symbols
    return {
      interpretation: interpretation || "Unable to generate interpretation.",
      symbols: significantSymbols.map(symbol => ({
        name: symbol,
        meanings: JUNGIAN_SYMBOLS[symbol]?.meanings || ['personal significance'],
        archetypal: JUNGIAN_SYMBOLS[symbol]?.archetypes || [],
        alchemical: JUNGIAN_SYMBOLS[symbol]?.alchemical || []
      })),
      archetypes: identifyArchetypes(significantSymbols),
      alchemicalStage: determineAlchemicalStage(significantSymbols),
      emotionalTone: analyzeEmotionalTone(dream.content, dream.mood),
      psychologicalInsights: generatePsychologicalInsights(significantSymbols, dream)
    };
  } catch (error) {
    console.error('Dream analysis error:', error);
    // Find significant symbols for fallback analysis
    const significantSymbols = Object.keys(JUNGIAN_SYMBOLS).filter(symbol => 
      dream.content.toLowerCase().includes(symbol) || dream.symbols.includes(symbol)
    );
    return generateFallbackAnalysis(dream, significantSymbols);
  }
};

// Helper functions
const identifyArchetypes = (symbols: string[]): string[] => {
  const archetypes = new Set<string>();
  symbols.forEach(symbol => {
    JUNGIAN_SYMBOLS[symbol]?.archetypes?.forEach(archetype => {
      archetypes.add(archetype);
    });
  });
  return Array.from(archetypes);
};

const determineAlchemicalStage = (symbols: string[]): string => {
  const stages = {
    nigredo: 0,
    albedo: 0,
    citrinitas: 0,
    rubedo: 0
  };

  symbols.forEach(symbol => {
    JUNGIAN_SYMBOLS[symbol]?.alchemical?.forEach(stage => {
      if (stage.includes('dissolution') || stage.includes('nigredo') || stage.includes('darkness')) stages.nigredo++;
      if (stage.includes('purification') || stage.includes('albedo') || stage.includes('silver')) stages.albedo++;
      if (stage.includes('solar') || stage.includes('citrinitas') || stage.includes('gold')) stages.citrinitas++;
      if (stage.includes('integration') || stage.includes('rubedo') || stage.includes('red')) stages.rubedo++;
    });
  });

  const maxStage = Object.entries(stages).reduce((a, b) => a[1] > b[1] ? a : b);
  return maxStage[0];
};

const analyzeEmotionalTone = (content: string, mood: string): string => {
  const positiveWords = ['joy', 'peace', 'love', 'light', 'freedom', 'beauty', 'warmth', 'happy', 'excited', 'grateful'];
  const negativeWords = ['fear', 'anger', 'sadness', 'darkness', 'pain', 'anxiety', 'confusion', 'terrified', 'angry', 'depressed'];
  const neutralWords = ['curiosity', 'wonder', 'mystery', 'exploration', 'journey', 'calm', 'neutral', 'curious'];

  const text = (content + ' ' + mood).toLowerCase();
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  const neutralCount = neutralWords.filter(word => text.includes(word)).length;

  if (positiveCount > negativeCount && positiveCount > neutralCount) return 'positive';
  if (negativeCount > positiveCount && negativeCount > neutralCount) return 'negative';
  return 'neutral';
};

const generatePsychologicalInsights = (symbols: string[], dream: Dream): string[] => {
  const insights: string[] = [];
  
  symbols.forEach(symbol => {
    const symbolData = JUNGIAN_SYMBOLS[symbol];
    if (symbolData) {
      // Add personal insights
      symbolData.personal.forEach(insight => {
        insights.push(`${symbol}: ${insight}`);
      });
      
      // Add psychological insights
      symbolData.psychological.forEach(insight => {
        insights.push(`${symbol}: ${insight}`);
      });
    }
  });

  return insights.slice(0, 8); // Limit to 8 insights
};

const generateFallbackAnalysis = (dream: Dream, significantSymbols: string[]): AnalysisResult => ({
  interpretation: `This dream reveals significant psychological material that deserves careful attention. The presence of ${significantSymbols.join(', ')} suggests a deep engagement with your unconscious processes.

The dream's imagery speaks to the process of individuation that Jung described, indicating you're working through important psychological material. The symbols present suggest a journey of self-discovery and psychological integration that is currently active in your psyche.

Consider how these symbols relate to your current life circumstances, relationships, and personal challenges. The dream may be offering insights about areas of your life that need attention, growth, or integration.

This analysis suggests you're in an important phase of psychological development that deserves reflection and integration into your conscious awareness.`,
  symbols: significantSymbols.map(symbol => ({
    name: symbol,
    meanings: JUNGIAN_SYMBOLS[symbol]?.meanings || ['personal significance'],
    archetypal: JUNGIAN_SYMBOLS[symbol]?.archetypes || [],
    alchemical: JUNGIAN_SYMBOLS[symbol]?.alchemical || []
  })),
  archetypes: identifyArchetypes(significantSymbols),
  alchemicalStage: determineAlchemicalStage(significantSymbols),
  emotionalTone: analyzeEmotionalTone(dream.content, dream.mood),
  psychologicalInsights: generatePsychologicalInsights(significantSymbols, dream)
});

export default analyzeDream;