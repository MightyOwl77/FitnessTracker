
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { storage } from "../storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { userLoginSchema, userRegisterSchema } from "@shared/schema";
import * as bcrypt from "bcryptjs";

// Get JWT_SECRET from environment variables or use a secure default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your_development_jwt_secret_CHANGE_THIS_IN_PRODUCTION';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate user data
    const userData = userRegisterSchema.parse(req.body);
    
    // Check if username is already taken
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user with hashed password
    const newUser = await storage.createUser({
      username: userData.username,
      password: hashedPassword,
    });
    
    // Return user without the password
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

/**
 * Login a user and issue JWT token
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate login data
    const loginData = userLoginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(loginData.username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Compare hashed password
    const passwordValid = await bcrypt.compare(loginData.password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Create and sign JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    const { password, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (req: any, res: Response, next: Function) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};
