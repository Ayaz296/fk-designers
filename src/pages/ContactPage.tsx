import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '../components/contact/ContactForm';
import ContactInfo from '../components/contact/ContactInfo';

const ContactPage: React.FC = () => {
  return (
    <>
      <section className="pt-24 sm:pt-32 pb-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12 px-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">Contact Us</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We'd love to hear from you. Whether you have a question about our products, custom orders, or anything else, our team is ready to assist you.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-neutral-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="px-4"
          >
            <h2 className="text-2xl font-serif mb-6 text-center">Visit Our Boutique</h2>
            <div className="h-64 sm:h-96 rounded-lg overflow-hidden shadow-md">
              {/* In a real application, this would be an actual map */}
              <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                <p className="text-gray-600">Interactive Map Would Be Here</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;