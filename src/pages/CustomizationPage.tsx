import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Palette, Ruler, Star, Send, CheckCircle } from 'lucide-react';
import { contactService } from '../services/contactService';
import { imageConfig, getImageWithFallback } from '../config/images';

const CustomizationPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    description: '',
    measurements: '',
    budget: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const services = [
    {
      id: 'custom-tailoring',
      title: 'Custom Tailoring',
      description: 'Bring your vision to life with our expert tailors',
      icon: <Scissors className="h-8 w-8 text-gold-500" />,
      features: ['Personal consultation', 'Custom measurements', 'Premium fabrics', 'Perfect fit guarantee']
    },
    {
      id: 'fabric-selection',
      title: 'Fabric Selection',
      description: 'Choose from our premium fabric collection',
      icon: <Palette className="h-8 w-8 text-gold-500" />,
      features: ['Silk varieties', 'Cotton blends', 'Luxury linens', 'Seasonal collections']
    },
    {
      id: 'design-consultation',
      title: 'Design Consultation',
      description: 'Work with our designers to create unique pieces',
      icon: <Star className="h-8 w-8 text-gold-500" />,
      features: ['Style consultation', 'Color coordination', 'Occasion-specific designs', 'Trend insights']
    },
    {
      id: 'alterations',
      title: 'Alterations & Fitting',
      description: 'Perfect fit for your existing garments',
      icon: <Ruler className="h-8 w-8 text-gold-500" />,
      features: ['Size adjustments', 'Style modifications', 'Repair services', 'Modernization']
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Choose Fabric',
      description: 'Select from our premium collection of silk, cotton, and luxury fabrics. Our fabric experts guide you through texture, weight, and seasonal appropriateness to ensure your sherwani not only looks magnificent but feels comfortable.',
      ...getImageWithFallback(imageConfig.customization.step1Fabric.image, imageConfig.customization.step1Fabric.fallback)
    },
    {
      step: '02',
      title: 'Select Buttons & Details',
      description: 'Choose from our exquisite collection of buttons, embroidery patterns, and decorative elements. From traditional gold work to contemporary minimalist designs, every detail is carefully selected to complement your style.',
      ...getImageWithFallback(imageConfig.customization.step2Buttons.image, imageConfig.customization.step2Buttons.fallback)
    },
    {
      step: '03',
      title: 'Design Consultation',
      description: 'Work closely with our master designers to finalize the style, cut, and overall aesthetic. We discuss collar styles, sleeve preferences, and the perfect silhouette that enhances your personality and occasion.',
      ...getImageWithFallback(imageConfig.customization.step3Design.image, imageConfig.customization.step3Design.fallback)
    },
    {
      step: '04',
      title: 'Precise Measurements',
      description: 'Our master tailors take over 20 detailed measurements to ensure a perfect fit. From chest and shoulder width to sleeve length and collar height, every dimension is carefully recorded for your custom sherwani.',
      ...getImageWithFallback(imageConfig.customization.step4Measurements.image, imageConfig.customization.step4Measurements.fallback)
    },
    {
      step: '05',
      title: 'Final Creation',
      description: 'Expert craftsmanship brings your custom front-open sherwani to life. Our skilled artisans hand-stitch every detail, ensuring impeccable quality and a garment that will be treasured for generations.',
      ...getImageWithFallback(imageConfig.customization.step5Creation.image, imageConfig.customization.step5Creation.fallback)
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await contactService.submitCustomizationRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceType: formData.serviceType as any,
        description: formData.description,
        budget: formData.budget || undefined,
        timeline: formData.timeline || undefined,
        measurements: formData.measurements || undefined
      });

      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        description: '',
        measurements: '',
        budget: '',
        timeline: ''
      });
      setSelectedService('');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced animation variants for smoother scroll-triggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const serviceCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const stepCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 80,
        damping: 20
      }
    }
  };

  const stepNumberVariants = {
    hidden: { 
      scale: 0, 
      rotate: -180,
      opacity: 0
    },
    visible: { 
      scale: 1, 
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3,
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      x: -60
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        delay: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const progressBarVariants = {
    hidden: { width: '0%' },
    visible: (index: number) => ({
      width: `${((index + 1) / processSteps.length) * 100}%`,
      transition: {
        duration: 1.2,
        delay: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  return (
    <div className="pt-20 sm:pt-24 pb-20">
      <div className="container-custom">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12 sm:mb-16 px-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 sm:mb-6">Custom Tailoring & Design</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your vision into reality with our bespoke tailoring services. From custom designs to perfect alterations, 
            we ensure every piece is crafted to your exact specifications and measurements.
          </p>
        </motion.div>

        {/* Services Grid with Enhanced Animations */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={serviceCardVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white p-6 rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                selectedService === service.id 
                  ? 'border-gold-500 bg-gold-50 shadow-gold' 
                  : 'border-gray-200 hover:border-gold-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <motion.div 
                className="text-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {service.icon}
              </motion.div>
              <h3 className="text-xl font-medium mb-2 text-center">{service.title}</h3>
              <p className="text-gray-600 text-center mb-4">{service.description}</p>
              <ul className="space-y-1">
                {service.features.map((feature, idx) => (
                  <motion.li 
                    key={idx} 
                    className="text-sm text-gray-500 flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2"></span>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline Process - Enhanced with Smoother Animations */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 sm:mb-16"
        >
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl font-serif mb-4">Our Customization Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the journey from concept to creation with our meticulous 5-step process, 
              featuring our signature front-open sherwani design.
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={stepCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-150px" }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl group"
              >
                {/* Large Background Image */}
                <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh]">
                  <motion.img 
                    src={step.primary} 
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={step.handleError}
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                  
                  {/* Step Number - Enhanced Animation */}
                  <motion.div
                    variants={stepNumberVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                    className="absolute top-4 sm:top-8 right-4 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 bg-gold-500 text-white rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold shadow-lg"
                  >
                    {step.step}
                  </motion.div>
                  
                  {/* Content Overlay - Enhanced Animation */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-xl sm:max-w-2xl mx-4 sm:mx-8 md:mx-16 text-white">
                      <motion.h3
                        variants={contentVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-4 sm:mb-6 leading-tight"
                      >
                        {step.title}
                      </motion.h3>
                      
                      <motion.p
                        variants={contentVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-200"
                      >
                        {step.description}
                      </motion.p>
                      
                      {/* Decorative Line - Enhanced Animation */}
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        whileInView={{ width: '80px', opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 1, 
                          delay: 0.8,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className="h-1 bg-gold-500 mt-4 sm:mt-6 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Bottom Progress Indicator - Enhanced Animation */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-2 bg-black/30">
                    <motion.div
                      variants={progressBarVariants}
                      custom={index}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Request Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-serif text-center mb-6 sm:mb-8">Request Custom Service</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type *
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="custom-tailoring">Custom Tailoring</option>
                    <option value="fabric-selection">Fabric Selection</option>
                    <option value="design-consultation">Design Consultation</option>
                    <option value="alterations">Alterations & Fitting</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your vision, occasion, style preferences, and any specific requirements..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-10k">Under ₹10,000</option>
                    <option value="10k-25k">₹10,000 - ₹25,000</option>
                    <option value="25k-50k">₹25,000 - ₹50,000</option>
                    <option value="50k-100k">₹50,000 - ₹1,00,000</option>
                    <option value="above-100k">Above ₹1,00,000</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                    Required Timeline
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="1-2-weeks">1-2 weeks</option>
                    <option value="3-4-weeks">3-4 weeks</option>
                    <option value="1-2-months">1-2 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="measurements" className="block text-sm font-medium text-gray-700 mb-1">
                  Measurements & Additional Notes
                </label>
                <textarea
                  id="measurements"
                  name="measurements"
                  value={formData.measurements}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Include any measurements you have, inspiration images, or additional requirements..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                />
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">Thank you for your customization request! We will contact you within 24 hours to discuss your requirements.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </div>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Customization Request
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12 sm:mt-16 px-4"
        >
          <h3 className="text-xl sm:text-2xl font-serif mb-4">Need to Discuss Your Project?</h3>
          <p className="text-gray-600 mb-6">
            Our design consultants are available for in-person or virtual consultations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+917989065114" className="btn btn-outline">
              Call: +91 79890 65114
            </a>
            <a href="mailto:custom@fkdesigners.com" className="btn btn-primary">
              Email: custom@fkdesigners.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomizationPage;