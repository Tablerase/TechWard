export interface User {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  refreshToken?: string;
}

export interface UserTokenPayload {
  userId: string;
  firstName: string;
  lastName: string;
}
