import React from 'react';
import { motion } from 'framer-motion';
import { imageConfig, getBackgroundImageWithFallback } from '../../config/images';

const AboutHero: React.FC = () => {
  return (
    <section 
      className="relative min-h-[60vh] sm:min-h-[70vh] bg-cover bg-center flex items-center"
      style={{
        backgroundImage: getBackgroundImageWithFallback(
          imageConfig.about.hero,
          imageConfig.about.heroFallback
        ),
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      <div className="container-custom relative z-10 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 sm:mb-6">
            Our Heritage
          </h1>
          <p className="text-lg sm:text-xl text-gold-300 max-w-2xl mx-auto px-4">
            Crafting luxury Indian attire since 2005, blending tradition with contemporary design.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;