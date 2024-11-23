import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId?: string | null;
        // Add other properties from Clerk's auth object as needed
        orgId?: string | null;
        sessionId?: string | null;
      };
    }
  }
}

export {}; // This file needs to be a module
