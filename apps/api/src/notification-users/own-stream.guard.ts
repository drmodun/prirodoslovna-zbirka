import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// Server-sent event routes send their headers before the handler runs, so a
// check inside the handler cannot answer 401 any more; this guard runs first.
@Injectable()
export class OwnStreamGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.user?.id || req.user.id !== req.params?.userId)
      throw new UnauthorizedException('You can only follow your own stream');
    return true;
  }
}
