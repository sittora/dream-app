import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, Moon, Brain, Book, Loader } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';
import { oracleApi } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'oracle' | 'system';
  content: string;
  timestamp: number;
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
    timestamp: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeArchetype, setActiveArchetype] = useState<string>('The Shadow');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }]);

    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send message to Oracle API
      const response = await oracleApi.sendMessage(userMessage);
      
      // Add Oracle's response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: response.message,
        timestamp: Date.now(),
      }]);
    } catch (err: any) {
      if (err.message.includes('Rate limit')) {
        setError(err.message);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: 'I apologize, but I am unable to process your request at the moment. Please try again later.',
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-gray-900/50 p-8 rounded-lg backdrop-blur-sm max-w-2xl w-full text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-purple-500" />
          <h1 className="text-2xl font-bold mb-4 text-purple-300">The Oracle is Resting</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mr-4"
          >
            Return Home
          </button>
          <button
            onClick={() => setError(null)}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 rounded-lg backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-purple-500 mr-3" />
          <h1 className="text-2xl font-bold text-purple-300">The Dream Oracle</h1>
        </div>

        <div className="space-y-4 mb-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white ml-4'
                      : message.role === 'system'
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  {message.role !== 'user' && (
                    <div className="flex items-center mb-2">
                      {message.role === 'system' ? (
                        <Bot className="w-5 h-5 mr-2 text-gray-400" />
                      ) : (
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                      )}
                      <span className="text-sm font-medium">
                        {message.role === 'system' ? 'System' : 'Oracle'}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your dream with the Oracle..."
            className="w-full bg-gray-800 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            maxRows={5}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-400 disabled:text-gray-500 disabled:cursor-not-allowed p-2"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Oracle;