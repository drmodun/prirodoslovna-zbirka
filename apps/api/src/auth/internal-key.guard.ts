import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';

export const INTERNAL_KEY_HEADER = 'x-internal-key';

const digest = (value: string) => createHash('sha256').update(value).digest();

// For requests only the web server makes, such as storing text-to-speech
// recordings while it renders a page for an anonymous visitor. The web server
// sends INTERNAL_API_KEY, which never reaches a browser. Without the key
// configured every request is refused.
@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const expected = process.env.INTERNAL_API_KEY;
    const given = context.switchToHttp().getRequest<Request>().headers[
      INTERNAL_KEY_HEADER
    ];

    // Hashing first gives both sides the same length for the comparison.
    if (
      !expected ||
      typeof given !== 'string' ||
      !timingSafeEqual(digest(given), digest(expected))
    )
      throw new UnauthorizedException();
    return true;
  }
}
