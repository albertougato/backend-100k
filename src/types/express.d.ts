declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
      requestId?: string;
    }
  }
}

export {};
