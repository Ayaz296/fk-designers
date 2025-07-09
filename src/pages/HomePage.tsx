import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedCollections from '../components/home/FeaturedCollections';
import NewArrivals from '../components/home/NewArrivals';
import BestSellers from '../components/home/BestSellers';
import FeaturesSection from '../components/home/FeaturesSection';
import BulkOrdersSection from '../components/home/BulkOrdersSection';
import SchoolUniformsSection from '../components/home/SchoolUniformsSection';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <NewArrivals />
      <BestSellers />
      <FeaturesSection />
      <BulkOrdersSection />
      <SchoolUniformsSection />
    </>
  );
};

export default HomePage;