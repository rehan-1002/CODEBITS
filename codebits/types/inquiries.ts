/**
 * CodeBits Portal - Institutional Inquiry Domain Types
 */

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  message?: string;
  created_at: string;
}

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  program: string;
  message?: string;
}
