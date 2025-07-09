import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
  };

  const handleZoomClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  const handleZoomedImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row md:gap-4">
        {/* Thumbnails */}
        <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-2 md:mt-0 md:w-24">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative cursor-pointer border ${
                selectedImage === index ? 'border-gold-500' : 'border-gray-200'
              } rounded overflow-hidden transition-all`}
              onClick={() => handleImageSelect(index)}
            >
              <div className="aspect-square w-16 md:w-24">
                <img
                  src={image}
                  alt={`${productName} - View ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              {selectedImage === index && (
                <div className="absolute inset-0 bg-gold-500 bg-opacity-10"></div>
              )}
            </div>
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1">
          <div className="relative overflow-hidden rounded-lg cursor-pointer group">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square"
              onClick={handleZoomClick}
            >
              <img
                src={images[selectedImage]}
                alt={productName}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>

            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <motion.div 
                className="text-white bg-black bg-opacity-70 px-4 py-2 rounded-full text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Click to zoom
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoomed Image Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={handleCloseZoom}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={handleCloseZoom}
            >
              <X className="h-8 w-8" />
            </button>
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleZoomedImageMove}
            >
              <div 
                className="relative overflow-hidden cursor-zoom-in"
                style={{
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundSize: '200%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: 'no-repeat',
                  width: '80vw',
                  height: '80vh',
                  maxWidth: '800px',
                  maxHeight: '800px',
                }}
              >
                <img
                  src={images[selectedImage]}
                  alt={productName}
                  className="w-full h-full object-contain opacity-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductGallery;