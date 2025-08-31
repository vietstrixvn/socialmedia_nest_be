// user.response.ts
export interface User {
  _id: string;
  fristName: string;
  lastName: string;
  username: string;
  password: string;
  role: string;
  email: string;
  phone_number: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  status: number;
  message: string;
  data: Omit<User, 'password'>;
}

export interface UserDataResponse {
  status: number;
  message: string;
  data: {
    _id: string;
    fristName: string;
    lastName: string;
    username: string;
    role: string;
    email: string;
    phone_number: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export interface UserData {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}
