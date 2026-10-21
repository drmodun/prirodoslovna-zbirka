import { Language } from '@prisma/client';

// The web app sends its interface language as Accept-Language; anything that
// does not ask for Croatian gets English.
export const requestLanguage = (
  acceptLanguage?: string | string[],
): Language => {
  const header = Array.isArray(acceptLanguage)
    ? acceptLanguage[0]
    : acceptLanguage;
  const first = header?.split(',')[0]?.trim().toLowerCase();
  return first?.startsWith('hr') ? 'HR' : 'EN';
};
