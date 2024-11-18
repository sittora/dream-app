import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Search, ExternalLink } from 'lucide-react';
import BackButton from '../components/BackButton';

interface Resource {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  url: string;
  type: 'book' | 'article' | 'video' | 'research';
}

const JUNGIAN_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Man and His Symbols',
    author: 'Carl G. Jung',
    description: 'Jung\'s last work, written specifically for the general public, explores the world of dreams and their symbols.',
    tags: ['dreams', 'symbols', 'archetypes', 'unconscious'],
    url: 'https://archive.org/details/manandhissymbols',
    type: 'book'
  },
  {
    id: '2',
    title: 'The Interpretation of Dreams in Clinical Work',
    author: 'Marie-Louise von Franz',
    description: 'A comprehensive guide to working with dreams in analytical psychology.',
    tags: ['clinical', 'interpretation', 'analysis', 'methodology'],
    url: 'https://www.jstor.org/stable/j.ctt5hjk9z',
    type: 'research'
  },
  // Add more resources...
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState(JUNGIAN_RESOURCES);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const filtered = JUNGIAN_RESOURCES.filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      
      return matchesSearch && matchesType;
    });
    
    setFilteredResources(filtered);
  }, [searchQuery, selectedType]);

  return (
    <div className="relative max-w-4xl mx-auto">
      <BackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel text-3xl text-burgundy flex items-center gap-3">
            <Book className="w-8 h-8" />
            Jungian Resources
          </h1>
        </div>

        <div className="dream-card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or keywords..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {['all', 'book', 'article', 'video', 'research'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedType === type
                      ? 'bg-burgundy/20 text-burgundy'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredResources.map(resource => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="dream-card"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-cinzel text-xl text-burgundy">{resource.title}</h3>
                  <p className="text-gray-400">by {resource.author}</p>
                </div>
                <span className="px-3 py-1 text-sm bg-burgundy/20 text-burgundy rounded-full">
                  {resource.type}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{resource.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-mystic-900/50 text-gray-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Access Resource
              </a>
            </motion.div>
          ))}
          
          {filteredResources.length === 0 && (
            <div className="dream-card text-center py-12">
              <Book className="w-12 h-12 text-burgundy/50 mx-auto mb-4" />
              <p className="text-gray-400">No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Resources;