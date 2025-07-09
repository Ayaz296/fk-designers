import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Save, Image as ImageIcon, Star } from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductCategory } from '../../types';

interface AddProductFormProps {
  onProductAdded: () => void;
}

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  isUploaded: boolean;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    category: 'men' as ProductCategory,
    subcategory: '',
    description: '',
    composition: '',
    fabricPattern: '',
    colors: [] as string[],
    featured: false,
    bestSeller: false,
    newArrival: false,
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [newColor, setNewColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subcategoryOptions = {
    men: ['ethnic', 'suits', 'kurta', 'jackets', 'fusion'],
    kids: ['ethnic', 'suits', 'kurta', 'jackets', 'fusion'],
    fabric: ['silk', 'cotton', 'linen', 'wool', 'synthetic']
  };

  const fabricPatternOptions = [
    'Solid', 'Striped', 'Textured', 'Printed', 'Embroidered', 'Jacquard'
  ];

  const compositionOptions = [
    '100% Cotton',
    '100% Silk',
    '100% Linen',
    '100% Wool',
    '70% Cotton, 30% Silk',
    '80% Cotton, 20% Polyester',
    '60% Silk, 40% Cotton',
    '70% Silk, 30% Cotton',
    '80% Wool, 20% Polyester',
    '65% Wool, 35% Cotton',
    '90% Cotton, 10% Elastane',
    'Custom Blend'
  ];

  const colorOptions = [
    'Red', 'Blue', 'Green', 'Black', 'Gold', 'Maroon', 'Pink', 'Navy Blue',
    'Teal', 'Purple', 'Cream', 'White', 'Beige', 'Coral', 'Royal Blue',
    'Burgundy', 'Golden', 'Mint Green', 'Powder Blue', 'Peach', 'Natural',
    'Light Gray', 'Light Blue', 'Charcoal'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ImageFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            url: e.target?.result as string,
            isUploaded: true
          };
          
          setImages(prev => {
            const updated = [...prev, newImage];
            if (prev.length === 0) {
              setCoverImageIndex(0);
            }
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      if (coverImageIndex >= updated.length && updated.length > 0) {
        setCoverImageIndex(updated.length - 1);
      } else if (updated.length === 0) {
        setCoverImageIndex(0);
      }
      return updated;
    });
  };

  const setCoverImage = (index: number) => {
    setCoverImageIndex(index);
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name || !formData.minPrice || !formData.description || !formData.composition) {
        throw new Error('Please fill in all required fields.');
      }

      if (formData.colors.length === 0) {
        throw new Error('Please add at least one color.');
      }

      if (images.length === 0) {
        throw new Error('Please add at least one product image.');
      }

      // Validate price range
      const minPrice = parseFloat(formData.minPrice);
      const maxPrice = formData.maxPrice ? parseFloat(formData.maxPrice) : minPrice;
      
      if (maxPrice < minPrice) {
        throw new Error('Maximum price cannot be less than minimum price.');
      }

      const imageUrls = images.map(img => img.url);

      // Create product data
      const productData = {
        name: formData.name,
        price: minPrice,
        price_min: formData.maxPrice ? minPrice : undefined,
        price_max: formData.maxPrice ? maxPrice : undefined,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        composition: formData.composition,
        fabric_pattern: formData.category === 'fabric' ? formData.fabricPattern : undefined,
        images: imageUrls,
        colors: formData.colors,
        featured: formData.featured,
        best_seller: formData.bestSeller,
        new_arrival: formData.newArrival,
      };

      const response = await productService.createProduct(productData);

      setSuccess(`Product added successfully with ID: ${response.id}!`);
      
      // Reset form
      setFormData({
        name: '',
        minPrice: '',
        maxPrice: '',
        category: 'men',
        subcategory: '',
        description: '',
        composition: '',
        fabricPattern: '',
        colors: [],
        featured: false,
        bestSeller: false,
        newArrival: false,
      });
      setImages([]);
      setCoverImageIndex(0);

      setTimeout(() => {
        onProductAdded();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-serif mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
              required
            >
              <option value="men">Men's</option>
              <option value="kids">Kids'</option>
              <option value="fabric">Fabric</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
              Style *
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
              required
            >
              <option value="">Select Style</option>
              {subcategoryOptions[formData.category as keyof typeof subcategoryOptions]?.map(option => (
                <option key={option} value={option} className="capitalize">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="composition" className="block text-sm font-medium text-gray-700 mb-1">
              Composition *
            </label>
            <select
              id="composition"
              name="composition"
              value={formData.composition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
              required
            >
              <option value="">Select Composition</option>
              {compositionOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fabric Pattern - Only for fabric category */}
        {formData.category === 'fabric' && (
          <div>
            <label htmlFor="fabricPattern" className="block text-sm font-medium text-gray-700 mb-1">
              Fabric Pattern *
            </label>
            <select
              id="fabricPattern"
              name="fabricPattern"
              value={formData.fabricPattern}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
              required={formData.category === 'fabric'}
            >
              <option value="">Select Pattern</option>
              {fabricPatternOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Price (₹) *
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={formData.minPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Price (₹) <span className="text-gray-500">(Optional - leave empty for fixed price)</span>
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={formData.maxPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            required
          />
        </div>

        {/* Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images * 
            <span className="text-xs text-gray-500 ml-2">
              (First image will be the cover photo and thumbnail)
            </span>
          </label>
          
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver 
                ? 'border-gold-500 bg-gold-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gold-600 hover:text-gold-700 font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, GIF (Max 5MB each)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Image Preview ({images.length} images)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative group border-2 rounded-lg overflow-hidden ${
                      index === coverImageIndex 
                        ? 'border-gold-500 ring-2 ring-gold-200' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square">
                      <img
                        src={image.url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Cover Photo Badge */}
                    {index === coverImageIndex && (
                      <div className="absolute top-2 left-2 bg-gold-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Cover
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        {index !== coverImageIndex && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(index)}
                            className="bg-gold-500 text-white p-2 rounded-full hover:bg-gold-600 transition-colors"
                            title="Set as cover photo"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Image Index */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cover Photo Info */}
              <div className="mt-3 p-3 bg-gold-50 rounded-md">
                <p className="text-sm text-gold-700">
                  <ImageIcon className="h-4 w-4 inline mr-1" />
                  <strong>Cover Photo:</strong> Image #{coverImageIndex + 1} will be used as the main product image and thumbnail.
                  Click the star icon on any image to change the cover photo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Colors *
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
            >
              <option value="">Select Color</option>
              {colorOptions.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addColor}
              className="px-3 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.colors.map(color => (
              <span
                key={color}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gold-100 text-gold-700"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="ml-2 text-gold-500 hover:text-gold-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Tags
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm">Featured Product</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bestSeller"
                name="bestSeller"
                checked={formData.bestSeller}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="bestSeller" className="text-sm">Best Seller</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newArrival"
                name="newArrival"
                checked={formData.newArrival}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="newArrival" className="text-sm">New Arrival</label>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Product...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;