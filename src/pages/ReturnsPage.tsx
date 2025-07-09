import React from 'react';
import { motion } from 'framer-motion';

const ReturnsPage: React.FC = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif mb-8">Returns & Exchanges</h1>
          
          <div className="prose max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">Our Return Policy</h2>
              <p className="text-gray-600 mb-4">
                At FK Designers, we want you to be completely satisfied with your purchase. 
                We accept returns and exchanges within 7 days of delivery for items in their original condition.
              </p>
              <p className="text-gray-600 mb-4">
                Please note that custom-made items and altered pieces cannot be returned or exchanged 
                unless they are defective or damaged upon receipt.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">Exchange Process</h2>
              <p className="text-gray-600 mb-4">
                To initiate an exchange:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                <li>Contact our customer service team within 7 days of receiving your order</li>
                <li>Provide your order number and reason for exchange</li>
                <li>Receive return shipping instructions</li>
                <li>Send the item back in its original packaging</li>
                <li>Once received, we'll process your exchange within 3-5 business days</li>
              </ol>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">Conditions for Returns</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Item must be unworn and in original condition</li>
                <li>All original tags must be attached</li>
                <li>Item must be in original packaging</li>
                <li>Proof of purchase is required</li>
                <li>Custom-made items are non-returnable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our return policy or need assistance with a return, 
                please don't hesitate to contact our customer service team:
              </p>
              <ul className="list-none space-y-2 text-gray-600">
                <li>Email: returns@fkdesigners.com</li>
                <li>Phone: +91 98765 43210</li>
                <li>Hours: Monday to Saturday, 10:00 AM - 6:00 PM IST</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnsPage;