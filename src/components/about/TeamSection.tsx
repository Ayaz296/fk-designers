import React from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';

const TeamSection: React.FC = () => {
  const team = [
    {
      name: 'Farhan Khan',
      position: 'Founder & Creative Director',
      image: 'https://images.pexels.com/photos/2698919/pexels-photo-2698919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      name: 'Priya Sharma',
      position: 'Head Designer',
      image: 'https://images.pexels.com/photos/1034859/pexels-photo-1034859.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      name: 'Vikram Mehta',
      position: 'Master Craftsman',
      image: 'https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      name: 'Aanya Kapoor',
      position: 'Marketing Director',
      image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    }
  ];

  return (
    <section className="py-20">
      <div className="container-custom">
        <SectionTitle 
          title="Meet Our Team" 
          subtitle="The talented individuals behind FK Designers"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div 
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative mb-5 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-gold-100">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h3 className="text-xl font-medium mb-1">{member.name}</h3>
              <p className="text-gold-600">{member.position}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;