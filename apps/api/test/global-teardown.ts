import { rmSync } from 'fs';

export default async function globalTeardown() {
  if (process.env.UPLOAD_DIR?.includes('biosfera-int-'))
    rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
}
