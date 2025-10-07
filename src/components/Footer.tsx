import { motion } from 'framer-motion';
import { Moon, Github, Twitter, Mail, Heart } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { env } from '../config';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Navigation',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Record Dreams', path: '/record' },
        { label: 'Dream Web', path: '/dreamweb' },
        { label: 'The Oracle', path: '/oracle' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Jungian Analysis', path: '/analysis' },
        { label: 'Library', path: '/resources' },
        { label: 'FAQ', path: '/faq' },
        { label: 'Support', path: '/support' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
        { label: 'GDPR', path: '/gdpr' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/anima-insights', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/animainsights', label: 'Twitter' },
    { icon: Mail, href: 'mailto:contact@anima-insights.com', label: 'Email' },
  ];

  return (
    <footer className="mt-auto border-t border-burgundy/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Moon className="w-6 h-6 text-burgundy" />
              <span className="title-font text-xl">Anima Insights</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Explore your unconscious mind through dream analysis and Jungian psychology.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-burgundy/20 rounded-lg transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-cinzel text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-burgundy transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-burgundy/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>© {currentYear} Anima Insights. Version {env.APP_VERSION}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-burgundy" />
              <span>for dream explorers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;