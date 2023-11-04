import { LoginRequest } from "../auth";
import { County } from "../enums";

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  location: County;
  profileImage: string;
  email: string;
  password: string;
}

export interface UpdateUserInfoRequest {
  firstName?: string;
  lastName?: string;
  location?: County;
  profilePicture?: string;
}

export interface UserQuery {
  name?: string;
  location?: County;
  organisation?: string;
  role?: number;
}
