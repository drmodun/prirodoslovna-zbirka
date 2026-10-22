import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Like JwtAuthGuard, but lets anonymous requests through. A bad `bsf_` token
// is still refused (see ApiTokenStrategy).
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard([
  'jwt',
  'api-token',
  'optional',
]) {}
