import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Intersection Observer hook to detect when hero is in view
  const { ref: heroRef, inView } = useInView({
    threshold: 0.3, // Play when 30% of the hero is visible
    triggerOnce: false, // Allow multiple triggers
  });

  // Handle video play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView && isVideoLoaded) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [inView, isVideoLoaded]);

  // Handle video load
  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    const video = videoRef.current;
    if (video && inView) {
      video.play().catch(console.error);
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={handleVideoLoad}
        onCanPlayThrough={handleVideoLoad}
      >
        <source src="/images/hero/hero-video.mp4" type="video/mp4" />
        <source src="/images/hero/hero-video.webm" type="video/webm" />
        {/* Fallback image for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>

      {/* Fallback Background Image (shown while video loads or if video fails) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url('/images/hero/hero-background.jpg'), url('https://images.pexels.com/photos/6347547/pexels-photo-6347547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="container-custom relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h5 className="text-gold-400 font-serif mb-4 text-lg sm:text-xl">Elevate Your Elegance</h5>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight">
              Handcrafted Luxury Indian Attire
            </h1>
            <p className="text-gray-200 text-lg sm:text-xl mb-8 leading-relaxed">
              Exquisite collections that blend traditional craftsmanship with contemporary designs. Discover our range of premium ethnic wear for every occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/shop" 
                className="btn btn-primary btn-lg text-center"
              >
                Explore Collection
              </Link>
              <Link 
                to="/about" 
                className="btn btn-lg text-white border border-white hover:bg-white hover:text-neutral-900 transition-colors text-center"
              >
                Our Heritage
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Custom Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 bg-black bg-opacity-20 backdrop-blur-md p-6 sm:p-8 rounded-lg max-w-2xl"
        >
          <h2 className="text-2xl sm:text-3xl font-serif text-white mb-4">Looking for Custom Designs?</h2>
          <p className="text-gray-200 mb-6 text-base sm:text-lg">
            Our expert designers can create bespoke pieces tailored to your preferences. From wedding attire to festival wear, we bring your vision to life.
          </p>
          <Link 
            to="/contact" 
            className="btn btn-primary inline-block"
          >
            Inquire About Custom Orders
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;