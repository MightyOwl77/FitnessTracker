
/**
 * Type definitions for the server
 */

import { Request } from "express";

/**
 * Authenticated request type that includes user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}
import { Request } from 'express';

/**
 * AuthRequest extends Express Request to include JWT token data
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    iat?: number;
    exp?: number;
  };
}

/**
 * Pagination options for list endpoints
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
