import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import { imageConfig, getImageWithFallback } from '../../config/images';

const FeaturedCollections: React.FC = () => {
  const collections = [
    {
      id: '1',
      name: 'Kurta Collection',
      description: 'Elegant kurta sets for every occasion and celebration',
      ...getImageWithFallback(imageConfig.collections.kurta.image, imageConfig.collections.kurta.fallback),
      link: '/shop?category=all&subcategory=kurta'
    },
    {
      id: '2',
      name: 'Suits Collection',
      description: 'Premium suits crafted for the modern gentleman',
      ...getImageWithFallback(imageConfig.collections.suits.image, imageConfig.collections.suits.fallback),
      link: '/shop?category=all&subcategory=suits'
    },
    {
      id: '3',
      name: 'Sherwani Collection',
      description: 'Exquisite sherwanis for weddings and special occasions',
      ...getImageWithFallback(imageConfig.collections.sherwani.image, imageConfig.collections.sherwani.fallback),
      link: '/shop?category=all&subcategory=sherwani'
    },
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-custom">
        <SectionTitle 
          title="Our Collections" 
          subtitle="Discover our exclusive collections designed for different occasions and styles."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div 
              key={collection.id}
              className="relative overflow-hidden rounded-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="aspect-[3/4]">
                <img 
                  src={collection.primary} 
                  alt={collection.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = collection.fallback;
                  }}
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-serif text-white mb-2">{collection.name}</h3>
                  <p className="text-gray-200 mb-4">{collection.description}</p>
                  <Link 
                    to={collection.link} 
                    className="inline-flex items-center text-gold-300 hover:text-gold-200 transition-colors"
                  >
                    View Collection <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;