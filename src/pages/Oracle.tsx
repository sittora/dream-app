import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, Moon, Brain, Book, Loader } from 'lucide-react';
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
  { name: 'The Shadow', icon: Moon },
  { name: 'The Anima', icon: Brain },
  { name: 'The Wise Old Man', icon: Book },
];

const Oracle = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'system',
    content: 'Welcome to The Oracle. I am your guide through the depths of the unconscious mind, trained in Jungian psychology and archetypal analysis. Share your dreams, and together we shall unveil their hidden meanings.',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeArchetype, setActiveArchetype] = useState<string>('The Shadow');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (userMessage: string) => {
    // In production, this would be replaced with actual AI model API calls
    setIsThinking(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const symbols = ['water', 'bridge', 'darkness', 'light', 'serpent', 'tree'];
    const randomSymbols = symbols
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 3));

    const responses = [
      `In your dream, I sense the presence of ${randomSymbols.join(', ')}. These symbols suggest a deep connection to the collective unconscious. The ${activeArchetype} archetype manifests strongly here, indicating a process of psychological transformation.`,
      `Through the lens of Jungian analysis, your dream reveals significant archetypal patterns. The ${randomSymbols.join(' and ')} symbolize the tension between conscious and unconscious forces. ${activeArchetype} appears as a guiding force in this psychological landscape.`,
      `Your dream's imagery, particularly the ${randomSymbols.join(', ')}, speaks to the process of individuation that Jung described. The presence of ${activeArchetype} suggests you're engaging with profound aspects of your psyche.`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'oracle',
      content: response,
      archetype: activeArchetype,
      symbols: randomSymbols,
      timestamp: new Date(),
    }]);
    
    setIsThinking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    await simulateAIResponse(userMessage);
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
              {archetypes.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => setActiveArchetype(name)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                    activeArchetype === name
                      ? 'bg-burgundy/20 text-burgundy'
                      : 'hover:bg-burgundy/10 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3 dream-card min-h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
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
                    <p className="text-gray-200 leading-relaxed">{message.content}</p>
                    {message.symbols && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.symbols.map((symbol, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-burgundy/10 text-burgundy border border-burgundy/20"
                          >
                            {symbol}
                          </span>
                        ))}
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

          <form onSubmit={handleSubmit} className="border-t border-burgundy/20 p-4">
            <div className="flex gap-2">
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your dream to the Oracle..."
                className="input-field min-h-[44px] pt-3"
                maxRows={5}
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="btn-primary"
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