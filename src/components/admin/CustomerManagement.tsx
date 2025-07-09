import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CustomerManagement: React.FC = () => {
  const { getAllCustomers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerData = await getAllCustomers();
        setCustomers(customerData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [getAllCustomers]);

  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-serif mb-6">Customer Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Customer Management</h2>
        <div className="text-sm text-gray-600">
          {filteredCustomers.length} customers
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.customer_id || customer.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {customer.first_name} {customer.last_name}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  customer.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`mailto:${customer.email}`} className="hover:text-gold-600 transition-colors">
                  {customer.email}
                </a>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`tel:${customer.phone}`} className="hover:text-gold-600 transition-colors">
                  {customer.phone}
                </a>
              </div>

              {customer.address_1 && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{customer.address_1}</div>
                    {customer.address_2 && (
                      <div className="text-gray-500">{customer.address_2}</div>
                    )}
                  </div>
                </div>
              )}

              {customer.date_of_birth && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Born: {formatDate(customer.date_of_birth)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Joined: {formatDate(customer.created_at)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No customers found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;