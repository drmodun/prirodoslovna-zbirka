import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlobService } from 'src/blob/blob.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BlobService],
  exports: [UsersService],
})
export class UsersModule {}
