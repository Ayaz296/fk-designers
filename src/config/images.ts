// Centralized Image Configuration
// Update image URLs here to change images throughout the website

export interface ImageConfig {
  // Hero Section Images & Video
  hero: {
    video: {
      mp4: string;
      webm?: string;
    };
    background: string; // Fallback image
    fallback: string;
  };
  
  // About Page Images
  about: {
    hero: string;
    heroFallback: string;
    story: string;
    storyFallback: string;
  };
  
  // Collections Images (Homepage)
  collections: {
    kurta: {
      image: string;
      fallback: string;
    };
    suits: {
      image: string;
      fallback: string;
    };
    sherwani: {
      image: string;
      fallback: string;
    };
  };
  
  // Customization Process Images
  customization: {
    step1Fabric: {
      image: string;
      fallback: string;
    };
    step2Buttons: {
      image: string;
      fallback: string;
    };
    step3Design: {
      image: string;
      fallback: string;
    };
    step4Measurements: {
      image: string;
      fallback: string;
    };
    step5Creation: {
      image: string;
      fallback: string;
    };
  };
  
  // School Uniforms Section
  schoolUniforms: {
    image: string;
    fallback: string;
  };
}

// 🎨 MAIN IMAGE CONFIGURATION
// ========================================
// Update the URLs below to change images throughout your website
// You can use either:
// 1. Custom images: '/images/folder/your-image.jpg' (upload to public/images/)
// 2. Stock photos: Full URLs from Pexels, Unsplash, etc.

export const imageConfig: ImageConfig = {
  // 🏠 HOMEPAGE HERO SECTION
  hero: {
    // Hero video files
    video: {
      mp4: '/images/hero/hero-video.mp4',
      webm: '/images/hero/hero-video.webm', // Optional, better compression
    },
    // Fallback image (shown while video loads or if video fails)
    background: '/images/hero/hero-background.jpg',
    // Backup image if main image fails to load
    fallback: 'https://images.pexels.com/photos/6347547/pexels-photo-6347547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  
  // 📖 ABOUT PAGE IMAGES
  about: {
    // About page hero background
    hero: '/images/about/about-hero.jpg',
    heroFallback: 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    // About story section image
    story: '/images/about/story-image.jpg',
    storyFallback: 'https://images.pexels.com/photos/4620621/pexels-photo-4620621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  
  // 🏷️ HOMEPAGE COLLECTIONS
  collections: {
    kurta: {
      image: '/images/collections/kurta-collection.jpg',
      fallback: 'https://images.pexels.com/photos/1395370/pexels-photo-1395370.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    suits: {
      image: '/images/collections/suits-collection.jpg',
      fallback: 'https://images.pexels.com/photos/1382726/pexels-photo-1382726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    sherwani: {
      image: '/images/collections/sherwani-collection.jpg',
      fallback: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  
  // ✂️ CUSTOMIZATION PROCESS IMAGES
  customization: {
    step1Fabric: {
      image: '/images/customization/step1-fabric.jpg',
      fallback: 'https://images.pexels.com/photos/6292842/pexels-photo-6292842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    step2Buttons: {
      image: '/images/customization/step2-buttons.jpg',
      fallback: 'https://images.pexels.com/photos/4620621/pexels-photo-4620621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    step3Design: {
      image: '/images/customization/step3-design.jpg',
      fallback: 'https://images.pexels.com/photos/2531734/pexels-photo-2531734.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    step4Measurements: {
      image: '/images/customization/step4-measurements.jpg',
      fallback: 'https://images.pexels.com/photos/2767036/pexels-photo-2767036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    step5Creation: {
      image: '/images/customization/step5-creation.jpg',
      fallback: 'https://images.pexels.com/photos/2705511/pexels-photo-2705511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  },
  
  // 🎓 SCHOOL UNIFORMS SECTION
  schoolUniforms: {
    image: '/images/home/school-uniforms/school-uniform.mp4',
    fallback: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
};

// 🔧 UTILITY FUNCTIONS
// ========================================

/**
 * Get image with fallback support
 * @param primary Primary image URL
 * @param fallback Fallback image URL
 * @returns Object with image and fallback URLs
 */
export const getImageWithFallback = (primary: string, fallback: string) => ({
  primary,
  fallback,
  // Helper function for onError handlers
  handleError: (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallback) {
      target.src = fallback;
    }
  }
});


/**
 * Create CSS background image with fallback
 * @param primary Primary image URL
 * @param fallback Fallback image URL
 * @returns CSS background-image string
 */
export const getBackgroundImageWithFallback = (primary: string, fallback: string) => 
  `url('${primary}'), url('${fallback}')`;

/**
 * Get video sources with fallback
 * @param videoConfig Video configuration object
 * @returns Object with video sources and fallback image
 */
export const getVideoWithFallback = (videoConfig: ImageConfig['hero']['video'], fallbackImage: string) => ({
  mp4: videoConfig.mp4,
  webm: videoConfig.webm,
  fallback: fallbackImage
});