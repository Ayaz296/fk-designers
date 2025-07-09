import { apiClient } from '../config/api';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CustomizationRequestData {
  name: string;
  email: string;
  phone: string;
  serviceType: 'custom-tailoring' | 'fabric-selection' | 'design-consultation' | 'alterations';
  description: string;
  budget?: string;
  timeline?: string;
  measurements?: string;
}

export const contactService = {
  async submitContactForm(data: ContactFormData): Promise<{ inquiry_id: number }> {
    return apiClient.post<{ inquiry_id: number }>('/contact/contact', data);
  },

  async submitCustomizationRequest(data: CustomizationRequestData): Promise<{ request_id: number }> {
    return apiClient.post<{ request_id: number }>('/contact/customization', data);
  }
};