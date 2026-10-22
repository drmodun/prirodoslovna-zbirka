// Settings for Vansy, the exam platform where quizzes are authored and taken.
// Without VANSY_URL and VANSY_PRIVATE_KEY the integration is off and its
// endpoints answer 503.
export interface VansyConfig {
  // Vansy's API as this server reaches it, e.g. http://vansy-api:5600
  url: string;
  tenantId: string;
  // This app's Ed25519 private JWK; the public half is in Vansy's tenant file
  privateKey: string;
  // Vansy's public JWK for webhook signatures; read from Vansy's JWKS if unset
  publicKey: string | null;
  // Where launches send people back to
  frontendUrl: string;
}

export const VANSY_CONFIG = Symbol('VANSY_CONFIG');

export function readVansyConfig(env = process.env): VansyConfig | null {
  if (!env.VANSY_URL || !env.VANSY_PRIVATE_KEY) return null;

  return {
    url: env.VANSY_URL.replace(/\/$/, ''),
    tenantId: env.VANSY_TENANT_ID || 'zbirka',
    privateKey: env.VANSY_PRIVATE_KEY,
    publicKey: env.VANSY_PUBLIC_KEY || null,
    frontendUrl: (env.WEB_URL || 'http://localhost:3000').replace(/\/$/, ''),
  };
}
