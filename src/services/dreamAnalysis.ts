import { Dream, AnalysisResult } from '../types';
import OpenAI from 'openai';

// Initialize OpenAI with environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Jungian symbol database
const JUNGIAN_SYMBOLS = {
  water: {
    meanings: ['unconscious', 'emotion', 'purification', 'life force'],
    archetypes: ['Great Mother', 'Spirit'],
    alchemical: ['dissolution', 'prima materia']
  },
  snake: {
    meanings: ['transformation', 'wisdom', 'healing', 'unconscious drives'],
    archetypes: ['Shadow', 'Anima/Animus'],
    alchemical: ['mercurius', 'ouroboros']
  },
  tree: {
    meanings: ['growth', 'individuation', 'life', 'knowledge'],
    archetypes: ['Self', 'Great Mother'],
    alchemical: ['philosophical tree']
  },
  // Add more symbols as needed
};

const generatePrompt = (dream: Dream) => `
Analyze this dream from a Jungian perspective:

Dream Content: ${dream.content}
Mood: ${dream.mood}
Identified Symbols: ${dream.symbols.join(', ')}

Please provide a comprehensive analysis including:
1. Core archetypal patterns and their psychological significance
2. Personal and collective unconscious elements
3. Shadow aspects and integration opportunities
4. Alchemical symbolism and transformation processes
5. Connection to the individuation journey

Base your analysis on:
- Carl Jung's analytical psychology
- Marie-Louise von Franz's amplification method
- Archetypal symbolism
- Alchemical transformation stages

Provide practical insights for psychological integration.
`;

export const analyzeDream = async (dream: Dream): Promise<AnalysisResult> => {
  try {
    // Find significant symbols by simple string matching
    const significantSymbols = Object.keys(JUNGIAN_SYMBOLS).filter(symbol => 
      dream.content.toLowerCase().includes(symbol) || dream.symbols.includes(symbol)
    );

    // Generate AI interpretation
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a Jungian analyst with deep expertise in dream interpretation, trained in the methods of Carl Jung and Marie-Louise von Franz. Provide detailed, psychologically insightful analyses."
        },
        {
          role: "user",
          content: generatePrompt(dream)
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
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
      archetypes: identifyArchetypes(dream, significantSymbols),
      alchemicalStage: determineAlchemicalStage(dream, significantSymbols),
      confidence: calculateConfidence(significantSymbols)
    };
  } catch (error) {
    console.error('Dream analysis error:', error);
    return generateFallbackAnalysis(dream);
  }
};

// Helper functions
const identifyArchetypes = (dream: Dream, symbols: string[]): string[] => {
  const archetypes = new Set<string>();
  symbols.forEach(symbol => {
    JUNGIAN_SYMBOLS[symbol]?.archetypes?.forEach(archetype => {
      archetypes.add(archetype);
    });
  });
  return Array.from(archetypes);
};

const determineAlchemicalStage = (dream: Dream, symbols: string[]): string => {
  const stages = {
    nigredo: 0,
    albedo: 0,
    citrinitas: 0,
    rubedo: 0
  };

  symbols.forEach(symbol => {
    JUNGIAN_SYMBOLS[symbol]?.alchemical?.forEach(stage => {
      if (stage.includes('dissolution')) stages.nigredo++;
      if (stage.includes('purification')) stages.albedo++;
      if (stage.includes('solar')) stages.citrinitas++;
      if (stage.includes('integration')) stages.rubedo++;
    });
  });

  const maxStage = Object.entries(stages).reduce((a, b) => a[1] > b[1] ? a : b);
  return maxStage[0];
};

const calculateConfidence = (symbols: string[]): number => {
  return Math.min(symbols.length * 0.2, 1);
};

const generateFallbackAnalysis = (dream: Dream): AnalysisResult => ({
  interpretation: "A basic analysis suggests themes of personal transformation and unconscious exploration.",
  symbols: dream.symbols.map(symbol => ({
    name: symbol,
    meanings: ['personal significance'],
    archetypal: [],
    alchemical: []
  })),
  archetypes: ['Shadow'],
  alchemicalStage: 'nigredo',
  confidence: 0.3
});

export default analyzeDream;