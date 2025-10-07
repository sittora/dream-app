import { motion } from 'framer-motion';
import { Book, Search, ExternalLink, Video, FileText, Microscope } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import BackButton from '../components/BackButton';
import JUNG_PRIMARY_RESOURCES from '../data/jung.resources';

interface Resource {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  url?: string;
  type: 'book' | 'article' | 'video' | 'research';
}

// Map the vetted Jung resources to the UI Resource shape.
const JUNGIAN_RESOURCES: Resource[] = JUNG_PRIMARY_RESOURCES.map(r => ({
  id: r.id,
  title: r.title,
  author: r.author,
  description: r.description,
  tags: r.tags,
  url: r.link,
  // map resource types to UI types
  type: r.resourceType === 'video' ? 'video' : 
        r.resourceType === 'article' ? 'article' :
        r.resourceType === 'research' ? 'research' :
        'book' // for 'book' and 'collected_work'
}));

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
          <div>
            <h1 className="font-cinzel text-3xl text-burgundy flex items-center gap-3">
              <Book className="w-8 h-8" />
              Jungian Resources
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Curated collection of reliable Jung's works, scholarly interpretations, 
              and educational materials to deepen your understanding of analytical psychology.
            </p>
          </div>
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
          {filteredResources.map(resource => {
            // Get appropriate icon for resource type
            const getResourceIcon = (type: string) => {
              switch (type) {
                case 'video': return Video;
                case 'article': return FileText;
                case 'research': return Microscope;
                default: return Book;
              }
            };
            
            const ResourceIcon = getResourceIcon(resource.type);
            
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dream-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ResourceIcon className="w-5 h-5 text-burgundy" />
                      <h3 className="font-cinzel text-xl text-burgundy">{resource.title}</h3>
                    </div>
                    <p className="text-gray-400">by {resource.author}</p>
                  </div>
                  <span className="px-3 py-1 text-sm bg-burgundy/20 text-burgundy rounded-full ml-4">
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
                
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Access Resource
                  </a>
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    Available in libraries and bookstores
                  </div>
                )}
              </motion.div>
            );
          })}
          
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