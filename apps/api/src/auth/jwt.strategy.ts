import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { jwtSecret } from './auth.module';

type JwtPayload = {
  id: string;
  email: string;
  role: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('payload', payload);
    const user = await this.usersService.findOne(payload.id);
    console.log(payload, user);

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}