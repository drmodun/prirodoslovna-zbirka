export interface LoginRequest {
  email: string;
  password: string;
  //possibly use passkey
}

export interface JWTResponse {
  access_token: string;
}
