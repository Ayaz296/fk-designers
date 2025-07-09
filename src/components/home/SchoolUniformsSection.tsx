import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Shield, Star, Mail } from 'lucide-react';
import { imageConfig, getImageWithFallback } from '../../config/images';

const SchoolUniformsSection: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-gold-500" />,
      title: 'Durable Quality',
      description: 'High-quality fabrics that withstand daily wear and frequent washing'
    },
    {
      icon: <Star className="h-6 w-6 text-gold-500" />,
      title: 'Custom Designs',
      description: 'Tailored to your school\'s specific requirements and branding'
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-gold-500" />,
      title: 'All Sizes',
      description: 'Complete size range from kindergarten to senior students'
    }
  ];

  const schoolImage = getImageWithFallback(
    imageConfig.schoolUniforms.image,
    imageConfig.schoolUniforms.fallback
  );

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-6">School Uniforms & Institutional Wear</h2>
            <p className="text-lg text-gray-600 mb-8">
              We also specialize in creating high-quality school uniforms and institutional wear. 
              From traditional school blazers to modern sports uniforms, we ensure comfort, 
              durability, and style for educational institutions.
            </p>

            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 mr-4 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gold-50 p-6 rounded-lg">
              <h4 className="font-medium mb-3">What We Offer:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• School blazers and formal uniforms</li>
                <li>• Sports and PE uniforms</li>
                <li>• Custom embroidery and school logos</li>
                <li>• Bulk pricing for institutions</li>
                <li>• Quick turnaround times</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img 
                src={schoolImage.primary}
                alt="School uniforms and institutional wear" 
                className="w-full h-full object-cover"
                onError={schoolImage.handleError}
              />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-600 mb-1">500+</div>
                <div className="text-sm text-gray-600">Schools Served</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12"
        >
          <h3 className="text-xl font-medium mb-4">Interested in School Uniforms?</h3>
          <p className="text-gray-600 mb-6">
            Contact us for institutional pricing and custom uniform solutions
          </p>
          <a 
            href="mailto:uniforms@fkdesigners.com" 
            className="inline-flex items-center btn btn-primary"
          >
            <Mail className="h-5 w-5 mr-2" />
            Email: uniforms@fkdesigners.com
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SchoolUniformsSection;