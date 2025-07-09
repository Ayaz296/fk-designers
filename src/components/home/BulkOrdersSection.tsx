import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Gift, Phone } from 'lucide-react';

const BulkOrdersSection: React.FC = () => {
  const services = [
    {
      icon: <Heart className="h-8 w-8 text-gold-500" />,
      title: 'Wedding Parties',
      description: 'Coordinated outfits for the entire wedding party, from groom to groomsmen',
      features: ['Matching color schemes', 'Group discounts', 'Coordinated styling']
    },
    {
      icon: <Users className="h-8 w-8 text-gold-500" />,
      title: 'Corporate Events',
      description: 'Professional ethnic wear for corporate functions and cultural events',
      features: ['Bulk pricing', 'Quick turnaround', 'Consistent quality']
    },
    {
      icon: <Gift className="h-8 w-8 text-gold-500" />,
      title: 'Festival Celebrations',
      description: 'Large group orders for festivals, family reunions, and special occasions',
      features: ['Custom designs', 'Family packages', 'Flexible payment']
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Bulk Orders & Group Packages</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Planning a wedding, corporate event, or family celebration? We specialize in bulk orders 
            with coordinated designs, competitive pricing, and exceptional service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center"
            >
              <div className="flex justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-2xl font-serif mb-4">Ready to Place a Bulk Order?</h3>
          <p className="text-gray-600 mb-6">
            Minimum order of 10 pieces required. Contact us for custom quotes and special arrangements.
          </p>
          <a 
            href="tel:+917989065114" 
            className="inline-flex items-center btn btn-primary"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call for Bulk Orders: +91 79890 65114
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default BulkOrdersSection;