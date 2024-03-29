import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlobService } from 'src/blob/blob.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BlobService, EmailService],
  exports: [UsersService],
})
export class UsersModule {}
