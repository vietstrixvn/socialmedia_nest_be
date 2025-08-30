export interface RateLimitInfo {
  count: number;
  expiresAt: number;
  violations: number;
  banUntil?: number;
}

export interface BaseType {
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}
