import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, Moon, Brain, Book, Loader } from 'lucide-react';
import OpenAI from 'openai';
import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import BackButton from '../components/BackButton';


interface Message {
  id: string;
  role: 'user' | 'oracle' | 'system';
  content: string;
  archetype?: string;
  symbols?: string[];
  timestamp: Date;
  isLoading?: boolean;
}

const archetypes = [
  { name: 'The Shadow', icon: Moon, description: 'Represents repressed aspects of personality' },
  { name: 'The Anima/Animus', icon: Brain, description: 'Inner feminine/masculine aspects' },
  { name: 'The Wise Old Man', icon: Book, description: 'Inner wisdom and guidance' },
];

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Enhanced symbol database for better analysis
const DREAM_SYMBOLS = {
  water: ['emotion', 'unconscious', 'purification', 'life force'],
  fire: ['transformation', 'passion', 'destruction', 'energy'],
  earth: ['grounding', 'stability', 'material', 'nurturing'],
  air: ['spirit', 'freedom', 'intellect', 'communication'],
  snake: ['transformation', 'wisdom', 'healing', 'kundalini'],
  bird: ['spirit', 'freedom', 'transcendence', 'messenger'],
  tree: ['growth', 'individuation', 'life', 'knowledge'],
  moon: ['feminine', 'intuition', 'cycles', 'unconscious'],
  sun: ['consciousness', 'masculine', 'energy', 'enlightenment'],
  house: ['self', 'psyche', 'shelter', 'inner structure'],
  bridge: ['transition', 'connection', 'transformation'],
  door: ['opportunity', 'passage', 'threshold'],
  shadow: ['repressed aspects', 'darkness', 'unconscious'],
  light: ['consciousness', 'enlightenment', 'clarity'],
  darkness: ['unconscious', 'mystery', 'potential'],
  child: ['innocence', 'potential', 'new beginning'],
  mother: ['nurturing', 'protection', 'unconditional love'],
  father: ['authority', 'guidance', 'structure'],
  hero: ['courage', 'transformation', 'journey'],
  death: ['transformation', 'endings', 'rebirth'],
  chase: ['avoidance', 'confrontation', 'shadow work'],
  falling: ['loss of control', 'surrender', 'trust'],
  flying: ['freedom', 'transcendence', 'spirituality'],
  teeth: ['communication', 'power', 'anxiety'],
  naked: ['vulnerability', 'authenticity', 'exposure'],
  test: ['evaluation', 'self-doubt', 'preparation'],
  school: ['learning', 'growth', 'social dynamics'],
  car: ['control', 'direction', 'life journey'],
  ocean: ['unconscious depths', 'emotion', 'mystery'],
  mountain: ['challenge', 'achievement', 'spiritual ascent'],
  forest: ['unconscious', 'growth', 'mystery'],
  mirror: ['self-reflection', 'truth', 'duality'],
  key: ['access', 'knowledge', 'opportunity'],
  clock: ['time', 'mortality', 'cycles'],
  red: ['passion', 'anger', 'vitality'],
  blue: ['spirituality', 'calm', 'depth'],
  green: ['growth', 'nature', 'healing'],
  black: ['mystery', 'shadow', 'potential'],
  white: ['purity', 'clarity', 'spirit']
};

