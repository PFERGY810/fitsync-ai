import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export interface AuthContext {
  userId?: string;
  userRole?: 'free' | 'premium';
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    // TODO: Implement actual JWT verification with Supabase
    // For now, we'll use a simple mock validation
    if (token === 'mock-token') {
      c.set('userId', 'mock-user-id');
      c.set('userRole', 'premium');
    } else {
      throw new HTTPException(401, { message: 'Invalid token' });
    }
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    throw new HTTPException(401, { message: 'Authentication failed' });
  }
};

export const requirePremium = async (c: Context, next: Next) => {
  const userRole = c.get('userRole');
  
  if (userRole !== 'premium') {
    throw new HTTPException(403, { message: 'Premium subscription required' });
  }
  
  await next();
};