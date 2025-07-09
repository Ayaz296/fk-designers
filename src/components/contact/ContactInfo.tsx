import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactInfo: React.FC = () => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm p-8 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-2xl font-serif mb-6">Contact Information</h3>
      
      <div className="space-y-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold-100 text-gold-600">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium mb-1">Visit Our Store</h4>
            <address className="not-italic text-gray-600">
              Moosabowli x road, road, Hussaini Alam Rd,<br />
              Hussaini Alam, Hyderabad, Telangana 500002,<br />
              India
            </address>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold-100 text-gold-600">
              <Phone className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium mb-1">Call Us</h4>
            <p className="text-gray-600">
              <a href="tel:+917989065114" className="hover:text-gold-600 transition-colors">
                +91 79890 65114
              </a>
            </p>
            <p className="text-gray-600">
              <a href="tel:+917989065115" className="hover:text-gold-600 transition-colors">
                +91 79890 65115
              </a>
            </p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold-100 text-gold-600">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium mb-1">Email Us</h4>
            <p className="text-gray-600">
              <a href="mailto:info@fkdesigners.com" className="hover:text-gold-600 transition-colors">
                info@fkdesigners.com
              </a>
            </p>
            <p className="text-gray-600">
              <a href="mailto:support@fkdesigners.com" className="hover:text-gold-600 transition-colors">
                support@fkdesigners.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gold-100 text-gold-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium mb-1">Opening Hours</h4>
            <p className="text-gray-600">Monday - Saturday: 10:00 AM - 8:00 PM</p>
            <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-lg font-medium mb-4">Connect With Us</h4>
        <div className="flex space-x-4">
          <a 
            href="https://www.facebook.com/f.k.designerandtextiles" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-white hover:bg-gold-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a 
            href="https://www.instagram.com/f.k.designerandtextiles/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-white hover:bg-gold-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a 
            href="https://twitter.com/f.k.designerandtextiles" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-white hover:bg-gold-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
          <a 
            href="https://www.youtube.com/@f.k.designerandtextiles" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 text-white hover:bg-gold-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75,15.02 15.5,11.75 9.75,8.48"></polygon>
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;