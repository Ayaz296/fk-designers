import React from 'react';
import AboutHero from '../components/about/AboutHero';
import StorySection from '../components/about/StorySection';
import ValuesSection from '../components/about/ValuesSection';
import TeamSection from '../components/about/TeamSection';

const AboutPage: React.FC = () => {
  return (
    <>
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <TeamSection />
    </>
  );
};

export default AboutPage;