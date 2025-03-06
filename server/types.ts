
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
