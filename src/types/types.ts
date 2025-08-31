export interface RateLimitInfo {
  count: number;
  expiresAt: number;
  violations: number;
  banUntil?: number;
}
