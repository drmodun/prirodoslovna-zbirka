import { ExponatExtendedResponse } from "./exponat/exponatResponses";
import { PostResponse } from "./post/postResponse";

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

export interface setApprovalRequest {
  approved: boolean;
}

export interface ApprovalAuthorResponse {
  id: string;
  title: string;
  approved: boolean;
  authorId: string;
  message?: string;
}

export interface IncomingApprovalRequest {
  id: string;
  approved: boolean;
  auhorId: string;
  auhtorName: string;
  entity: Organisation | ExponatExtendedResponse | PostResponse;
}
