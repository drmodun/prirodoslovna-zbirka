import { County } from "../enums";

export class LoginRequest {
  email: string;
  password: string;
}

export class RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  location: County;
  profilePicture: string;
}

export class UpdateUserInfoRequest {
  firstName?: string;
  lastName?: string;
  location?: County;
  profilePicture?: string;
}

export class ChangePasswordRequest {
  code: string;
  newPassword: string;
}

export class ForgotPasswordRequest {
  email: string;
}
