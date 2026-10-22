import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { env } from 'process';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { OptionalStrategy } from './optional-jwt.strategy';
import { ApiTokenStrategy } from './api-token.strategy';
import { ApiTokensModule } from 'src/api-tokens/api-tokens.module';

export const jwtSecret = env.JWT_SECRET;

@Module({
  imports: [
    PassportModule,
    UsersModule,
    ApiTokensModule,
    // Global so that the password reset can log the user in.
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ApiTokenStrategy, OptionalStrategy],
})
export class AuthModule {}
