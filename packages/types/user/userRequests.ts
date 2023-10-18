import { LoginRequest } from "../auth";
import { County } from "../enums";

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  location: County;
  profilePicture: string;
}

export interface UpdateUserInfoRequest {
  firstName?: string;
  lastName?: string;
  location?: County;
  profilePicture?: string;
}

