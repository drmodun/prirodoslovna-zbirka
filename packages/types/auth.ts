export interface LoginRequest {
  email: string;
  password: string;
  //possibly use passkey
}

export interface JWTResponse {
  access_token: string;
}

export interface ChangePasswordRequest {
  code: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
