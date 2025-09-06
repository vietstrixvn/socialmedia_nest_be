export type CurrentUser = {
  id: string;
  isActive: boolean;
  isBlocked: boolean;
  username?: string;
  email: string;
};
