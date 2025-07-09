import React from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { imageConfig, getImageWithFallback } from '../../config/images';

const StorySection: React.FC = () => {
  const storyImage = getImageWithFallback(
    imageConfig.about.story,
    imageConfig.about.storyFallback
  );

  return (
    <section className="py-20">
      <div className="container-custom">
        <SectionTitle 
          title="Our Story" 
          subtitle="From a small boutique to a respected name in luxury Indian fashion"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-700 leading-relaxed">
              FK Designers began as a small family-owned boutique in Mumbai in 2005, founded by Farhan Khan with a vision to create exquisite Indian ethnic wear that preserves traditional craftsmanship while embracing contemporary design.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              What started as a passion project quickly gained recognition for its meticulous attention to detail, superior fabric quality, and innovative design aesthetics. Each piece in our collection tells a story of India's rich textile heritage, reimagined for the modern connoisseur.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Today, FK Designers has grown into a respected name in luxury Indian fashion, with our collections being showcased at prestigious fashion events across the country. Our commitment to supporting local artisans and sustainable practices remains at the heart of everything we do.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={storyImage.primary}
                alt="Artisan working on detailed embroidery" 
                className="w-full h-full object-cover"
                onError={storyImage.handleError}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-500 rounded-full flex items-center justify-center z-10">
              <span className="text-white font-serif text-lg text-center">Est.<br/>2005</span>
            </div>
            <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-gold-500 rounded-full z-0"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;