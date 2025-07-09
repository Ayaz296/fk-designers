import React from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { Heart, Gem, Users, Leaf } from 'lucide-react';

const ValuesSection: React.FC = () => {
  const values = [
    {
      icon: <Gem className="h-10 w-10 text-gold-500" />,
      title: 'Exceptional Quality',
      description: 'We source the finest fabrics and materials to create garments that stand the test of time.'
    },
    {
      icon: <Heart className="h-10 w-10 text-gold-500" />,
      title: 'Artisanal Craftsmanship',
      description: 'Every piece is meticulously crafted by skilled artisans with decades of experience.'
    },
    {
      icon: <Users className="h-10 w-10 text-gold-500" />,
      title: 'Customer-Centric',
      description: 'We believe in building lasting relationships with our customers through personalized service.'
    },
    {
      icon: <Leaf className="h-10 w-10 text-gold-500" />,
      title: 'Sustainable Practices',
      description: 'We are committed to ethical manufacturing and supporting local communities.'
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-custom">
        <SectionTitle 
          title="Our Values" 
          subtitle="The principles that guide everything we do"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gold-50 mb-5">
                {value.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;