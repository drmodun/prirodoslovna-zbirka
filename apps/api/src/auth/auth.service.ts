import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async userPasswordLogin(email: string, password: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
        isActivated: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const role =
      user.role === Role.ADMIN
        ? 'admin'
        : user.role === Role.SUPER
          ? 'super'
          : 'user';

    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: role,
    });

    return accessToken;
  }
}
