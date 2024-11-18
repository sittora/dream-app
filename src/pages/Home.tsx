import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Feather, Brain, Share2, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Feather,
      title: 'Record Dreams',
      description: 'Document your nocturnal journeys with rich detail',
      path: '/record'
    },
    {
      icon: Brain,
      title: 'Jungian Analysis',
      description: 'Receive insights from archetypal interpreters',
      path: '/analysis'
    },
    {
      icon: Share2,
      title: 'Dream Web',
      description: 'Connect with fellow dreamers anonymously',
      path: '/dreamweb'
    },
    {
      icon: Sparkles,
      title: 'The Oracle',
      description: 'Consult our AI dream interpreter for deep insights',
      path: '/oracle'
    }
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.h1 
          className="title-font text-4xl md:text-5xl lg:text-6xl mb-4 text-burgundy"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Anima Insights
        </motion.h1>
        <p className="font-cormorant text-xl md:text-2xl text-gray-400">
          Unlock the mysteries of your unconscious mind
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {features.map(({ icon: Icon, title, description, path }, index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="dream-card cursor-pointer illuminated-card"
            onClick={() => navigate(path)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 mb-4 text-burgundy icon-hover"
            >
              <Icon className="w-full h-full" />
            </motion.div>
            <h3 className="font-cinzel text-xl mb-2 group-hover:text-burgundy transition-colors">
              {title}
            </h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
              {description}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default Home;