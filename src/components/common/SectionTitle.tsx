import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  subtitle, 
  centered = true,
  light = false
}) => {
  return (
    <motion.div 
      className={`mb-10 ${centered ? 'text-center' : 'text-left'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={`font-serif text-3xl md:text-4xl ${light ? 'text-white' : 'text-neutral-900'}`}>
        {title}
      </h2>
      
      {subtitle && (
        <p className={`mt-4 max-w-3xl ${centered ? 'mx-auto' : ''} ${light ? 'text-gray-300' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
      
      <div className="mt-5 flex items-center justify-center gap-2">
        <span className={`block h-0.5 w-5 rounded ${light ? 'bg-gold-400' : 'bg-gold-500'}`}></span>
        <span className={`block h-0.5 w-10 rounded ${light ? 'bg-gold-400' : 'bg-gold-500'}`}></span>
        <span className={`block h-0.5 w-5 rounded ${light ? 'bg-gold-400' : 'bg-gold-500'}`}></span>
      </div>
    </motion.div>
  );
};

export default SectionTitle;