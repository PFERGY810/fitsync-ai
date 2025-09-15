import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const loggingMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - Started`);
  
  try {
    await next();
    const duration = Date.now() - start;
    const status = c.res.status;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[${new Date().toISOString()}] ${method} ${url} - Error (${duration}ms):`, error);
    throw error;
  }
};

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status);
    }
    
    return c.json({ error: 'Internal server error' }, 500);
  }
};