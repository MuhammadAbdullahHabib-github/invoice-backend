import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerAttributes {
  id: string;
  name: string;
  email: string;
  contact?: string;
  vehicleNo?: string;
  carModel?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceAttributes {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  customerId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  customFields?: Record<string, string>;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Array<{ field: string; message: string }>;
} 