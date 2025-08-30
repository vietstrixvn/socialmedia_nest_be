declare global {
  namespace Express {
    interface Request {
      socket: {
        remoteAddress: string | null;
      };
    }
  }
}
