import React from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, Star, BadgeCheck, TrendingUp } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <TruckIcon className="h-8 w-8 text-gold-500" />,
      title: 'Free Shipping',
      description: 'On all orders above ₹5000'
    },
    {
      icon: <BadgeCheck className="h-8 w-8 text-gold-500" />,
      title: 'Premium Quality',
      description: 'Handcrafted by skilled artisans'
    },
    {
      icon: <Star className="h-8 w-8 text-gold-500" />,
      title: 'Customer First',
      description: 'Exceptional service guaranteed'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-gold-500" />,
      title: 'Latest Trends',
      description: 'Contemporary designs with traditional roots'
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-b border-gray-200">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mr-4 mt-1">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;