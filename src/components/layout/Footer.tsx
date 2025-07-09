import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h4 className="text-gold-500 font-serif text-xl mb-6">FK Designers</h4>
            <p className="text-gray-400 mb-6">
              Discover the essence of Indian heritage through our exquisite clothing collections. Handcrafted with passion and precision for the modern connoisseur.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/f.k.designerandtextiles" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500 transition-colors" 
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/f.k.designerandtextiles/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500 transition-colors" 
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/f.k.designerandtextiles" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500 transition-colors" 
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://www.youtube.com/@f.k.designerandtextiles" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500 transition-colors" 
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75,15.02 15.5,11.75 9.75,8.48"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="text-white font-medium mb-6">Quick Links</h6>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gold-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-gold-500 transition-colors">Shop</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-gold-500 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-gold-500 transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-gold-500 transition-colors">Returns & Exchanges</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h6 className="text-white font-medium mb-6">Categories</h6>
            <ul className="space-y-3">
              <li>
                <Link to="/shop?category=men" className="text-gray-400 hover:text-gold-500 transition-colors">Men's Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=kids" className="text-gray-400 hover:text-gold-500 transition-colors">Kids' Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=fabric" className="text-gray-400 hover:text-gold-500 transition-colors">Fabric Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=all&subcategory=kurta" className="text-gray-400 hover:text-gold-500 transition-colors">Kurta Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=all&subcategory=sherwani" className="text-gray-400 hover:text-gold-500 transition-colors">Sherwani Collection</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h6 className="text-white font-medium mb-6">Contact Us</h6>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gold-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-400">
                  Moosabowli x road, road, Hussaini Alam Rd, Hussaini Alam, Hyderabad, Telangana 500002, India
                </p>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0" />
                <a href="tel:+917989065114" className="text-gray-400 hover:text-gold-500 transition-colors">
                  +91 79890 65114
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@fkdesigners.com" className="text-gray-400 hover:text-gold-500 transition-colors">
                  info@fkdesigners.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} FK Designers. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;