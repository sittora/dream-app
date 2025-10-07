import { motion } from 'framer-motion';
import { Feather, Brain, Share2, Sparkles, Moon, Star, Eye, BookOpen } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Feather,
      title: 'Record Dreams',
      description: 'Document your nocturnal journeys with rich detail and symbolism',
      path: '/record-dreams',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Brain,
      title: 'Jungian Analysis',
      description: 'Receive insights from archetypal interpreters and depth psychology',
      path: '/jungian-analysis',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Share2,
      title: 'Dream Web',
      description: 'Connect with fellow dreamers in an anonymous, mystical community',
      path: '/dream-web',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Sparkles,
      title: 'The Oracle',
      description: 'Consult our AI dream interpreter for deep, personalized insights',
      path: '/oracle',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="relative">
          {/* Mystical background elements */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-emerald-500/20 rounded-full flex items-center justify-center animate-float">
                  <Moon className="w-10 h-10 text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="font-cinzel text-5xl md:text-6xl lg:text-7xl mb-6 text-gradient">
              Anima Insights
            </h1>
            
            <p className="font-cormorant text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Unlock the mysteries of your unconscious mind through Jungian dream interpretation and analysis
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={() => navigate('/record-dreams')}
                className="btn-primary text-lg px-8 py-4 group"
              >
                <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Your Journey
              </button>
              <button
                onClick={() => navigate('/oracle')}
                className="btn-secondary text-lg px-8 py-4 group"
              >
                <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ask The Oracle
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {features.map(({ icon: Icon, title, description, path, color }, index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-panel p-8 cursor-pointer group"
            onClick={() => navigate(path)}
          >
            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-mystical transition-all duration-300`}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
              
              <div className="space-y-3">
                <h3 className="font-cinzel text-2xl text-slate-100 group-hover:text-gradient transition-colors">
                  {title}
                </h3>
                <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                  {description}
                </p>
              </div>
              
              <div className="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">Explore</span>
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  className="ml-2"
                >
                  →
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center"
      >
        <div className="glass-panel p-12 max-w-4xl mx-auto">
          <h2 className="font-cinzel text-3xl md:text-4xl mb-6 text-gradient">
            Begin Your Dream Journey
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Every dream is a window into your unconscious mind. Start documenting your dreams today and discover the hidden meanings that guide your inner world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-lg px-8 py-4"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-lg px-8 py-4"
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;