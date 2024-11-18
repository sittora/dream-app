import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search } from 'lucide-react';
import type { Dream, AnalysisResult } from '../types';
import { analyzeDream } from '../services/dreamAnalysis';
import BackButton from '../components/BackButton';

const JungianAnalysis = () => {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (dream: Dream) => {
    setIsAnalyzing(true);
    setSelectedDream(dream);
    
    try {
      const result = await analyzeDream(dream);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 mt-12"
      >
        <h1 className="font-cinzel text-3xl text-burgundy flex items-center justify-center gap-3">
          <Brain className="w-8 h-8" />
          Jungian Analysis
        </h1>
        <p className="text-gray-400 mt-2">
          Explore the depths of your dreams through archetypal interpretation
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="dream-card">
          <h2 className="font-cinzel text-xl mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-burgundy" />
            Select Dream
          </h2>
          <p className="text-gray-400">
            Your recent dreams will appear here for analysis.
          </p>
        </div>

        <div className="dream-card">
          <h2 className="font-cinzel text-xl mb-4">Analysis Results</h2>
          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-burgundy border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Analyzing dream patterns...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Interpretation</h3>
                <p className="text-gray-300">{analysis.interpretation}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Dominant Archetypes</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.archetypes.map((archetype, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-burgundy/20 text-burgundy text-sm"
                    >
                      {archetype}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Key Symbols</h3>
                <div className="space-y-2">
                  {analysis.symbols.map((symbol, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{symbol.name}</span>
                      <span className="text-gray-400">{symbol.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">
              Select a dream to receive a detailed Jungian analysis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JungianAnalysis;