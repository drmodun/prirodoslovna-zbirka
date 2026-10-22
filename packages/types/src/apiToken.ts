// Personal access tokens. READ allows GET and HEAD requests, WRITE every
// method.
export type ApiTokenScope = "READ" | "WRITE";

export interface ApiTokenResponse {
  id: string;
  name: string;
  // Shown as `bsf_<prefix>…`.
  prefix: string;
  scopes: ApiTokenScope[];
  createdAt: Date;
  // Null: never expires.
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

export interface CreateApiTokenRequest {
  name: string;
  scopes: ApiTokenScope[];
  // Left out: 90 days. Null: never expires.
  expiresInDays?: number | null;
}

// The token itself is only in the answer to its creation.
export interface CreatedApiTokenResponse extends ApiTokenResponse {
  token: string;
}

export interface ApiTokenUsageResponse {
  // YYYY-MM-DD, UTC
  day: string;
  requests: number;
}

export interface RevokeAllApiTokensResponse {
  revoked: number;
}

// A reset logs the user in (when the account is activated) and keeps their
// API tokens, so the web app can offer to revoke them.
export interface ResetPasswordResponse {
  access_token: string | null;
  activeApiTokens: number;
}
