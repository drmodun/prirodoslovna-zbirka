import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { toTokenRole } from './roles';

// The login token (JWT) for a user. Signed with the options AuthModule
// registers: JWT_SECRET, valid 24 hours.
export const signLoginToken = (
  jwt: JwtService,
  user: Pick<User, 'id' | 'email' | 'role'>,
) =>
  jwt.sign({
    id: user.id,
    email: user.email,
    role: toTokenRole(user.role),
  });