const Oracle = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'system',
    content: 'Welcome to The Oracle. I am your guide through the depths of the unconscious mind, trained in Jungian psychology and archetypal analysis. Share your dreams, and together we shall unveil their hidden meanings.',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [_isTyping, _setIsTyping] = useState(false); // reserved for future typing indicator
  const [activeArchetype, setActiveArchetype] = useState<string>('The Shadow');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test API connection on mount
  useEffect(() => {
    const testAPIConnection = async () => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'dummy-key') {
        console.error('OpenAI API key not configured');
        return;
      }
      
  // Dev note: console kept intentionally for API connectivity telemetry.
  console.log('Testing API connection...');
      try {
  await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        });
  // eslint-disable-next-line no-console -- intentional success telemetry
  console.log('API connection successful');
      } catch (error) {
  // eslint-disable-next-line no-console -- intentional error telemetry for early API failures
  console.error('API connection test failed:', error);
      }
    };
    
    testAPIConnection();
  }, []);

  const extractSymbols = (text: string): string[] => {
    const foundSymbols: string[] = [];
    const lowerText = text.toLowerCase();
    
    Object.keys(DREAM_SYMBOLS).forEach(symbol => {
      if (lowerText.includes(symbol) || 
          lowerText.includes(symbol + 's') || 
          lowerText.includes(symbol + 'ing') ||
          lowerText.includes(symbol + 'ed')) {
        foundSymbols.push(symbol);
      }
    });
    
    return foundSymbols.slice(0, 5); // Limit to 5 most relevant symbols
  };

  const generateOracleResponse = async (userMessage: string, conversationHistory: Message[]) => {
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'dummy-key') {
        console.error('OpenAI API key not configured');
        return generateFallbackResponse(userMessage);
      }

      // Extract symbols from user message
      const userSymbols = extractSymbols(userMessage);
      console.log('Extracted symbols:', userSymbols);
      
      // Create a highly sophisticated prompt for dream interpretation
      const systemPrompt = `You are The Oracle, a master of Jungian psychology and dream interpretation with deep expertise in:

1. Carl Jung's analytical psychology and archetypal theory
2. Marie-Louise von Franz's amplification method
3. Alchemical transformation processes and stages
4. Contemporary depth psychology research
5. Cross-cultural dream symbolism and mythology
6. Trauma-informed dream work and shadow integration
7. Integration of neuroscience and psychology

Your role is to provide insightful, psychologically sophisticated dream interpretations that help users understand their unconscious processes and support their individuation journey.

IMPORTANT GUIDELINES:
- Always identify specific symbols and their archetypal meanings
- Connect dreams to the individuation process and personal growth
- Provide practical psychological insights for integration
- Consider the active archetype context when relevant
- Maintain a mystical yet grounded, professional tone
- Encourage self-reflection and personal integration
- Address potential trauma or shadow material sensitively
- Use specific examples and concrete interpretations
- Avoid generic responses - be specific to the dream content
- Consider emotional tone and psychological context

Current active archetype: ${activeArchetype}
Identified symbols in user message: ${userSymbols.join(', ')}

Respond in a thoughtful, analytical yet accessible manner. Provide specific insights rather than general statements.`;

      // Prepare conversation history for the API
      const conversationMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          }))
      ];

      console.log('Making API call with messages:', conversationMessages.length);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0].message.content;
      console.log('Received response:', response?.substring(0, 100) + '...');
      
      // Extract symbols from the AI response
      const responseSymbols = extractSymbols(response || '');

      setRetryError(false);
      return {
        content: response || "I'm unable to provide an interpretation at this moment.",
        symbols: responseSymbols.slice(0, 3)
      };
    } catch (error) {
      console.error('Oracle API error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          return {
            content: "Authentication failed. Please check your API key configuration.",
            symbols: []
          };
        } else if (error.message.includes('429')) {
          setRetryError(true);
          return {
            content: `You have reached the OpenAI rate limit.\n\nPlease wait a minute and then click Retry below.`,
            symbols: []
          };
        } else if (error.message.includes('500')) {
          return {
            content: "Server error. Please try again later.",
            symbols: []
          };
        } else {
          return {
            content: `Connection error: ${error.message}. Please check your internet connection and try again.`,
            symbols: []
          };
        }
      }
      
      setRetryError(false);
      // Fallback to local response
      return generateFallbackResponse(userMessage);
    }
  };

  const generateFallbackResponse = (userMessage: string) => {
  const userSymbols = extractSymbols(userMessage);
    
    let response = "I'm currently in offline mode, but I can still offer some insights based on Jungian psychology.\n\n";
    
    if (userSymbols.length > 0) {
      response += `I notice the symbols: ${userSymbols.join(', ')}. `;
      
      if (userSymbols.includes('water')) {
        response += "Water often represents the unconscious and emotional depths. This suggests you're exploring deep emotional territory.";
      } else if (userSymbols.includes('shadow')) {
        response += "Shadow figures indicate repressed aspects of your personality seeking integration.";
      } else if (userSymbols.includes('house')) {
        response += "Houses represent the self and your inner psychological structure.";
      } else if (userSymbols.includes('tree')) {
        response += "Trees symbolize growth, individuation, and the connection between earth and sky.";
      } else {
        response += "These symbols suggest important psychological work is happening in your unconscious.";
      }
    } else {
      response += "Your dream content suggests engagement with unconscious material. Consider the emotional tone and recurring themes.";
    }
    
    response += "\n\nFor a full analysis, please ensure your API key is configured correctly.";
    
    return {
      content: response,
      symbols: userSymbols.slice(0, 3)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setLastUserMessage(userMessage);
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    setIsThinking(true);

    try {
      const response = await generateOracleResponse(userMessage, messages);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: response.content,
        archetype: activeArchetype,
        symbols: response.symbols,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Failed to get Oracle response:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: "I'm having trouble accessing my knowledge at the moment. Please try again, or perhaps the answer lies within your own reflection.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetry = async () => {
    if (!lastUserMessage) return;
    setIsThinking(true);
    setRetryError(false);
    try {
      const response = await generateOracleResponse(lastUserMessage, messages);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'oracle',
        content: response.content,
        archetype: activeArchetype,
        symbols: response.symbols,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'oracle',
        content: "Retry failed. Please try again later.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 mt-12"
      >
        <h1 className="font-cinzel text-3xl text-burgundy flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" />
          The Oracle
        </h1>
        <p className="text-gray-400 mt-2">
          Consult the AI interpreter trained in Jungian psychology and alchemical symbolism
        </p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="dream-card">
            <h3 className="font-cinzel text-lg mb-4 text-burgundy">Active Archetype</h3>
            <div className="space-y-2">
              {archetypes.map(({ name, icon: Icon, description }) => (
                <button
                  key={name}
                  onClick={() => setActiveArchetype(name)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                    activeArchetype === name
                      ? 'bg-burgundy/20 text-burgundy'
                      : 'hover:bg-burgundy/10 text-gray-400'
                  }`}
                  title={description}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-mystic-900/50 rounded-lg">
              <p className="text-xs text-gray-400">
                The Oracle uses GPT-4 with enhanced Jungian psychology training and sophisticated symbol recognition for accurate dream interpretation.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 dream-card min-h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-burgundy/20 ml-auto'
                        : message.role === 'system'
                        ? 'bg-mystic-900/50 text-center w-full'
                        : 'bg-mystic-900/50'
                    }`}
                  >
                    {message.role === 'oracle' && (
                      <div className="flex items-center gap-2 mb-2 text-burgundy">
                        <Bot className="w-5 h-5" />
                        <span className="text-sm font-cinzel">{message.archetype}</span>
                      </div>
                    )}
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.symbols && message.symbols.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.symbols.map((symbol, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-burgundy/10 text-burgundy border border-burgundy/20"
                            title={DREAM_SYMBOLS[symbol as keyof typeof DREAM_SYMBOLS]?.join(', ')}
                          >
                            {symbol}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Show Retry button if rate limit error and this is the last oracle message */}
                    {retryError && idx === messages.length - 1 && (
                      <div className="mt-4 flex flex-col items-center">
                        <button
                          className="btn-primary px-4 py-2 rounded mt-2"
                          onClick={handleRetry}
                          disabled={isThinking}
                        >
                          Retry
                        </button>
                        <span className="text-xs text-gray-400 mt-2">Wait a minute before retrying to avoid another rate limit.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center text-gray-400"
                >
                  <Bot className="w-5 h-5" />
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-burgundy/50 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-burgundy/50 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-burgundy/50 rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-burgundy/20">
            <div className="flex gap-3">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your dream or ask about dream symbolism..."
                className="flex-1 input-field resize-none"
                minRows={1}
                maxRows={4}
                disabled={isThinking}
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isThinking ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Oracle;